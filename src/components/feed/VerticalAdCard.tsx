"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";

import { useEffect, useRef } from "react";
import { trackAdView } from "@/actions/ad-engine";

interface VerticalAdCardProps {
    ad: {
        id: string;
        headline: string;
        description: string;
        imageUrl: string;
        destinationUrl: string;
        advertiserName: string | null;
        campaignId: string;
    };
}

export default function VerticalAdCard({ ad }: VerticalAdCardProps) {
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
            className="block group mb-4 w-full"
        >
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:border-blue-500/50 transition-colors relative flex flex-col">
                {/* Ad Tag */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-medium z-10 backdrop-blur-sm">
                    <span>Promovido por {ad.advertiserName || "Parceiro"}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                </div>

                {/* Image - Vertical aspect ratio container */}
                {ad.imageUrl && (
                    <div className="relative w-full h-40 shrink-0 bg-zinc-100 dark:bg-zinc-800">
                        <Image
                            src={ad.imageUrl}
                            alt={ad.headline}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-4 flex flex-col gap-2 flex-grow">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {ad.headline}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                        {ad.description}
                    </p>
                    <div className="mt-auto pt-4 text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-center w-full border-t border-zinc-100 dark:border-zinc-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                        Saiba Mais
                    </div>
                </div>
            </div>
        </a>
    );
}
