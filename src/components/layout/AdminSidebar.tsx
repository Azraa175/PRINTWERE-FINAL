'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    ShoppingCart,
    Users,
    LogOut,
    Menu,
    X,
    Loader2,
    Printer,
    Home,
    ArrowLeft,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { useAdminStats } from '@/hooks/useAdminOrders';

const MENU_ITEMS = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: ShoppingBag, label: 'Produk' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Pesanan' },
    { href: '/admin/users', icon: Users, label: 'Pengguna' },
    { href: '/staff/queue', icon: Printer, label: 'Produksi' },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout: storeLogout } = useAuthStore();
    const { stats } = useAdminStats();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut({ redirect: false });
            storeLogout();
            toast.success('Berhasil logout');
            router.push('/login');
        } catch (error) {
            toast.error('Gagal logout');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            {/* Mobile Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed left-4 top-4 z-50 md:hidden bg-white shadow-sm border border-slate-200"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Navigation"
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col justify-between",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div>
                    {/* Brand Header with Clickable Link to Homepage */}
                    <div className="flex h-16 items-center justify-between border-b px-4">
                        <Link 
                            href="/" 
                            className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
                            title="Klik untuk kembali ke Beranda PrintWere"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                                <Printer className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        PrintWere
                                    </span>
                                    <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-700">
                                        ADMIN
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-400 group-hover:text-blue-600 flex items-center gap-0.5">
                                    ← Beranda Toko
                                </span>
                            </div>
                        </Link>

                        {/* Mobile Close Button */}
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Quick Store Link Button */}
                    <div className="px-3 pt-3">
                        <Link 
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 rounded-lg transition-all group"
                        >
                            <Home className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            <span>Lihat Toko</span>
                            <ArrowLeft className="h-3 w-3 ml-auto text-slate-400 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    {/* Main Navigation */}
                    <nav className="space-y-1 p-3">
                        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Menu Utama
                        </p>
                        {MENU_ITEMS.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            const isOrdersMenu = item.href === '/admin/orders';
                            const waitingCount = stats?.waitingVerification || 0;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                        )}
                                    >
                                        <item.icon className={cn('h-5 w-5', isActive ? 'text-blue-600' : 'text-slate-400')} />
                                        <span>{item.label}</span>
                                        {isOrdersMenu && waitingCount > 0 && (
                                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white shadow-2xs">
                                                {waitingCount}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer User Info & Logout */}
                <div className="border-t border-slate-200 p-3 space-y-2 bg-slate-50/50">
                    {user && (
                        <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                            <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 bg-white"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <LogOut className="h-4 w-4" />
                        )}
                        {isLoggingOut ? 'Logging out...' : 'Keluar / Logout'}
                    </Button>
                </div>
            </aside>
        </>
    );
}
