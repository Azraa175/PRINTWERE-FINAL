'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { orderService } from '@/services/orders';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function OrderListPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await orderService.getMyOrders();
                if (res.success && res.data) {
                    setOrders(res.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Riwayat Pesanan</h1>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
                    <Package className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">Belum ada pesanan</h3>
                    <p className="text-slate-500 mb-6">Mulai belanja sekarang untuk membuat pesanan.</p>
                    <Link href="/products">
                        <Button>Lihat Produk</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-slate-900">{order.items[0].product.name}</span>
                                        {order.items.length > 1 && (
                                            <span className="text-xs text-slate-500">+{order.items.length - 1} produk lainnya</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500">{formatDate(order.createdAt)} • {order.id}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500">Total Belanja</p>
                                        <p className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                                    </div>
                                    <Badge variant="secondary" className="px-3 py-1 bg-slate-100 text-slate-800">
                                        {order.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                <Link href={`/orders/${order.id}`}>
                                    <Button variant="outline" size="sm">Lihat Detail Pesanan</Button>
                                </Link>
                                {order.status === 'PENDING' && order.paymentMethod === 'QRIS' && (
                                    <Link href={`/payment/${order.id}`}>
                                        <Button size="sm">Bayar Sekarang</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
