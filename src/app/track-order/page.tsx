'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
    Search, 
    Package, 
    MapPin, 
    Calendar, 
    CreditCard, 
    Loader2, 
    AlertCircle, 
    ArrowRight, 
    Truck, 
    CheckCircle2, 
    Clock, 
    Receipt 
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/types';
import { OrderStatusStepper } from '@/components/OrderStatusStepper';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<any | null>(null);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) return;

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const response = await fetch(`/api/orders/${orderId.trim()}`);
            const result = await response.json();

            if (result.success && result.data) {
                setOrder(result.data);
            } else {
                setError(result.error || 'Pesanan tidak ditemukan. Mohon periksa kembali Nomor Pesanan atau ID Pesanan Anda.');
            }
        } catch (err) {
            setError('Terjadi kesalahan saat melacak pesanan. Silakan periksa koneksi Anda dan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
            {/* Page Header */}
            <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <Clock className="h-3.5 w-3.5" /> Pelacakan Real-Time
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Lacak Pesanan Cetak
                </h1>
                <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
                    Pantau alur pengerjaan pesanan Anda dari tahap verifikasi, antrean produksi, cetak, hingga siap diambil.
                </p>
            </div>

            {/* Tracking Search Input Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <form onSubmit={handleTrack} className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Masukkan No. Pesanan (contoh: ORD-202611... atau ID Pesanan)"
                            className="w-full pl-12 pr-32 py-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-sm sm:text-base font-medium placeholder:text-slate-400"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Button 
                                type="submit" 
                                disabled={loading} 
                                className="rounded-xl px-5 h-10 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                        Melacak...
                                    </>
                                ) : (
                                    'Lacak'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700 border border-red-200 animate-in fade-in">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                        <span className="text-xs sm:text-sm font-medium">{error}</span>
                    </div>
                )}
            </div>

            {/* Order Tracking Result */}
            {order && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    {/* Header Bar */}
                    <div className="p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Nomor Pesanan
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-lg font-bold text-slate-900">
                                    {order.orderNo || order.id}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ORDER_STATUS_LABELS[order.status]?.color || 'bg-slate-100 text-slate-800'}`}>
                                    {ORDER_STATUS_LABELS[order.status]?.label || order.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href={`/orders/${order.id}`}>
                                <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1.5 border-slate-200 hover:bg-white">
                                    Lihat Halaman Pesanan
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Visual 7-Stage Stepper Tracker */}
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                            Proses Pengerjaan Saat Ini
                        </h3>
                        <OrderStatusStepper status={order.status} />
                    </div>

                    {/* Order Details & Summary */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Info Pengiriman & Waktu */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Informasi Pengiriman
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-slate-400">Tanggal Pemesanan</p>
                                        <p className="font-semibold text-slate-800">{formatDate(order.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Truck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-slate-400">Metode Pengiriman</p>
                                        <p className="font-semibold text-slate-800">
                                            {order.deliveryType === 'PICKUP' ? 'Ambil di Toko' : 'Kirim via Ekspedisi / Kurir'}
                                        </p>
                                        {order.shippingAddress && (
                                            <p className="text-xs text-slate-600 mt-0.5">{order.shippingAddress}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Ringkasan Biaya & Aksi */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Ringkasan Pembayaran
                            </h4>
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col justify-between space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-600">Metode Bayar:</span>
                                    <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
                                        {order.paymentMethod || 'QRIS'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-blue-200/60 pt-3">
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Total Tagihan:
                                    </span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(order.totalAmount)}
                                    </span>
                                </div>

                                {(order.status === 'MENUNGGU_PEMBAYARAN' || order.status === 'PENDING') && (
                                    <Link href={`/payment/${order.id}`} className="block">
                                        <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-xs">
                                            <Receipt className="h-4 w-4" /> Bayar & Unggah Bukti
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!order && !loading && (
                <div className="text-center rounded-2xl bg-slate-50/80 p-12 border border-dashed border-slate-200">
                    <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-slate-700">Belum ada pesanan yang dilacak</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Ketikkan nomor pesanan pada kolom di atas untuk mengecek status pengerjaan cetakan Anda.
                    </p>
                </div>
            )}
        </div>
    );
}
