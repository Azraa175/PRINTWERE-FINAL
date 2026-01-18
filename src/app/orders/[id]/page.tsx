'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Package, Clock, Truck, CheckCircle, AlertCircle,
    Loader2, CreditCard, ArrowLeft, Download, FileImage,
    Hash, MapPin, Receipt, Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useOrder } from '@/hooks/useOrders';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STEPS = [
    { status: 'PENDING', label: 'Menunggu', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { status: 'CONFIRMED', label: 'Dikonfirmasi', icon: CreditCard, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { status: 'PROCESSING', label: 'Diproses', icon: Package, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    { status: 'READY', label: 'Siap/Dikirim', icon: Truck, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
    { status: 'COMPLETED', label: 'Selesai', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
];

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { order, isLoading } = useOrder(id as string);

    if (isLoading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
    );

    if (!order) return (
        <div className="container mx-auto px-4 py-20 text-center">
            <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700">Pesanan Tidak Ditemukan</h2>
            <Link href="/my-orders" className="text-blue-600 hover:underline mt-4 inline-block"> Kembali ke Pesanan Saya</Link>
        </div>
    );

    const currentStepIndex = STEPS.findIndex(s => s.status === order.status);
    const isCancelled = order.status === 'CANCELLED';

    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.11;

    return (
        <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/my-orders">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">Pesanan Saya</h1>
                            {isCancelled && (
                                <Badge variant="destructive">Dibatalkan</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {order.id.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(order.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {order.paymentMethod === 'QRIS' && order.status === 'PENDING' && (
                    <Link href={`/payment/${order.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700">Bayar Sekarang</Button>
                    </Link>
                )}
            </div>

            {/* Tracking Progress */}
            {!isCancelled && (
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="relative flex justify-between">
                        {/* Progress Bar Background */}
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
                        {/* Active Progress Bar */}
                        <div
                            className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-1000 ease-out"
                            style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                        ></div>

                        {STEPS.map((step, idx) => {
                            const isCompleted = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            const Icon = step.icon;

                            let label = step.label;
                            if (step.status === 'READY') {
                                label = order.shippingMethod === 'PICKUP' ? 'Siap Diambil' : 'Siap Kirim';
                            }

                            return (
                                <div key={step.status} className="relative z-10 flex flex-col items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                                        isCompleted ? "bg-blue-600 border-blue-100 text-white shadow-lg shadow-blue-100" : "bg-white border-slate-50 text-slate-300"
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className={cn(
                                        "text-xs font-bold uppercase tracking-wider text-center",
                                        isCurrent ? "text-blue-600" : isCompleted ? "text-slate-900" : "text-slate-400"
                                    )}>
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Products & Files */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                Daftar Produk
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-6 space-y-4">
                                    <div className="flex gap-4">
                                        <img
                                            src={item.product.image || '/placeholder.jpg'}
                                            alt={item.product.name}
                                            className="w-20 h-20 object-cover rounded-xl border border-slate-100"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">{item.product.name}</h4>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {item.quantity} x {formatCurrency(item.price)}
                                            </p>
                                            {item.options && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {Object.entries(item.options).map(([k, v]) => (
                                                        <span key={k} className="text-[10px] font-bold uppercase tracking-tight py-1 px-2 bg-slate-100 text-slate-600 rounded">
                                                            {k}: {String(v)}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    </div>

                                    {/* Design File Download */}
                                    {item.fileUrl && (
                                        <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                    <FileImage className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-blue-900">File Desain Anda</p>
                                                    <p className="text-[10px] text-blue-600 truncate max-w-[150px]">{item.fileUrl.split('/').pop()}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={item.fileUrl}
                                                download
                                                target="_blank"
                                                className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                LIHAT FILE
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Proof for customer to see what they uploaded */}
                    {order.paymentProof && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-green-600" />
                                    Bukti Pembayaran
                                </h3>
                            </div>
                            <div className="p-6">
                                <img
                                    src={order.paymentProof}
                                    alt="Bukti pembayaran"
                                    className="max-w-xs rounded-xl border shadow-sm mx-auto"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    {/* Delivery Info */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                Alamat Pengiriman
                            </h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {order.shippingAddress}
                            </p>
                            <div className="pt-4 border-t border-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kurir</p>
                                <p className="text-sm font-bold text-slate-900">{order.shippingMethod || 'Standard'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Info */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                                <CreditCard className="h-4 w-4 text-blue-600" />
                                Ringkasan Pembayaran
                            </h3>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Pajak (11%)</span>
                                <span className="font-medium">{formatCurrency(tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Ongkos Kirim</span>
                                <span className="font-medium">{formatCurrency(order.shippingCost || 0)}</span>
                            </div>
                            <div className="pt-3 border-t border-slate-50 flex justify-between">
                                <span className="font-bold text-slate-900">Total Bayar</span>
                                <span className="font-bold text-blue-600 text-lg">{formatCurrency(order.totalAmount)}</span>
                            </div>
                            <div className="pt-3 mt-2 block">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Metode</p>
                                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-3">
                                    {order.paymentMethod}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
