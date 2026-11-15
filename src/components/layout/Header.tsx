'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, X, Printer, ShieldCheck, ChevronRight, Package, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { OrderNotification } from '@/components/layout/OrderNotification';

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const cartItemsCount = useCartStore((state) => state.totalItems());
    const { user, isAuthenticated, logout: storeLogout } = useAuthStore();

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

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Conditional rendering AFTER hooks
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    if (!mounted) return null;

    const handleLogout = async () => {
        try {
            await signOut({ redirect: false });
            storeLogout();
            toast.success('Berhasil logout');
            router.push('/login');
        } catch {
            toast.error('Gagal logout');
        }
    };

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md transition-all',
                isScrolled ? 'border-b border-slate-200 shadow-xs py-2.5' : 'py-3.5 border-b border-slate-100'
            )}
        >
            <div className="container mx-auto flex items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                        <Printer className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            PrintWere
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
                            Percetakan Digital
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex items-center gap-7">
                    <Link 
                        href="/" 
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-blue-600",
                            pathname === '/' ? "text-blue-600 font-semibold" : "text-slate-600"
                        )}
                    >
                        Beranda
                    </Link>
                    <Link 
                        href="/products" 
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-blue-600",
                            pathname.startsWith('/products') ? "text-blue-600 font-semibold" : "text-slate-600"
                        )}
                    >
                        Produk
                    </Link>
                    {isAuthenticated && (
                        <Link 
                            href="/my-orders" 
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-blue-600",
                                pathname.startsWith('/my-orders') ? "text-blue-600 font-semibold" : "text-slate-600"
                            )}
                        >
                            Pesanan
                        </Link>
                    )}
                </nav>

                {/* Right Actions (Buttons for Admin, Staff & Customer) */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Order Notification Bell */}
                    {isAuthenticated && <OrderNotification />}

                    {/* Cart Icon */}
                    <Link href="/cart">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="relative text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-full h-9 w-9"
                            aria-label="Keranjang"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartItemsCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-2">
                            {/* Staff Button */}
                            {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                                <Link href="/staff/queue">
                                    <button 
                                        className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                            pathname.startsWith('/staff')
                                                ? "bg-purple-600 text-white border-purple-600"
                                                : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                        )}
                                        title="Antrean Produksi"
                                    >
                                        <Printer className="h-3.5 w-3.5" />
                                        Produksi
                                    </button>
                                </Link>
                            )}

                            {/* Admin Button */}
                            {user.role === 'ADMIN' && (
                                <Link href="/admin/dashboard">
                                    <button 
                                        className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                            pathname.startsWith('/admin')
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                        )}
                                        title="Panel Admin"
                                    >
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Admin
                                    </button>
                                </Link>
                            )}

                            {/* User Profile */}
                            <Link href="/profile">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-2 h-8 text-xs font-medium border-slate-200 hover:bg-slate-50 text-slate-700"
                                >
                                    <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px]">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden md:inline max-w-[100px] truncate">{user.name}</span>
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="text-xs h-8">
                                    Masuk
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white">
                                    Daftar
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Menu Button */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="md:hidden h-9 w-9 text-slate-700"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Buka Menu"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    {/* User Info Bar if Logged In */}
                    {isAuthenticated && user && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                    <p className="text-[11px] text-slate-500">{user.email}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                {user.role}
                            </span>
                        </div>
                    )}

                    {/* Dedicated Staff & Admin Buttons on Mobile */}
                    {isAuthenticated && user && (user.role === 'STAFF' || user.role === 'ADMIN') && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <Link 
                                href="/staff/queue"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold"
                            >
                                <Printer className="h-4 w-4" />
                                Antrian Produksi
                            </Link>

                            {user.role === 'ADMIN' && (
                                <Link 
                                    href="/admin/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold"
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    Panel Admin
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Navigation Links */}
                    <div className="space-y-1 pt-2">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <span>Beranda</span>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Link>
                        <Link
                            href="/products"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <span>Katalog Produk Cetak</span>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Link>
                        {isAuthenticated && (
                            <Link
                                href="/my-orders"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <span className="flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-blue-600" />
                                    Pesanan & Notifikasi
                                </span>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            </Link>
                        )}
                        {isAuthenticated && (
                            <Link
                                href="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <span>Pengaturan Profil</span>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            </Link>
                        )}
                    </div>

                    {/* Bottom CTA on Mobile */}
                    <div className="pt-2 border-t border-slate-100">
                        {isAuthenticated ? (
                            <Button
                                variant="outline"
                                className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50 gap-2"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                Keluar Akun
                            </Button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full text-xs">
                                        Masuk
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full text-xs bg-blue-600 text-white">
                                        Daftar
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
