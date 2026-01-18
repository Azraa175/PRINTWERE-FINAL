'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Search, Package, MapPin, Calendar, CreditCard, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function TrackOrder() {
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
            // Using public-safe API endpoint if available, but for now we use the main orders one
            // Note: In production, there should be a specific public tracking endpoint that doesn't return sensitive data
            const response = await fetch(`/api/orders/${orderId}`);
            const result = await response.json();

            if (result.success && result.data) {
                setOrder(result.data);
            } else {
                setError('Pesanan tidak ditemukan. Mohon periksa kembali ID Pesanan Anda.');
            }
        } catch (err) {
            setError('Terjadi kesalahan saat melacak pesanan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 max-w-3xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Lacak Pesanan</h1>
                <p className="mt-3 text-lg text-slate-600">
                    Masukkan nomor pesanan Anda untuk memantau status pengerjaan secara real-time.
                </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10 mb-8">
                <form onSubmit={handleTrack} className="relative">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Masukkan ID Pesanan (contoh: 65a...)"
                            className="w-full pl-12 pr-32 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 focus:outline-none transition-all text-lg font-medium"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Button type="submit" disabled={loading} className="rounded-xl px-6 h-12">
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Lacak Sekarang'}
                            </Button>
                        </div>
                    </div>
                </form>

                {error && (
                    <div className="mt-8 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-red-700 border border-red-100">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {order && (
                    <div className="mt-12 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status Saat Ini</p>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                                    <h3 className="text-xl font-extrabold text-slate-900">{order.status}</h3>
                                </div>
                            </div>
                            <div className="md:text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ID PESANAN</p>
                                <p className="font-mono text-sm bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{order.id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 shrink-0">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tanggal Pesan</p>
                                        <p className="font-bold text-slate-800">{formatDate(order.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Alamat Pengiriman</p>
                                        <p className="text-sm text-slate-600 line-clamp-2">{order.shippingAddress}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-center md:text-left">TOTAL PEMBAYARAN</p>
                                    <p className="text-3xl font-black text-blue-600 text-center md:text-left">{formatCurrency(order.totalAmount)}</p>
                                </div>
                                <Link href={`/orders/${order.id}`} className="mt-4 block">
                                    <Button variant="outline" className="w-full rounded-xl gap-2 font-bold group">
                                        Lihat Detail Lengkap
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {!order && !loading && (
                <div className="text-center rounded-3xl bg-slate-50 p-10 border border-slate-100 border-dashed">
                    <Package className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Belum ada pesanan yang dilacak.</p>
                </div>
            )}
        </div>
    );
}
