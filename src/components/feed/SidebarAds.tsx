import VerticalAdCard from "./VerticalAdCard";

interface SidebarAdsProps {
    ads: any[];
}

export default function SidebarAds({ ads }: SidebarAdsProps) {
    if (!ads || ads.length === 0) {
        return null;
    }

    return (
        <div className="hidden min-[1680px]:block">
            {/* Left Sidebar Ad */}
            {ads[0] && (
                <div className="fixed left-[calc(50%-640px-216px)] top-24 w-48 z-40">
                    {/* Ads container */}
                    <div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest mb-2 block text-center">Publicidade</span>
                        <VerticalAdCard ad={ads[0]!} />
                    </div>
                </div>
            )}

            {/* Right Sidebar Ad */}
            {ads[1] && (
                <div className="fixed right-[calc(50%-640px-216px)] top-24 w-48 z-40">
                    <div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest mb-2 block text-center">Publicidade</span>
                        <VerticalAdCard ad={ads[1]!} />
                    </div>
                </div>
            )}
        </div>
    );
}
