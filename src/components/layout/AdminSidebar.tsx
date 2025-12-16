'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    ShoppingCart,
    Users,
    Settings,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

const MENU_ITEMS = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: ShoppingBag, label: 'Produk' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Pesanan' },
    { href: '/admin/users', icon: Users, label: 'Pengguna' },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const logout = useAuthStore(state => state.logout);

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold text-blue-600">PrintWere Admin</span>
            </div>

            <nav className="space-y-1 p-4">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href}>
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
                    onClick={() => logout()}
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
