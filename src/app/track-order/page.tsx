'use client';

import { useState } from 'react';
import { orderService } from '@/services/orders';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { Search, Package, MapPin, Calendar, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function TrackOrder() {
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) return;

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const response = await orderService.getOrderById(orderId);
            if (response.success && response.data) {
                setOrder(response.data);
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
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-2xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Lacak Pesanan</h1>
                    <p className="mt-2 text-gray-600">
                        Masukkan ID Pesanan Anda untuk melihat status pengiriman
                    </p>
                </div>

                <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
                    <form onSubmit={handleTrack} className="flex gap-4">
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Contoh: ORD-20231215-001"
                            className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <Button type="submit" disabled={loading} className="gap-2">
                            <Search className="h-4 w-4" />
                            {loading ? 'Mencari...' : 'Lacak'}
                        </Button>
                    </form>

                    {error && (
                        <div className="mt-6 rounded-md bg-red-50 p-4 text-red-600">
                            {error}
                        </div>
                    )}

                    {order && (
                        <div className="mt-8 space-y-6">
                            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                            <Package className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Status Pesanan</h3>
                                            <p className="text-sm text-blue-600 font-medium">{order.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">ID Pesanan</p>
                                        <p className="font-mono text-sm font-medium">{order.id}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <MapPin className="mt-1 h-5 w-5 text-gray-400" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Alamat Pengiriman</h4>
                                        <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Calendar className="mt-1 h-5 w-5 text-gray-400" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Tanggal Pemesanan</h4>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <CreditCard className="mt-1 h-5 w-5 text-gray-400" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Metode Pembayaran</h4>
                                        <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="mb-4 font-semibold text-gray-900">Rincian Produk</h4>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="relative h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                                                {/* Note: In a real app we'd use Image component here if we had the URL */}
                                                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-500">
                                                    Img
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                                                <p className="text-sm text-gray-500">
                                                    {item.quantity} x {formatCurrency(item.price)}
                                                </p>
                                                {item.options && (
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        {Object.entries(item.options).map(([key, value]) => (
                                                            <span key={key} className="mr-2 inline-block rounded bg-gray-100 px-2 py-0.5">
                                                                {key}: {value as string}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right font-medium text-gray-900">
                                                {formatCurrency(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex justify-between border-t border-gray-200 pt-4">
                                    <span className="font-bold text-gray-900">Total Harga</span>
                                    <span className="font-bold text-blue-600">
                                        {formatCurrency(order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
