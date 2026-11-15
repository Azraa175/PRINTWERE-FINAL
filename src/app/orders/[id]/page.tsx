'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Package, Clock, Truck, CheckCircle, AlertCircle,
    Loader2, CreditCard, ArrowLeft, Download, FileImage,
    Hash, MapPin, Receipt, Calendar, Eye, ShieldCheck, User
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useOrder } from '@/hooks/useOrders';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/types';
import { OrderStatusStepper } from '@/components/OrderStatusStepper';
import { DesignFilePreview } from '@/components/DesignFilePreview';
import { useState } from 'react';

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { order, isLoading } = useOrder(id as string);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-2" />
                <p className="text-xs font-medium text-slate-500">Memuat rincian pesanan...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-md">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertCircle className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Pesanan Tidak Ditemukan</h2>
                <p className="text-xs text-slate-500 mb-6">Pastikan nomor ID pesanan yang Anda tuju sudah benar.</p>
                <Link href="/my-orders">
                    <Button className="rounded-xl text-xs font-bold">Kembali ke Pesanan Saya</Button>
                </Link>
            </div>
        );
    }

    const isCancelled = order.status === 'CANCELLED' || order.status === 'DIBATALKAN';
    const isPaymentRejected = order.status === 'PEMBAYARAN_DITOLAK';
    const isWaitingPayment = order.status === 'MENUNGGU_PEMBAYARAN' || order.status === 'PENDING' || isPaymentRejected;
    const isWaitingVerification = order.status === 'MENUNGGU_VERIFIKASI';
    const isReady = order.status === 'SIAP_DIAMBIL' || order.status === 'READY';
    const statusMeta = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-800' };

    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.11;

    return (
        <div className="min-h-screen bg-slate-50/50 py-8">
            <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
                {/* Header Navigation & Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <Link href="/my-orders">
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200">
                                <ArrowLeft className="h-4 w-4 text-slate-600" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl font-extrabold text-slate-900">Rincian Pesanan</h1>
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

                    {isWaitingPayment && (
                        <Link href={`/payment/${order.id}`}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs px-5 h-10">
                                {isPaymentRejected ? 'Upload Ulang Bukti' : 'Bayar Sekarang'}
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Unified Status Stepper */}
                <OrderStatusStepper 
                    status={order.status} 
                    shippingMethod={order.shippingMethod} 
                />

                {/* Status Notice Banners */}
                {isPaymentRejected && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                        <div>
                            <p className="font-bold text-xs sm:text-sm">Pembayaran Belum Diterima / Ditolak Admin</p>
                            <p className="text-xs text-rose-700 mt-0.5">Bukti transfer yang dikirim tidak sesuai atau buram. Silakan klik tombol <strong>Upload Ulang Bukti</strong> di atas untuk memproses ulang.</p>
                        </div>
                    </div>
                )}
                {isWaitingVerification && (
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3">
                        <Clock className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                        <div>
                            <p className="font-bold text-xs sm:text-sm">Bukti Pembayaran Sedang Diverifikasi</p>
                            <p className="text-xs text-blue-700 mt-0.5">Admin toko kami sedang memeriksa validitas bukti transfer. Begitu diverifikasi, status akan otomatis berpindah ke Antrean Cetak.</p>
                        </div>
                    </div>
                )}
                {isReady && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                        <div>
                            <p className="font-bold text-xs sm:text-sm">Pesanan Selesai Diproduksi!</p>
                            <p className="text-xs text-emerald-700 mt-0.5">Hasil cetakan Anda telah melewati kontrol kualitas dan siap diambil di toko atau sedang menunggu penjemputan kurir.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Products & Design Files & Payment Proof */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Products List */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                    <Package className="h-4 w-4 text-blue-600" />
                                    Daftar Produk ({order.items.length} Item)
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-5 sm:p-6 space-y-4">
                                        <div className="flex gap-4">
                                            <img
                                                src={item.product?.image || '/placeholder.jpg'}
                                                alt={item.product?.name}
                                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-slate-200 bg-slate-100 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                                                    {item.product?.name}
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {item.quantity} pcs × {formatCurrency(item.price)}
                                                </p>
                                                
                                                {/* Options Badges */}
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {item.width && item.height && (
                                                        <span className="text-[11px] font-bold py-0.5 px-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                                                            Ukuran Banner: {item.width}m × {item.height}m ({(item.width * item.height).toFixed(2)} m²)
                                                        </span>
                                                    )}
                                                    {item.options && typeof item.options === 'object' && Object.entries(item.options).map(([k, v]) => {
                                                        if (['fileName', 'fileUrl', 'width', 'height', 'area'].includes(k) || !v) return null;
                                                        return (
                                                            <span key={k} className="text-[10px] font-medium py-0.5 px-2 bg-slate-100 text-slate-700 rounded-md">
                                                                {k}: {String(v)}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-extrabold text-sm sm:text-base text-blue-600">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Design File Preview with Interactive Thumbnail & Zoom */}
                                        {item.fileUrl && (
                                            <div className="pt-2 border-t border-slate-100">
                                                <DesignFilePreview
                                                    fileUrl={item.fileUrl}
                                                    title="Berkas Desain Anda"
                                                    variant="compact"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Payment Proof Card with View & Download */}
                        {order.paymentProof && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                        <Receipt className="h-4 w-4 text-emerald-600" />
                                        Bukti Pembayaran Terkirim
                                    </h3>
                                    <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                                        Tersimpan
                                    </span>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row items-center gap-5">
                                        <div 
                                            onClick={() => setPreviewModalOpen(true)}
                                            className="relative aspect-video w-full sm:w-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group shrink-0"
                                        >
                                            <img
                                                src={order.paymentProof}
                                                alt="Bukti pembayaran"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                                <Eye className="h-4 w-4" />
                                                <span>Perbesar</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-center sm:text-left flex-1">
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">Struk Pembayaran Berhasil Diunggah</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    Anda dapat melihat atau mengunduh kembali bukti transfer yang telah diserahkan.
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewModalOpen(true)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Lihat Bukti
                                                </button>
                                                <a
                                                    href={order.paymentProof}
                                                    download="Bukti-Pembayaran.jpg"
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    Download Bukti
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right 1 Col: Delivery, Summary & Guarantee */}
                    <div className="space-y-6">
                        {/* Delivery Address Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Alamat Pengiriman</h3>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                {order.shippingAddress || 'Alamat tidak tersedia'}
                            </p>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-slate-400">Metode Kirim:</span>
                                <span className="font-bold text-slate-800">{order.shippingMethod || 'Standard'}</span>
                            </div>
                        </div>

                        {/* Payment Breakdown Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                <CreditCard className="h-4 w-4 text-blue-600" />
                                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Ringkasan Biaya</h3>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal Produk</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Pajak PPN (11%)</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Biaya Pengiriman</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(order.shippingCost || 0)}</span>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                                    <span className="font-bold text-sm text-slate-900">Total Bayar</span>
                                    <span className="font-black text-lg text-blue-600">{formatCurrency(order.totalAmount)}</span>
                                </div>

                                <div className="pt-2 flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Metode Bayar:</span>
                                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                        {order.paymentMethod || 'QRIS'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Hasil Cetak Bergaransi Kualitas</span>
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
                            <h4 className="font-bold text-sm text-slate-900">Pratinjau Bukti Pembayaran</h4>
                            <div className="flex items-center gap-2">
                                <a
                                    href={order.paymentProof}
                                    download="Bukti-Pembayaran.jpg"
                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                    title="Download Bukti"
                                >
                                    <Download className="h-4 w-4" />
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
        </div>
    );
}
