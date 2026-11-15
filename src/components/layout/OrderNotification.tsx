'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, Clock, AlertCircle, Printer, Truck, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { useAuthStore } from '@/store/authStore';
import { ORDER_STATUS_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const STATUS_DESCRIPTIONS: Record<string, string> = {
    MENUNGGU_PEMBAYARAN: 'Segera lakukan pembayaran & upload bukti',
    MENUNGGU_VERIFIKASI: 'Bukti transfer sedang diverifikasi Admin',
    ANTRIAN_PRODUKSI: 'Pembayaran valid! Masuk antrian cetak',
    SEDANG_DICETAK: 'Pesanan sedang diproses di mesin cetak',
    FINISHING: 'Tahap finishing (potong / laminasi / jilid)',
    SIAP_DIAMBIL: 'Cetak selesai! Siap diambil / dikirim',
    DIKIRIM: 'Pesanan sedang dalam perjalanan ke alamat Anda',
    SELESAI: 'Pesanan telah selesai diterima',
    PEMBAYARAN_DITOLAK: 'Bukti bayar ditolak. Silakan upload ulang',
    DIBATALKAN: 'Pesanan telah dibatalkan',
};

interface OrderNotificationProps {
    variant?: 'header' | 'admin';
}

export function OrderNotification({ variant = 'header' }: OrderNotificationProps) {
    const { user, isAuthenticated } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Determine if admin mode
    const isAdmin = variant === 'admin' || user?.role === 'ADMIN';

    // SWR fetch for customer orders
    const { data: customerData, isLoading: customerLoading, mutate: mutateCustomer } = useSWR(
        isAuthenticated && !isAdmin ? '/api/user/orders' : null,
        fetcher,
        { refreshInterval: 8000, revalidateOnFocus: true }
    );

    // SWR fetch for admin orders waiting verification
    const { data: adminData, isLoading: adminLoading, mutate: mutateAdmin } = useSWR(
        isAuthenticated && isAdmin ? '/api/admin/orders?status=MENUNGGU_VERIFIKASI' : null,
        fetcher,
        { refreshInterval: 8000, revalidateOnFocus: true }
    );

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isAuthenticated) return null;

    // Customer notifications logic
    const customerOrders = Array.isArray(customerData?.data) ? customerData.data : [];
    // Active orders are any orders not yet finished or cancelled
    const activeCustomerOrders = customerOrders.filter((o: any) =>
        ['MENUNGGU_PEMBAYARAN', 'MENUNGGU_VERIFIKASI', 'ANTRIAN_PRODUKSI', 'SEDANG_DICETAK', 'FINISHING', 'SIAP_DIAMBIL', 'PEMBAYARAN_DITOLAK'].includes(o.status)
    );
    const customerBadgeCount = activeCustomerOrders.length;

    // Admin notifications logic
    const adminOrders = Array.isArray(adminData?.data) ? adminData.data : [];
    const adminBadgeCount = adminOrders.length;

    const badgeCount = isAdmin ? adminBadgeCount : customerBadgeCount;
    const isLoading = isAdmin ? adminLoading : customerLoading;

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isAdmin) mutateAdmin();
        else mutateCustomer();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                    isOpen
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                )}
                aria-label="Notifikasi Pesanan"
                title={isAdmin ? `${badgeCount} pesanan menunggu verifikasi` : `${badgeCount} pesanan aktif`}
            >
                <Bell className="h-5 w-5" />
                {badgeCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50 duration-200">
                        {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900">
                                {isAdmin ? 'Notifikasi Admin' : 'Notifikasi Pesanan'}
                            </span>
                            {badgeCount > 0 && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                    isAdmin ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                )}>
                                    {badgeCount} {isAdmin ? 'butuh aksi' : 'aktif'}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Segarkan notifikasi"
                        >
                            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                        </button>
                    </div>

                    {/* Content List */}
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8 text-slate-400">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                <span className="text-xs">Memuat notifikasi...</span>
                            </div>
                        ) : isAdmin ? (
                            /* Admin View: Orders Waiting Verification */
                            adminOrders.length === 0 ? (
                                <div className="py-8 px-4 text-center">
                                    <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                                    <p className="text-sm font-medium text-slate-700">Semua Beres!</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Tidak ada pesanan yang menunggu verifikasi pembayaran saat ini.
                                    </p>
                                </div>
                            ) : (
                                adminOrders.slice(0, 5).map((order: any) => (
                                    <Link
                                        key={order.id}
                                        href={`/admin/orders/${order.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="block p-3.5 hover:bg-amber-50/40 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-blue-600">
                                                        {order.orderNo || `#${order.id.slice(0, 8).toUpperCase()}`}
                                                    </span>
                                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                                                        Verifikasi
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600">
                                                    Pelanggan: <span className="font-medium text-slate-800">{order.user?.name || 'Pelanggan'}</span>
                                                </p>
                                                <p className="text-[11px] font-semibold text-blue-600">
                                                    {formatCurrency(order.totalAmount)} • {order.paymentMethod}
                                                </p>
                                            </div>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                {formatDate(order.createdAt)}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            )
                        ) : (
                            /* Customer View: Recent Orders Status */
                            customerOrders.length === 0 ? (
                                <div className="py-8 px-4 text-center">
                                    <Bell className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-slate-700">Belum ada pesanan</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Pesanan yang Anda buat akan muncul di sini beserta status terkininya.
                                    </p>
                                </div>
                            ) : (
                                customerOrders.slice(0, 5).map((order: any) => {
                                    const statusInfo = ORDER_STATUS_LABELS[order.status] || {
                                        label: order.status,
                                        color: 'bg-slate-100 text-slate-800 border-slate-200'
                                    };
                                    const isWaitingPayment = order.status === 'MENUNGGU_PEMBAYARAN' || order.status === 'PENDING';
                                    const desc = STATUS_DESCRIPTIONS[order.status] || 'Status pesanan diperbarui';
                                    const targetHref = isWaitingPayment ? `/payment/${order.id}` : `/orders/${order.id}`;

                                    return (
                                        <Link
                                            key={order.id}
                                            href={targetHref}
                                            onClick={() => setIsOpen(false)}
                                            className="block p-3.5 hover:bg-slate-50 transition-colors group"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-blue-600">
                                                    {order.orderNo || `#${order.id.slice(0, 8).toUpperCase()}`}
                                                </span>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                                                    statusInfo.color
                                                )}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-1 mb-1">
                                                {desc}
                                            </p>
                                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                                <span>{formatCurrency(order.totalAmount)}</span>
                                                <span>{formatDate(order.createdAt)}</span>
                                            </div>
                                        </Link>
                                    );
                                })
                            )
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                        <Link
                            href={isAdmin ? "/admin/orders" : "/my-orders"}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline py-1"
                        >
                            <span>{isAdmin ? 'Buka Manajemen Pesanan' : 'Lihat Semua Pesanan Saya'}</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

