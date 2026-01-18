'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Package, User, MapPin, CreditCard, Calendar,
    CheckCircle, XCircle, Loader2, FileImage, Download,
    Clock, Truck, Phone, Mail, Hash, Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface OrderDetail {
    id: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentProof?: string;
    shippingAddress: string;
    shippingMethod: string;
    shippingCost: number;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        status: string;
    };
    items: {
        id: string;
        quantity: number;
        price: number;
        fileUrl?: string;
        options?: any;
        product: {
            id: string;
            name: string;
            image: string;
            category: string;
        };
    }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    'PENDING': { label: 'Menunggu Pembayaran', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200', icon: Clock },
    'CONFIRMED': { label: 'Pembayaran Dikonfirmasi', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: CheckCircle },
    'PROCESSING': { label: 'Sedang Diproses', color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200', icon: Package },
    'READY': { label: 'Siap Dikirim', color: 'text-cyan-700', bgColor: 'bg-cyan-50 border-cyan-200', icon: Truck },
    'COMPLETED': { label: 'Selesai', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: CheckCircle },
    'CANCELLED': { label: 'Dibatalkan', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', icon: XCircle },
};

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.data);
            } else {
                toast.error(data.error || 'Gagal memuat pesanan');
            }
        } catch (error) {
            toast.error('Gagal memuat pesanan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}/confirm`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                fetchOrder();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Gagal memproses');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Batalkan pesanan ini?')) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}/cancel`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                fetchOrder();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Gagal membatalkan');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <Package className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Pesanan Tidak Ditemukan</h2>
                <p className="text-slate-500 mb-4">Pesanan dengan ID ini tidak ada dalam sistem</p>
                <Link href="/admin/orders">
                    <Button>Kembali ke Daftar Pesanan</Button>
                </Link>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG['PENDING'];
    const StatusIcon = statusConfig.icon;

    // Calculate subtotal
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = order.totalAmount - subtotal - order.shippingCost;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders">
                        <Button variant="outline" size="icon" className="h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-slate-900">Detail Pesanan</h1>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.bgColor}`}>
                                <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                                <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Hash className="h-4 w-4" />
                                <code className="text-sm font-mono">{order.id}</code>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {formatDate(order.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {!['COMPLETED', 'CANCELLED'].includes(order.status) && (
                    <div className="flex gap-3">
                        <Button
                            size="lg"
                            className="gap-2 px-6"
                            onClick={handleConfirm}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                            Proses Pesanan
                        </Button>
                        <Button
                            variant="destructive"
                            size="lg"
                            className="gap-2 px-6"
                            onClick={handleCancel}
                            disabled={isProcessing}
                        >
                            <XCircle className="h-5 w-5" />
                            Batalkan
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-slate-50">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                Produk Dipesan ({order.items.length} item)
                            </h2>
                        </div>
                        <div className="divide-y">
                            {order.items.map((item, index) => (
                                <div key={item.id} className="p-6">
                                    <div className="flex gap-5">
                                        <div className="relative">
                                            <img
                                                src={item.product.image || '/placeholder.jpg'}
                                                alt={item.product.name}
                                                className="w-24 h-24 object-cover rounded-lg border"
                                            />
                                            <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-slate-900">{item.product.name}</h3>
                                                    <p className="text-sm text-slate-500">{item.product.category}</p>
                                                </div>
                                                <p className="text-lg font-bold text-slate-900">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                                <span>Qty: <strong>{item.quantity}</strong></span>
                                                <span>@{formatCurrency(item.price)}</span>
                                            </div>

                                            {/* Options */}
                                            {item.options && Object.keys(item.options).length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {Object.entries(item.options).map(([key, value]) => (
                                                        <span key={key} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                                                            {key}: {String(value)}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* File Upload */}
                                            {item.fileUrl && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <FileImage className="h-5 w-5 text-blue-600" />
                                                            <div>
                                                                <p className="text-sm font-medium text-blue-900">File Desain Customer</p>
                                                                <p className="text-xs text-blue-600">Klik untuk download</p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={item.fileUrl}
                                                            download
                                                            target="_blank"
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Download
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Proof */}
                    {order.paymentProof && (
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            <div className="p-6 border-b bg-slate-50">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-green-600" />
                                    Bukti Pembayaran
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="relative group">
                                    <img
                                        src={order.paymentProof}
                                        alt="Bukti Pembayaran"
                                        className="max-w-md mx-auto rounded-lg border shadow-sm"
                                    />
                                    <a
                                        href={order.paymentProof}
                                        download
                                        target="_blank"
                                        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur text-slate-700 rounded-lg hover:bg-white transition-colors text-sm font-medium shadow-lg border"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-5 border-b bg-slate-50">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                Informasi Pelanggan
                            </h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Nama Lengkap</p>
                                <p className="text-base font-semibold text-slate-900">{order.user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Email</p>
                                <a href={`mailto:${order.user.email}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <Mail className="h-4 w-4" />
                                    {order.user.email}
                                </a>
                            </div>
                            {order.user.phone && (
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Telepon</p>
                                    <a href={`tel:${order.user.phone}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                                        <Phone className="h-4 w-4" />
                                        {order.user.phone}
                                    </a>
                                </div>
                            )}
                            <div className="pt-2 border-t">
                                <p className="text-sm text-slate-500 mb-2">Status Akun</p>
                                <Badge
                                    variant="outline"
                                    className={order.user.status === 'ACTIVE'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                    }
                                >
                                    {order.user.status === 'ACTIVE' ? 'Aktif' : 'Diblokir'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-5 border-b bg-slate-50">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                Pengiriman
                            </h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Alamat Lengkap</p>
                                <p className="text-base text-slate-900 whitespace-pre-line leading-relaxed">
                                    {order.shippingAddress}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Kurir</p>
                                    <p className="font-semibold text-slate-900">{order.shippingMethod}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Ongkos Kirim</p>
                                    <p className="font-semibold text-slate-900">{formatCurrency(order.shippingCost)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-5 border-b bg-slate-50">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                Ringkasan Pembayaran
                            </h2>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Pajak (11%)</span>
                                <span>{formatCurrency(tax > 0 ? tax : 0)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Ongkos Kirim</span>
                                <span>{formatCurrency(order.shippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t">
                                <span>Total</span>
                                <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
                            </div>
                            <div className="pt-3 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Metode Pembayaran</span>
                                    <Badge className={order.paymentMethod === 'QRIS' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}>
                                        {order.paymentMethod}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-5 border-b bg-slate-50">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                Riwayat
                            </h2>
                        </div>
                        <div className="p-5 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Dibuat</span>
                                <span className="text-slate-900">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Terakhir Update</span>
                                <span className="text-slate-900">{formatDate(order.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
