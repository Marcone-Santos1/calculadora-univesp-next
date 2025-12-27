"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";

interface NativeAdCardProps {
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

export default function NativeAdCard({ ad }: NativeAdCardProps) {
    const trackingUrl = `/api/ad-click?adId=${ad.id}&campaignId=${ad.campaignId}&dest=${encodeURIComponent(ad.destinationUrl)}`;

    return (
        <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block group mb-4"
        >
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:border-blue-500/50 transition-colors relative">
                {/* Ad Tag */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-medium z-10 backdrop-blur-sm">
                    <span>Promovido por {ad.advertiserName || "Parceiro"}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                </div>

                <div className="flex flex-col sm:flex-row">
                    {/* Image - Fixed aspect ratio container */}
                    <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-zinc-100 dark:bg-zinc-800">
                        <Image
                            src={ad.imageUrl}
                            alt={ad.headline}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
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
