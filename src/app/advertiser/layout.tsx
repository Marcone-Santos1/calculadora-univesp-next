import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaChartBar, FaBullhorn, FaCreditCard, FaCog } from "react-icons/fa";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdvertiserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login?callbackUrl=/advertiser/dashboard");
    }

    // Optional: Check if user has advertiser profile or is allowed.
    // We can auto-create basic profile on first access in the dashboard or here.

    const navItems = [
        { name: "Visão Geral", icon: FaChartBar, href: "/advertiser/dashboard" },
        { name: "Campanhas", icon: FaBullhorn, href: "/advertiser/campaigns" },
        { name: "Financeiro", icon: FaCreditCard, href: "/advertiser/dashboard/finance" }, // Reusing dashboard route or new one
        { name: "Configurações", icon: FaCog, href: "/advertiser/dashboard/settings" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        A
                    </div>
                    <span className="font-bold text-lg dark:text-white">Anunciantes</span>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
