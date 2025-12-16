'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, Search, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const cartItemsCount = useCartStore((state) => state.totalItems());
    const { user, isAuthenticated, logout } = useAuthStore();

    // Handle hydration mismatch for persist store
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!mounted) return null;

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full bg-white transition-all',
                isScrolled ? 'border-b shadow-sm py-2' : 'py-4'
            )}
        >
            <div className="container mx-auto flex items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <Printer className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        PrintWere
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                        Beranda
                    </Link>
                    <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                        Produk
                    </Link>
                    <Link href="/track-order" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                        Lacak Pesanan
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative text-gray-600">
                            <ShoppingCart className="h-5 w-5" />
                            {cartItemsCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-4">
                            <Link href={user.role === 'ADMIN' ? '/admin/dashboard' : '/orders'}>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="hidden sm:inline">{user.name}</span>
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => logout()}>
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Masuk
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Daftar</Button>
                            </Link>
                        </div>
                    )}

                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
