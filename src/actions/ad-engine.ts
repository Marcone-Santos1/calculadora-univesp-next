"use server";

import { prisma as db } from "@/lib/prisma";
import { AdCampaignStatus, AdTransactionStatus, AdTransactionType, AdBillingType, AdEventType } from "@prisma/client";
import { executeWithRetry } from "@/lib/prisma-utils";
import { rateLimit } from "@/lib/rate-limit";

// Normalize bid to expected value per impression (EVI) for comparison
// CPC: Bid * CTR (Est. 1% if unknown)
// CPM: Bid / 1000
const ESTIMATED_CTR = 0.015; // 1.5% conservative estimate

export async function fetchNextAd(subjectId?: string) {
    // 1. Fetch Candidates (Active, Budget > 0)
    const campaigns = await db.adCampaign.findMany({
        where: {
            status: AdCampaignStatus.ACTIVE,
            advertiser: {
                balance: { gt: 0 },
            },
            startDate: { lte: new Date() },
            OR: [
                { endDate: null },
                { endDate: { gte: new Date() } }
            ],
            AND: [
                {
                    OR: subjectId
                        ? [{ targetSubjects: { none: {} } }, { targetSubjects: { some: { id: subjectId } } }]
                        : [{ targetSubjects: { none: {} } }]
                }
            ],
            creatives: { some: {} } // Must have at least one creative
        },
        include: {
            creatives: true,
            targetSubjects: true,
            advertiser: {
                select: { companyName: true, balance: true }
            }
        }
    });

    if (campaigns.length === 0) return null;

    // 2. Filter by Priority (Keep only highest priority available)
    const maxPriority = Math.max(...campaigns.map(c => c.priority));
    const priorityCandidates = campaigns.filter(c => c.priority === maxPriority);

    // 3. Calculate Weights (Auction Score)
    const weightedCandidates = priorityCandidates.map(campaign => {
        const creative = campaign.creatives[0]; // Simplified: take first creative

        // Check budget availability
        const costPerEvent = campaign.billingType === 'CPC' ? campaign.costValue : Math.ceil(campaign.costValue / 1000);
        if (campaign.advertiser.balance < costPerEvent) return null;

        let weight = 0;
        if (campaign.billingType === 'CPM') {
            weight = campaign.costValue / 1000; // Value per view
        } else {
            // CPC
            weight = campaign.costValue * ESTIMATED_CTR; // Value per view (estimated)
        }

        // Boost factor (optional, can be random noise to ensure rotation)
        weight = weight * (0.8 + Math.random() * 0.4);

        // Contextual boost
        if (subjectId && campaign.targetSubjects?.some((s: any) => s.id === subjectId)) {
            weight = weight * 5; // 5x boost for highly relevant contextual ads
        }

        return { campaign, creative, weight };
    }).filter(items => items !== null) as { campaign: any, creative: any, weight: number }[];

    if (weightedCandidates.length === 0) return null;

    // 4. Weighted Random Selection
    const totalWeight = weightedCandidates.reduce((sum, item) => sum + item.weight, 0);
    let randomVal = Math.random() * totalWeight;
    let selected = weightedCandidates[0];

    for (const item of weightedCandidates) {
        randomVal -= item.weight;
        if (randomVal <= 0) {
            selected = item;
            break;
        }
    }

    const { campaign, creative } = selected;

    // 5. Track View (Async) - Record metric but charge mostly on click (unless CPM)
    // For CPM, we charge here (or accumulate). For MVP: Charge logic is in trackAdEvent.
    // Here we just return the ad.
    // NOTE: We do NOT charge balance here to avoid blocking and "over-charging" on refresh.
    // Proper tracking should be client-side beacon calling `trackAdEvent`.
    // But existing implementation did:
    // await db.adCreative.update({ where: { id: creative.id }, data: { views: { increment: 1 } } });

    // We will defer view counting to the feed injection or explicit view beacon if possible.
    // For now, let's keep it consistent: The caller (Questions Page) records the view via `getAdsForFeed`.

    return {
        ...creative,
        campaignId: campaign.id,
        advertiserName: campaign.advertiser.companyName,
        costValue: campaign.costValue,
        billingType: campaign.billingType,
    };
}

export async function getAdsForFeed(count: number = 1, subjectId?: string) {
    const ads = [];
    // We run the selection 'count' times.
    // Optimization: Exclude picked campaigns to avoid repeats in same feed?
    // User requested "No duplicates".

    // We can't easily re-query every time. Let's fetch all and simulate.
    const campaigns = await db.adCampaign.findMany({
        where: {
            status: AdCampaignStatus.ACTIVE,
            startDate: { lte: new Date() },
            OR: [
                { endDate: null },
                { endDate: { gte: new Date() } }
            ],
            AND: [
                {
                    OR: subjectId
                        ? [{ targetSubjects: { none: {} } }, { targetSubjects: { some: { id: subjectId } } }]
                        : [{ targetSubjects: { none: {} } }]
                }
            ],
            advertiser: { balance: { gt: 0 } },
            creatives: { some: {} }
        },
        include: {
            creatives: true,
            targetSubjects: true,
            advertiser: { select: { companyName: true, balance: true } }
        }
    });

    if (campaigns.length === 0) return [];

    let availableCreatives = campaigns.flatMap(c =>
        c.creatives.map(creative => ({ campaign: c, creative }))
    );

    for (let i = 0; i < count; i++) {
        if (availableCreatives.length === 0) {
            break; // Stop instead of refilling to prevent duplicate creatives
        }

        // Weighted Selection Logic on 'availableCreatives'
        const maxPriority = Math.max(...availableCreatives.map(c => c.campaign.priority));
        const candidates = availableCreatives.filter(c => c.campaign.priority === maxPriority);

        const weighted = candidates.map(c => {
            let weight = c.campaign.billingType === 'CPM' ? c.campaign.costValue / 1000 : c.campaign.costValue * ESTIMATED_CTR;
            weight = weight * (0.8 + Math.random() * 0.4);

            // Contextual boost
            if (subjectId && c.campaign.targetSubjects.some(s => s.id === subjectId)) {
                weight = weight * 5;
            }

            return { item: c, weight };
        });

        const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
        let randomVal = Math.random() * totalWeight;
        let picked = weighted[0];

        for (const item of weighted) {
            randomVal -= item.weight;
            if (randomVal <= 0) {
                picked = item;
                break;
            }
        }

        const { campaign, creative } = picked.item;

        ads.push({
            ...creative,
            campaignId: campaign.id,
            advertiserName: campaign.advertiser.companyName,
            costValue: campaign.costValue,
            billingType: campaign.billingType,
        });

        // Remove used creative to prevent duplicates
        const index = availableCreatives.findIndex(c => c.creative.id === creative.id);
        if (index > -1) availableCreatives.splice(index, 1);
    }

    return ads;
}

// Internal Helper for Charging
async function processAdCharge(campaignId: string, creativeId: string, advertiserId: string, amount: number, type: 'CLICK' | 'VIEW') {
    try {
        await db.$transaction(async (tx) => {
            // Deduct Balance
            const updatedProfile = await tx.advertiserProfile.update({
                where: { id: advertiserId },
                data: { balance: { decrement: amount } }
            });

            // Log Transaction (SPEND)
            await tx.adTransaction.create({
                data: {
                    advertiserId,
                    type: AdTransactionType.SPEND,
                    amount,
                    status: AdTransactionStatus.COMPLETED,
                    metadata: { type, campaignId, creativeId }
                }
            });

            // Update Daily Metrics (SPEND ONLY)
            // Views and Clicks are tracked separately to ensure accuracy and avoid double counting
            await tx.adDailyMetrics.upsert({
                where: { campaignId_date: { campaignId: campaignId, date: new Date(new Date().toDateString()) } },
                create: { campaignId, date: new Date(new Date().toDateString()), spend: amount, views: 0, clicks: 0 },
                update: { spend: { increment: amount } }
            });

            await tx.adCreativeDailyMetrics.upsert({
                where: { creativeId_date: { creativeId: creativeId, date: new Date(new Date().toDateString()) } },
                create: { creativeId, date: new Date(new Date().toDateString()), spend: amount, views: 0, clicks: 0 },
                update: { spend: { increment: amount } }
            });

            // Log Granular Event (This acts as the 'audit trail' for the charge)
            await tx.adEventLog.create({
                data: {
                    campaignId,
                    creativeId,
                    type: type == 'CLICK' ? AdEventType.CLICK : AdEventType.VIEW,
                    cost: amount
                }
            });

            // Check Budget
            if (updatedProfile.balance <= 0) {
                await tx.adCampaign.updateMany({
                    where: { advertiserId: advertiserId, status: AdCampaignStatus.ACTIVE },
                    data: { status: AdCampaignStatus.OUT_OF_BUDGET }
                });
            }
        });
    } catch (e) {
        console.error("Failed to charge ad", e);
    }
}

export async function trackAdClick(adId: string, campaignId: string) {
    try {
        const campaign = await db.adCampaign.findUnique({
            where: { id: campaignId },
            include: { advertiser: true, creatives: true }
        });
        if (!campaign) return { success: false };

        // 1. Always increment Click Counts (Metrics & Creative)
        // We do this parallel to charging
        await db.$transaction([
            db.adCreative.update({
                where: { id: adId },
                data: { clicks: { increment: 1 } }
            }),
            db.adDailyMetrics.upsert({
                where: { campaignId_date: { campaignId: campaign.id, date: new Date(new Date().toDateString()) } },
                create: { campaignId: campaign.id, date: new Date(new Date().toDateString()), views: 0, clicks: 1, spend: 0 },
                update: { clicks: { increment: 1 } }
            }),
            db.adCreativeDailyMetrics.upsert({
                where: { creativeId_date: { creativeId: adId, date: new Date(new Date().toDateString()) } },
                create: { creativeId: adId, date: new Date(new Date().toDateString()), views: 0, clicks: 1, spend: 0 },
                update: { clicks: { increment: 1 } }
            })
        ]);

        // 2. Handle Charging if CPC
        if (campaign.billingType === 'CPC') {
            // Charge the cost per click
            // Note: In a high-concurrency real world app, we'd queue this.
            // For now, simple await is fine.
            await processAdCharge(campaign.id, adId, campaign.advertiserId, campaign.costValue, 'CLICK');
        } else {
            // For CPM, we still want to log the CLICK event, even if cost is 0?
            // Maybe for analysis/CTR auditing.
            // Let's create a 0 cost event log for non-charged clicks (e.g. CPM campaign clicks).
            await db.adEventLog.create({
                data: {
                    campaignId,
                    creativeId: adId,
                    type: AdEventType.CLICK,
                    cost: 0
                }
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Ad Click tracking failed", error);
        return { success: false };
    }
}

export async function trackAdView(adId: string, campaignId: string) {
    // 🛡️ Rate limit: máximo 60 visualizações por minuto por criativo
    const { success: allowed } = rateLimit(`ad-view:${adId}`, 60, 60_000);
    if (!allowed) return { success: false };

    try {
        const campaign = await db.adCampaign.findUnique({
            where: { id: campaignId },
            include: { advertiser: true } // Need advertiserId for charging
        });

        if (!campaign) return { success: false };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Basic view increment with retry
        // We use executeWithRetry to handle potential concurency locks on counters
        await executeWithRetry(() => db.adCreative.update({
            where: { id: adId },
            data: { views: { increment: 1 } }
        }));

        // Fire and forget metrics updates to don't slow down too much?
        // Actually since this is now a dedicated action called by valid client, we can await to ensure it counts.
        // But we should optimize.

        await Promise.all([
            executeWithRetry(() => db.adDailyMetrics.upsert({
                where: { campaignId_date: { campaignId: campaign.id, date: today } },
                create: { campaignId: campaign.id, date: today, views: 1 },
                update: { views: { increment: 1 } }
            })),
            executeWithRetry(() => db.adCreativeDailyMetrics.upsert({
                where: { creativeId_date: { creativeId: adId, date: today } },
                create: { creativeId: adId, date: today, views: 1 },
                update: { views: { increment: 1 } }
            }))
        ]);

        // CPM Billing Logic:
        if (campaign.billingType === 'CPM') {
            const chance = campaign.costValue / 1000;
            const baseCharge = Math.floor(chance);
            const remainder = chance - baseCharge;
            let chargeAmount = baseCharge;
            if (Math.random() < remainder) chargeAmount += 1;

            if (chargeAmount > 0) {
                // Here we might risk "Double charging" if user triggers multiple views?
                // Client side effect should have a "hasSentView" check.
                await processAdCharge(campaign.id, adId, campaign.advertiserId, chargeAmount, 'VIEW');
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Ad View tracking failed", error);
        // Fail silently to client
        return { success: false };
    }
}

