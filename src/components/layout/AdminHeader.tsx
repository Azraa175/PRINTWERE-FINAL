'use client';

import Link from 'next/link';
import { Home, ShieldCheck, Printer, ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { OrderNotification } from '@/components/layout/OrderNotification';
import { usePathname } from 'next/navigation';

export function AdminHeader() {
    const { user } = useAuthStore();
    const pathname = usePathname();

    const getPageTitle = () => {
        if (pathname === '/admin/dashboard') return 'Dashboard';
        if (pathname.startsWith('/admin/orders')) return 'Pesanan Masuk';
        if (pathname.startsWith('/admin/products')) return 'Katalog Produk';
        if (pathname.startsWith('/admin/users')) return 'Manajemen Pengguna';
        return 'Panel Admin';
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-8 backdrop-blur-sm">
            {/* Left: Page Title Context */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            PrintWere Admin
                        </span>
                        <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-700">
                            v2.0
                        </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        {getPageTitle()}
                    </h2>
                </div>
            </div>

            {/* Right: Notification Bell + Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Admin Order Notification Bell */}
                <div className="flex items-center">
                    <OrderNotification variant="admin" />
                </div>

                {/* Staff Production Shortcut */}
                <Link
                    href="/staff/queue"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
                >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Produksi</span>
                </Link>

                {/* Visit Store Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    title="Buka Halaman Depan Toko"
                >
                    <Home className="h-3.5 w-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Lihat Toko</span>
                    <ArrowUpRight className="h-3 w-3 text-slate-400" />
                </Link>

                {/* User Info Avatar */}
                {user && (
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-2xs">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[120px]">
                                {user.name}
                            </p>
                            <span className="text-[10px] text-slate-400">Administrator</span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

