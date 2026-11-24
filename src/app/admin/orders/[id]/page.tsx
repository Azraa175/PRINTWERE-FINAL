'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Package, User, MapPin, CreditCard, Calendar,
    CheckCircle, XCircle, Loader2, FileImage, Download,
    Clock, Truck, Phone, Mail, Hash, Receipt, Eye, AlertCircle,
    Printer, Scissors, ShieldCheck, Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ORDER_STATUS_LABELS } from '@/types';
import { OrderStatusStepper } from '@/components/OrderStatusStepper';
import { DesignFilePreview } from '@/components/DesignFilePreview';

interface OrderDetail {
    id: string;
    orderNo?: string;
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
        width?: number;
        height?: number;
        fileUrl?: string;
        notes?: string;
        options?: any;
        product: {
            id: string;
            name: string;
            image: string;
            category: string;
        };
    }[];
    payments?: {
        id: string;
        amount: number;
        method: string;
        proofUrl: string;
        status: string;
        rejectReason?: string;
        createdAt: string;
    }[];
    statusLogs?: {
        id: string;
        fromStatus: string;
        toStatus: string;
        note?: string;
        createdAt: string;
        changedBy?: {
            name: string;
            role: string;
        };
    }[];
}

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`);
            const data = await res.json();
            if (data.success && data.data) {
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

    // Approve payment verification -> ANTRIAN_PRODUKSI
    const handleApprovePayment = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}/confirm`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'ANTRIAN_PRODUKSI',
                    note: 'Pembayaran transfer valid & telah disetujui oleh Admin'
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Pembayaran berhasil disetujui! Pesanan masuk antrean produksi.');
                fetchOrder();
            } else {
                toast.error(data.error || 'Gagal menyetujui pembayaran');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat memproses');
        } finally {
            setIsProcessing(false);
        }
    };

    // Reject payment verification -> PEMBAYARAN_DITOLAK
    const handleRejectPayment = async () => {
        if (!rejectReason.trim()) {
            toast.error('Silakan isi alasan penolakan pembayaran');
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}/confirm`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'PEMBAYARAN_DITOLAK',
                    note: rejectReason.trim()
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Pembayaran ditolak. Pelanggan akan diminta mengunggah ulang bukti.');
                setRejectDialogOpen(false);
                setRejectReason('');
                fetchOrder();
            } else {
                toast.error(data.error || 'Gagal menolak pembayaran');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat memproses');
        } finally {
            setIsProcessing(false);
        }
    };

    // Advance to next logical state
    const handleAdvanceStatus = async (nextStatus?: string) => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}/confirm`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || 'Status pesanan berhasil diperbarui');
                fetchOrder();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Gagal memproses perubahan status');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}/cancel`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                toast.success('Pesanan berhasil dibatalkan');
                fetchOrder();
            } else {
                toast.error(data.error || 'Gagal membatalkan');
            }
        } catch (error) {
            toast.error('Gagal membatalkan pesanan');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-2" />
                <p className="text-xs font-medium">Memuat detail pesanan admin...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto">
                <Package className="h-14 w-14 mx-auto text-slate-300 mb-3" />
                <h2 className="text-lg font-bold text-slate-900 mb-1">Pesanan Tidak Ditemukan</h2>
                <p className="text-xs text-slate-500 mb-6">ID pesanan yang dicari tidak ada dalam sistem database.</p>
                <Link href="/admin/orders">
                    <Button size="sm" className="rounded-xl">Kembali ke Daftar Pesanan</Button>
                </Link>
            </div>
        );
    }

    const statusMeta = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-800' };
    const isWaitingVerification = order.status === 'MENUNGGU_VERIFIKASI';
    const isFinished = ['SELESAI', 'DIBATALKAN', 'COMPLETED', 'CANCELLED'].includes(order.status);

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.11;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header with Navigation & ID */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-3">
                    <Link href="/admin/orders">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200">
                            <ArrowLeft className="h-4 w-4 text-slate-600" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-extrabold text-slate-900">Kelola Pesanan</h1>
                            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", statusMeta.color)}>
                                {statusMeta.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                                <Hash className="h-3 w-3 text-slate-400" />
                                {order.orderNo || order.id}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                {formatDate(order.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Primary State Action Buttons */}
                <div className="flex items-center gap-2">
                    <Link href={`/orders/${order.id}/invoice`} target="_blank">
                        <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50">
                            <Printer className="h-3.5 w-3.5 text-blue-600" />
                            Cetak Faktur / Invoice
                        </Button>
                    </Link>
                    {!isFinished && (
                        <>
                            {order.status === 'ANTRIAN_PRODUKSI' && (
                                <Button
                                    size="sm"
                                    className="h-9 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                                    onClick={() => handleAdvanceStatus('SEDANG_DICETAK')}
                                    disabled={isProcessing}
                                >
                                    <Printer className="h-3.5 w-3.5" />
                                    Mulai Cetak Mesin
                                </Button>
                            )}
                            {order.status === 'SEDANG_DICETAK' && (
                                <Button
                                    size="sm"
                                    className="h-9 px-4 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5"
                                    onClick={() => handleAdvanceStatus('FINISHING')}
                                    disabled={isProcessing}
                                >
                                    <Scissors className="h-3.5 w-3.5" />
                                    Lanjut ke Finishing
                                </Button>
                            )}
                            {order.status === 'FINISHING' && (
                                <Button
                                    size="sm"
                                    className="h-9 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                                    onClick={() => handleAdvanceStatus('SIAP_DIAMBIL')}
                                    disabled={isProcessing}
                                >
                                    <Truck className="h-3.5 w-3.5" />
                                    Set Siap Diambil / Kirim
                                </Button>
                            )}
                            {order.status === 'SIAP_DIAMBIL' && (
                                <Button
                                    size="sm"
                                    className="h-9 px-4 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white gap-1.5"
                                    onClick={() => handleAdvanceStatus('SELESAI')}
                                    disabled={isProcessing}
                                >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Selesaikan Pesanan
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 rounded-xl text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                                onClick={handleCancelOrder}
                                disabled={isProcessing}
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                Batalkan
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Matching Unified Status Stepper for Admin */}
            <OrderStatusStepper 
                status={order.status} 
                shippingMethod={order.shippingMethod} 
            />

            {/* DEDICATED PAYMENT VERIFICATION CARD (with View & Download) */}
            {isWaitingVerification && (
                <div className="bg-amber-50/60 border-2 border-amber-300 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
                        <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Receipt className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-slate-900">
                                    Verifikasi Pembayaran Pelanggan
                                </h3>
                                <p className="text-xs text-amber-800">
                                    Pelanggan telah mengunggah bukti transfer. Silakan periksa keabsahan nominal dan rekening.
                                </p>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-[11px] font-semibold text-amber-700 uppercase">Total yang harus dibayar:</span>
                            <p className="text-xl font-black text-slate-900">{formatCurrency(order.totalAmount)}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
                        {/* Thumbnail with View & Download */}
                        {order.paymentProof ? (
                            <div className="flex flex-col items-center gap-2 shrink-0">
                                <div 
                                    onClick={() => setPreviewModalOpen(true)}
                                    className="relative aspect-video w-48 rounded-xl overflow-hidden bg-white border-2 border-amber-300 shadow-sm cursor-pointer group"
                                >
                                    <img
                                        src={order.paymentProof}
                                        alt="Bukti Transfer"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                                        <Eye className="h-4 w-4" />
                                        <span>Perbesar</span>
                                    </div>
                                </div>
                                
                                {/* 2 EXPLICIT OPTIONS: View and Download */}
                                <div className="flex items-center gap-2 w-full">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewModalOpen(true)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
                                    >
                                        <Eye className="h-3.5 w-3.5 text-blue-600" />
                                        <span>View</span>
                                    </button>
                                    <a
                                        href={order.paymentProof}
                                        download={`Bukti-${order.orderNo || order.id}.jpg`}
                                        target="_blank"
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
                                    >
                                        <Download className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Download</span>
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-white rounded-xl border border-amber-200 text-xs text-amber-700">
                                Berkas bukti transfer belum diunggah oleh pelanggan.
                            </div>
                        )}

                        {/* Decision Panel */}
                        <div className="flex-1 space-y-3 w-full">
                            <div className="p-3.5 bg-white rounded-xl border border-amber-200/80 text-xs space-y-1">
                                <p className="font-semibold text-slate-700">Metode: <span className="font-bold text-slate-900">{order.paymentMethod}</span></p>
                                <p className="text-slate-600">Pelanggan: <span className="font-bold text-slate-900">{order.user.name}</span> ({order.user.phone || order.user.email})</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                    size="sm"
                                    className="h-10 px-5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2"
                                    onClick={handleApprovePayment}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 stroke-[3]" />}
                                    <span>Setujui Pembayaran (Sah)</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 px-5 rounded-xl text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 shadow-2xs gap-2"
                                    onClick={() => setRejectDialogOpen(true)}
                                    disabled={isProcessing}
                                >
                                    <XCircle className="h-4 w-4" />
                                    <span>Tolak Pembayaran...</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left 2 Columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Ordered Products Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                <Package className="h-4 w-4 text-blue-600" />
                                Produk Dipesan ({order.items.length} Item)
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {order.items.map((item, index) => (
                                <div key={item.id} className="p-5 sm:p-6 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="relative shrink-0">
                                            <img
                                                src={item.product.image || '/placeholder.jpg'}
                                                alt={item.product.name}
                                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-slate-200 bg-slate-100"
                                            />
                                            <span className="absolute -top-1.5 -left-1.5 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">{item.product.category}</p>
                                                </div>
                                                <p className="font-extrabold text-sm sm:text-base text-blue-600 whitespace-nowrap">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                                                <span>Qty: <strong>{item.quantity}</strong></span>
                                                <span>•</span>
                                                <span>@{formatCurrency(item.price)}</span>
                                            </div>

                                            {/* Options & Dimensions Badges */}
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {item.width && item.height && (
                                                    <span className="text-[11px] font-bold py-0.5 px-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                                                        Ukuran Banner: {item.width}m × {item.height}m ({(item.width * item.height).toFixed(2)} m²)
                                                    </span>
                                                )}
                                                {item.options && typeof item.options === 'object' && Object.entries(item.options).map(([key, value]) => {
                                                    if (['fileName', 'fileUrl', 'width', 'height', 'area'].includes(key) || !value) return null;
                                                    return (
                                                        <span key={key} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md">
                                                            {key}: {String(value)}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Design File with Interactive Preview & Download */}
                                    {item.fileUrl && (
                                        <div className="pt-2 border-t border-slate-100">
                                            <DesignFilePreview
                                                fileUrl={item.fileUrl}
                                                title="File Desain Pelanggan"
                                                variant="compact"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Standard Payment Proof Box (if not in MENUNGGU_VERIFIKASI mode) */}
                    {!isWaitingVerification && order.paymentProof && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                    <Receipt className="h-4 w-4 text-emerald-600" />
                                    Bukti Pembayaran Pelanggan
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewModalOpen(true)}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                    >
                                        <Eye className="h-3.5 w-3.5 text-blue-600" />
                                        View
                                    </button>
                                    <a
                                        href={order.paymentProof}
                                        download={`Bukti-${order.orderNo || order.id}.jpg`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download
                                    </a>
                                </div>
                            </div>
                            <div className="p-6">
                                <div 
                                    onClick={() => setPreviewModalOpen(true)}
                                    className="relative aspect-video max-w-sm mx-auto rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
                                >
                                    <img
                                        src={order.paymentProof}
                                        alt="Bukti Pembayaran"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                                        <Eye className="h-4 w-4" />
                                        <span>Perbesar Gambar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Status History Logs */}
                    {order.statusLogs && order.statusLogs.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    Riwayat Aktivitas & Perubahan Status
                                </h3>
                            </div>
                            <div className="p-6 divide-y divide-slate-100 space-y-4">
                                {order.statusLogs.map((log) => (
                                    <div key={log.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4 text-xs">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900">{log.toStatus}</span>
                                                {log.changedBy && (
                                                    <span className="text-[10px] text-slate-400">
                                                        oleh {log.changedBy.name} ({log.changedBy.role})
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-600">{log.note || 'Status pesanan diperbarui'}</p>
                                        </div>
                                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                                            {formatDate(log.createdAt)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    {/* Customer Info Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <User className="h-4 w-4 text-blue-600" />
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Informasi Pelanggan</h3>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div>
                                <p className="text-slate-400 text-[10px] uppercase font-semibold">Nama Pemesan</p>
                                <p className="font-bold text-slate-900 text-sm">{order.user.name}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] uppercase font-semibold">Email</p>
                                <a href={`mailto:${order.user.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {order.user.email}
                                </a>
                            </div>
                            {order.user.phone && (
                                <div>
                                    <p className="text-slate-400 text-[10px] uppercase font-semibold">Telepon / WhatsApp</p>
                                    <a 
                                        href={`https://wa.me/${order.user.phone.replace(/[^0-9]/g, '')}`} 
                                        target="_blank"
                                        className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                                    >
                                        <Phone className="h-3 w-3" />
                                        {order.user.phone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Info Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Alamat Pengiriman</h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                            {order.shippingAddress || 'Alamat tidak diisi'}
                        </p>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Metode:</span>
                            <span className="font-bold text-slate-800">{order.shippingMethod || 'Standard'}</span>
                        </div>
                    </div>

                    {/* Financial Summary Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Rincian Pembayaran</h3>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Pajak (11%)</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Ongkos Kirim</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(order.shippingCost || 0)}</span>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                                <span className="font-bold text-sm text-slate-900">Total Akhir</span>
                                <span className="font-black text-lg text-blue-600">{formatCurrency(order.totalAmount)}</span>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-xs">
                                <span className="text-slate-400">Metode Bayar:</span>
                                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                    {order.paymentMethod || 'QRIS'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Image Viewer for Proof */}
            {previewModalOpen && order.paymentProof && (
                <div 
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
                    onClick={() => setPreviewModalOpen(false)}
                >
                    <div 
                        className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-blue-600" />
                                <h4 className="font-bold text-sm text-slate-900">Pratinjau Bukti Pembayaran</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={order.paymentProof}
                                    download={`Bukti-${order.orderNo || order.id}.jpg`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
                                    title="Download Bukti"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                </a>
                                <button
                                    onClick={() => setPreviewModalOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-100 max-h-[75vh] overflow-auto flex items-center justify-center">
                            <img
                                src={order.paymentProof}
                                alt="Bukti Pembayaran Penuh"
                                className="max-h-[65vh] w-auto rounded-lg shadow-sm object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Payment Dialog */}
            {rejectDialogOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
                    onClick={() => setRejectDialogOpen(false)}
                >
                    <div 
                        className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-base text-slate-900">Tolak Pembayaran Pelanggan</h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Berikan alasan penolakan agar pelanggan dapat memahami dan mengunggah bukti pembayaran baru.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Alasan Penolakan</label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Contoh: Nominal transfer kurang, struk transfer buram/tidak terbaca..."
                                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none min-h-[90px]"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRejectDialogOpen(false)}
                                disabled={isProcessing}
                                className="rounded-xl text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleRejectPayment}
                                disabled={isProcessing}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
                            >
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                                Konfirmasi Tolak Pembayaran
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
