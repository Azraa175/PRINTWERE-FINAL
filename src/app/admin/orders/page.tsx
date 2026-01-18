'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useAdminOrders } from '@/hooks/useAdminOrders';

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    items: any[];
}

const STATUS_OPTIONS = ['all', 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'COMPLETED': return 'bg-green-100 text-green-800';
        case 'PROCESSING': return 'bg-blue-100 text-blue-800';
        case 'CONFIRMED': return 'bg-indigo-100 text-indigo-800';
        case 'READY': return 'bg-cyan-100 text-cyan-800';
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

export default function AdminOrdersPage() {
    const [statusFilter, setStatusFilter] = useState('all');
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
                toast.success(data.message);
                fetchOrders();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Gagal memproses');
        } finally {
            setProcessingId(null);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Batalkan pesanan ini?')) return;
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/orders/${id}/cancel`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                fetchOrders();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Gagal membatalkan');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Pesanan</h1>
                <div className="flex gap-2">
                    <select
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s === 'all' ? 'Semua Status' : s}</option>
                        ))}
                    </select>
                    <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        Tidak ada pesanan{statusFilter !== 'all' ? ` dengan status ${statusFilter}` : ''}.
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">ID Pesanan</th>
                                <th className="px-6 py-3">Pelanggan</th>
                                <th className="px-6 py-3">Tanggal</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{order.id.slice(0, 12)}...</td>
                                    <td className="px-6 py-4">{order.user?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                                    <td className="px-6 py-4">{formatCurrency(order.totalAmount)}</td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            status={
                                                order.status === 'COMPLETED' ? 'success' :
                                                    order.status === 'CANCELLED' ? 'error' :
                                                        order.status === 'READY' ? 'info' :
                                                            order.status === 'PROCESSING' ? 'warning' : 'default'
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title="Lihat Detail">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {!['COMPLETED', 'CANCELLED'].includes(order.status) && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-green-600"
                                                        title="Konfirmasi"
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
                                                        className="h-8 w-8 text-red-600"
                                                        title="Batalkan"
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
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
