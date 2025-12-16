'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Package, Clock, Truck, CheckCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { orderService } from '@/services/orders';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STEPS = [
    { status: 'PENDING', label: 'Menunggu', icon: Clock },
    { status: 'CONFIRMED', label: 'Dikonfirmasi', icon: CreditCard },
    { status: 'PROCESSING', label: 'Diproses', icon: Package },
    { status: 'READY', label: 'Siap/Dikirim', icon: Truck },
    { status: 'COMPLETED', label: 'Selesai', icon: CheckCircle },
];

export default function OrderTrackingPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            orderService.getOrderById(id as string)
                .then(res => {
                    if (res.success && res.data) setOrder(res.data);
                })
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    if (isLoading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    );

    if (!order) return null;

    // Recalculate component parts
    const shippingCost = order.shippingCost || 0;
    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.11;
    // Note: totalAmount in order object should already include this, but we display broken down parts
    const currentStepIndex = STEPS.findIndex(s => s.status === order.status);
    const isCancelled = order.status === 'CANCELLED';

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Detail Pesanan</h1>
                <p className="text-slate-500">ID Pesanan: {order.id}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Timeline */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-lg mb-6">Status Pesanan</h3>

                        {isCancelled ? (
                            <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg">
                                <AlertCircle className="h-6 w-6" />
                                <span className="font-medium">Pesanan Dibatalkan</span>
                            </div>
                        ) : (
                            <div className="relative flex justify-between">
                                {/* Connecting Line */}
                                <div className="absolute top-4 left-0 w-full h-1 bg-slate-200 -z-10"></div>
                                <div
                                    className="absolute top-4 left-0 h-1 bg-blue-600 -z-10 transition-all duration-500"
                                    style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                                ></div>

                                {STEPS.map((step, idx) => {
                                    const isActive = idx <= currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;

                                    // Dynamic label for READY/SHIPPED status
                                    let label = step.label;
                                    if (step.status === 'READY') {
                                        if (order.shippingMethod === 'PICKUP') {
                                            label = 'Siap Diambil';
                                        } else {
                                            label = 'Dalam Pengiriman';
                                        }
                                    }

                                    return (
                                        <div key={step.status} className="flex flex-col items-center bg-white px-2">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 transition-colors",
                                                isActive ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300 text-slate-400"
                                            )}>
                                                <step.icon className="h-4 w-4" />
                                            </div>
                                            <span className={cn(
                                                "text-xs font-medium text-center",
                                                isCurrent ? "text-blue-600" : "text-slate-500"
                                            )}>
                                                {label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Items */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Daftar Produk</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                    <div className="h-16 w-16 bg-slate-100 rounded-md">
                                        {/* Placeholder for item image if needed */}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">{item.product.name}</h4>
                                        <p className="text-sm text-slate-500">{item.quantity} x {formatCurrency(item.price)}</p>
                                        {item.options && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                {item.options.size}, {item.options.material}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                        <h3 className="font-semibold mb-4">Info Pengiriman</h3>
                        <p className="text-sm text-slate-600 mb-2 font-medium">{order.userId === 'user-1' ? 'Anda' : 'Customer'}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{order.shippingAddress}</p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                        <h3 className="font-semibold mb-4">Rincian Pembayaran</h3>
                        <div className="space-y-2 text-sm text-slate-600 mb-4">
                            <div className="flex justify-between font-medium text-slate-800">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Pajak (11%)</span>
                                <span>{formatCurrency(tax)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Ongkos Kirim ({order.shippingMethod || 'Regular'})</span>
                                <span>{formatCurrency(order.shippingCost || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Metode</span>
                                <span className="font-medium">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Waktu Pesan</span>
                                <span>{formatDate(order.createdAt)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-slate-900 pt-2 border-t">
                            <span>Total Bayar</span>
                            <span>{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
