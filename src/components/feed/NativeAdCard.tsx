"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";

import { useEffect, useRef } from "react";
import { trackAdView } from "@/actions/ad-engine";

interface NativeAdCardProps {
    ad: {
        id: string;
        headline: string;
        description: string;
        imageUrl: string | null;
        destinationUrl: string;
        advertiserName: string | null;
        campaignId: string;
    };
}

export default function NativeAdCard({ ad }: NativeAdCardProps) {
    const trackingUrl = `/api/ad-click?adId=${ad.id}&campaignId=${ad.campaignId}&dest=${encodeURIComponent(ad.destinationUrl)}`;
    const hasTracked = useRef(false);

    useEffect(() => {
        if (!hasTracked.current) {
            hasTracked.current = true;
            trackAdView(ad.id, ad.campaignId).catch(console.error);
        }
    }, [ad.id, ad.campaignId]);

    return (
        <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="block group mb-4"
        >
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:border-blue-500/50 transition-colors relative">
                {/* Ad Tag */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-medium z-10 backdrop-blur-sm">
                    <span>Promovido por {ad.advertiserName || "Parceiro"}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                </div>

                <div className="flex flex-col sm:flex-row">
                    {/* Image — always reserves space to prevent CLS */}
                    <div className="relative w-full sm:w-48 aspect-video sm:aspect-auto sm:h-auto shrink-0 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        {ad.imageUrl ? (
                            <Image
                                src={ad.imageUrl}
                                alt={ad.headline}
                                fill
                                sizes="(max-width: 640px) 100vw, 192px"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col justify-center gap-2">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {ad.headline}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                            {ad.description}
                        </p>
                        <div className="mt-2 text-xs text-zinc-500 font-medium uppercase tracking-wider">
                            Saiba Mais &rarr;
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
}
