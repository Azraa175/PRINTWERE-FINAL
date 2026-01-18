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
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';

const MENU_ITEMS = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: ShoppingBag, label: 'Produk' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Pesanan' },
    { href: '/admin/users', icon: Users, label: 'Pengguna' },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const storeLogout = useAuthStore(state => state.logout);
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
                className="fixed left-4 top-4 z-50 md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X /> : <Menu />}
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
                    "fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center border-b px-6">
                    <span className="text-xl font-bold text-blue-600">PrintWere Admin</span>
                </div>

                <nav className="space-y-1 p-4">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
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
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-4 left-0 w-full px-4 text-center">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <LogOut className="h-5 w-5" />
                        )}
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </Button>
                </div>
            </aside>
        </>
    );
}
