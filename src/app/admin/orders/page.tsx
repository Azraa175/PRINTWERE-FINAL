'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, CheckCircle, XCircle, Loader2, RefreshCw, ShoppingCart, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { ORDER_STATUS_LABELS } from '@/types';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Semua Status' },
    { value: 'MENUNGGU_VERIFIKASI', label: 'Menunggu Verifikasi' },
    { value: 'ANTRIAN_PRODUKSI', label: 'Antrean Produksi' },
    { value: 'SEDANG_DICETAK', label: 'Sedang Dicetak' },
    { value: 'FINISHING', label: 'Finishing' },
    { value: 'SIAP_DIAMBIL', label: 'Siap Diambil / Kirim' },
    { value: 'SELESAI', label: 'Selesai' },
    { value: 'PEMBAYARAN_DITOLAK', label: 'Pembayaran Ditolak' },
    { value: 'DIBATALKAN', label: 'Dibatalkan' },
    { value: 'MENUNGGU_PEMBAYARAN', label: 'Belum Bayar' },
];

export default function AdminOrdersPage() {
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { orders, isLoading, mutate } = useAdminOrders(statusFilter);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchOrders = () => {
        mutate();
    };

    const handleConfirm = async (id: string) => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/orders/${id}/confirm`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || 'Status berhasil dimajukan');
                fetchOrders();
            } else {
                toast.error(data.error || 'Gagal memproses');
            }
        } catch (error) {
            toast.error('Gagal memproses pesanan');
        } finally {
            setProcessingId(null);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/orders/${id}/cancel`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || 'Pesanan dibatalkan');
                fetchOrders();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Gagal membatalkan pesanan');
        } finally {
            setProcessingId(null);
        }
    };

    // Filter by search query (orderNo, customer name, email)
    const filteredOrders = orders.filter((order: any) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            order.orderNo?.toLowerCase().includes(q) ||
            order.id.toLowerCase().includes(q) ||
            order.user?.name?.toLowerCase().includes(q) ||
            order.user?.email?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        Manajemen Pesanan Masuk
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Verifikasi pembayaran, pantau alur pengerjaan, dan kelola pengiriman pesanan pelanggan
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchOrders} 
                        disabled={isLoading}
                        className="rounded-xl h-9 text-xs font-semibold gap-1.5"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>
                </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nomor pesanan (#PW-...), nama, atau email pelanggan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                    />
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
                    <select
                        className="w-full sm:w-auto rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table Container */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                        <span className="text-xs font-medium">Memuat data pesanan...</span>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        <ShoppingCart className="h-12 w-12 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-700">Tidak ada pesanan ditemukan</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {searchQuery ? 'Coba gunakan kata kunci pencarian yang lain.' : 'Belum ada data pesanan pada filter ini.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-5 py-3.5">No. Pesanan</th>
                                    <th className="px-5 py-3.5">Pelanggan</th>
                                    <th className="px-5 py-3.5">Tanggal</th>
                                    <th className="px-5 py-3.5">Metode / Kurir</th>
                                    <th className="px-5 py-3.5">Total Tagihan</th>
                                    <th className="px-5 py-3.5">Status Cetak</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.map((order: any) => {
                                    const statusMeta = ORDER_STATUS_LABELS[order.status] || { 
                                        label: order.status, 
                                        color: 'bg-slate-100 text-slate-800 border-slate-300' 
                                    };
                                    const isFinished = ['SELESAI', 'DIBATALKAN', 'COMPLETED', 'CANCELLED'].includes(order.status);
                                    const isWaitingVerif = order.status === 'MENUNGGU_VERIFIKASI';

                                    return (
                                        <tr 
                                            key={order.id} 
                                            className="hover:bg-slate-50/70 transition-colors"
                                        >
                                            <td className="px-5 py-4 font-mono font-bold text-slate-900">
                                                {order.orderNo || `#${order.id.slice(0, 8).toUpperCase()}`}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-900">{order.user?.name || 'Pelanggan'}</div>
                                                <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{order.user?.email}</div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                <div className="font-semibold">{order.paymentMethod}</div>
                                                <div className="text-[10px] text-slate-400">{order.shippingMethod || 'Standard'}</div>
                                            </td>
                                            <td className="px-5 py-4 font-bold text-blue-600 whitespace-nowrap">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.color}`}>
                                                    {statusMeta.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link href={`/admin/orders/${order.id}`}>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50" 
                                                            title="Lihat Detail Pesanan"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>

                                                    {!isFinished && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn(
                                                                    "h-8 w-8 rounded-lg",
                                                                    isWaitingVerif 
                                                                        ? "text-emerald-600 hover:bg-emerald-50" 
                                                                        : "text-blue-600 hover:bg-blue-50"
                                                                )}
                                                                title={isWaitingVerif ? "Setujui Pembayaran" : "Majukan Tahap"}
                                                                onClick={() => handleConfirm(order.id)}
                                                                disabled={processingId === order.id}
                                                            >
                                                                {processingId === order.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle className="h-4 w-4" />
                                                                )}
                                                            </Button>

                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-lg text-rose-600 hover:bg-rose-50"
                                                                title="Batalkan Pesanan"
                                                                onClick={() => handleCancel(order.id)}
                                                                disabled={processingId === order.id}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
