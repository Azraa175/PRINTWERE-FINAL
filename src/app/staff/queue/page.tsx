'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Printer, 
    Scissors, 
    CheckCircle2, 
    Clock, 
    Download, 
    FileText, 
    User, 
    Phone, 
    ArrowRight, 
    RefreshCw, 
    AlertCircle,
    Calendar,
    Home,
    ShieldCheck,
    Loader2,
    MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { ORDER_STATUS_LABELS } from '@/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import { DesignFilePreview } from '@/components/DesignFilePreview';

export default function StaffProductionQueuePage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    // Proteksi role
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user && user.role !== 'STAFF' && user.role !== 'ADMIN') {
            toast.error('Halaman ini khusus untuk Karyawan Produksi & Admin');
            router.push('/');
        }
    }, [isAuthenticated, user, router]);

    const fetchQueue = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/staff/queue?status=${statusFilter}`);
            const data = await res.json();
            if (data.success) {
                setOrders(data.data || []);
            } else {
                toast.error(data.error || 'Gagal memuat antrian produksi');
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan saat memuat antrian');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && (user?.role === 'STAFF' || user?.role === 'ADMIN')) {
            fetchQueue();
        }
    }, [statusFilter, isAuthenticated, user]);

    const handleUpdateStatus = async (orderId: string, nextStatus: string, actionLabel: string) => {
        try {
            setUpdatingOrderId(orderId);
            const res = await fetch('/api/staff/queue', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    nextStatus,
                    note: `Karyawan (${user?.name}) memperbarui status ke ${actionLabel}`
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(`Pesanan berhasil diperbarui ke: ${actionLabel}`);
                fetchQueue();
            } else {
                toast.error(data.error || 'Gagal memperbarui status');
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal memperbarui status');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    // Hitung ringkasan stats
    const stats = {
        antrian: orders.filter(o => o.status === 'ANTRIAN_PRODUKSI' || o.status === 'CONFIRMED').length,
        dicetak: orders.filter(o => o.status === 'SEDANG_DICETAK' || o.status === 'PROCESSING').length,
        finishing: orders.filter(o => o.status === 'FINISHING').length,
        siap: orders.filter(o => o.status === 'SIAP_DIAMBIL' || o.status === 'READY').length,
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Bagian Atas */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                                <Printer className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Antrean Produksi</h1>
                                <p className="text-sm text-slate-500">
                                    Operator: <span className="font-semibold text-purple-700">{user?.name}</span> ({user?.role})
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1.5 text-xs text-slate-700 border-slate-200 hover:bg-slate-50"
                            >
                                <Home className="h-3.5 w-3.5 text-slate-500" />
                                Toko
                            </Button>
                        </Link>
                        {user?.role === 'ADMIN' && (
                            <Link href="/admin/dashboard">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-1.5 text-xs text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100"
                                >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Admin
                                </Button>
                            </Link>
                        )}
                        <Button 
                            variant="default" 
                            size="sm" 
                            onClick={fetchQueue} 
                            disabled={isLoading}
                            className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            Segarkan
                        </Button>
                    </div>
                </div>

                {/* Kartu Ringkasan Status Produksi */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                        <div className="h-11 w-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Siap Cetak</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.antrian}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                        <div className="h-11 w-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <Printer className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Dicetak</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.dicetak}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                        <div className="h-11 w-11 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center shrink-0">
                            <Scissors className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Finishing</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.finishing}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                        <div className="h-11 w-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Siap Diambil</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.siap}</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tab dengan Counter Badge (Horizontal Scrollable edge-to-edge on mobile) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {[
                        { id: 'ALL', label: 'Semua', count: orders.length },
                        { id: 'ANTRIAN_PRODUKSI', label: 'Siap Cetak', count: stats.antrian },
                        { id: 'SEDANG_DICETAK', label: 'Dicetak', count: stats.dicetak },
                        { id: 'FINISHING', label: 'Finishing', count: stats.finishing },
                        { id: 'SIAP_DIAMBIL', label: 'Siap Diambil', count: stats.siap },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                                statusFilter === tab.id
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                statusFilter === tab.id
                                    ? 'bg-purple-800 text-purple-100'
                                    : 'bg-slate-100 text-slate-600'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Konten Daftar Pekerjaan */}
                {isLoading ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-3" />
                        <p className="text-slate-500 font-medium">Memuat antrian pekerjaan...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-900">Tidak ada antrian pekerjaan aktif</h3>
                        <p className="text-slate-500 text-sm mt-1">Semua pesanan pada filter ini sudah selesai dikerjakan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {orders.map((order) => {
                            const statusMeta = ORDER_STATUS_LABELS[order.status] || {
                                label: order.status,
                                color: 'text-slate-700 bg-slate-100 border-slate-300'
                            };

                            const isUpdating = updatingOrderId === order.id;

                            return (
                                <div 
                                    key={order.id} 
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                >
                                    {/* Baris Header Kartu - Mobile Optimized with No-Wrap Order Number */}
                                    <div className="bg-slate-50/90 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                            <span className="font-mono font-bold text-sm sm:text-base text-slate-900 whitespace-nowrap shrink-0 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                                                {order.orderNo || `ORDER #${order.id.slice(-6)}`}
                                            </span>
                                            <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold border whitespace-nowrap ${statusMeta.color}`}>
                                                {statusMeta.label}
                                            </span>
                                            <span className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                Masuk: {formatDate(order.createdAt)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] sm:text-xs px-2.5 py-1 bg-amber-50 text-amber-700 font-semibold rounded-lg border border-amber-200 whitespace-nowrap">
                                                {order.deliveryType === 'PICKUP' ? '📦 Ambil di Toko' : '🚚 Kirim via Kurir'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Isi Pesanan */}
                                    <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Kolom 1 & 2: Detail Produk & Berkas Cetak */}
                                        <div className="lg:col-span-2 space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Spesifikasi Cetakan
                                            </h4>
                                            
                                            {order.items?.map((item: any, idx: number) => {
                                                const isBannerM2 = item.product?.priceType === 'M2' || (item.width && item.height);

                                                return (
                                                    <div 
                                                        key={idx} 
                                                        className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                                                                    {item.product?.name || 'Produk Percetakan'}
                                                                </h5>
                                                                <p className="text-xs text-slate-500">
                                                                    Kategori: {item.product?.category || 'Percetakan'}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs sm:text-sm font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs shrink-0">
                                                                Jumlah: {item.quantity} pcs
                                                            </span>
                                                        </div>

                                                        {/* Info Dimensi jika Banner / Spanduk M2 */}
                                                        {isBannerM2 && (
                                                            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2 font-medium">
                                                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                                                                    UKURAN M²
                                                                </span>
                                                                <span>
                                                                    Panjang: <strong>{item.width || '-'} m</strong> × Lebar: <strong>{item.height || '-'} m</strong> 
                                                                    {item.width && item.height && (
                                                                        <span className="text-blue-700 ml-1">
                                                                            (Luas: {(item.width * item.height).toFixed(2)} m²)
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Opsi Bahan / Finishing */}
                                                        {item.options && (
                                                            <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                                                                <span className="font-semibold text-slate-700">Pilihan Varian / Finishing:</span>
                                                                <p className="mt-0.5 text-slate-800 font-mono text-[11px] sm:text-xs">
                                                                    {typeof item.options === 'object' 
                                                                        ? Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' | ')
                                                                        : String(item.options)
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Catatan Khusus Desain */}
                                                        {item.notes && (
                                                            <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                                                <strong>Catatan Khusus:</strong> {item.notes}
                                                            </p>
                                                        )}

                                                        {/* File Desain Pelanggan with Thumbnail & Zoom Gallery */}
                                                        {item.fileUrl && (
                                                            <div className="pt-2 border-t border-slate-200">
                                                                <DesignFilePreview
                                                                    fileUrl={item.fileUrl}
                                                                    title="File Desain Siap Cetak"
                                                                    variant="compact"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {order.note && (
                                                <div className="text-xs bg-slate-100 p-3 rounded-lg text-slate-700">
                                                    <strong>Catatan:</strong> {order.note}
                                                </div>
                                            )}
                                        </div>

                                        {/* Kolom 3: Info Pelanggan & Tombol Aksi Karyawan */}
                                        <div className="space-y-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l lg:pl-6 border-slate-200 pt-4 lg:pt-0">
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    Pemesan
                                                </h4>
                                                <div className="space-y-1.5 text-sm">
                                                    <p className="font-semibold text-slate-900 flex items-center gap-2">
                                                        <User className="h-4 w-4 text-slate-400" />
                                                        {order.user?.name || 'Pelanggan'}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-slate-600 flex items-center gap-1.5 text-xs font-mono">
                                                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                            {order.user?.phone || 'Tidak ada nomor'}
                                                        </p>
                                                        {order.user?.phone && (
                                                            <a
                                                                href={`https://wa.me/${order.user.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition-colors"
                                                            >
                                                                <MessageCircle className="h-3 w-3" />
                                                                WA
                                                            </a>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-2">
                                                        <strong>Alamat:</strong> {order.shippingAddress || '-'}
                                                    </p>
                                                </div>

                                                {/* Riwayat Log Terakhir */}
                                                {order.statusLogs && order.statusLogs.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                                                        <span className="font-semibold text-slate-700">Riwayat Terakhir:</span>
                                                        <p className="italic">
                                                            "{order.statusLogs[0]?.note || 'Perubahan status'}"
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {formatDate(order.statusLogs[0]?.createdAt)} oleh {order.statusLogs[0]?.changedBy?.name || 'Sistem'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tombol Aksi Status Sesuai Urutan Alur Kerja */}
                                            <div className="pt-4 border-t border-slate-200 space-y-2">
                                                <p className="text-xs font-semibold text-slate-700">
                                                    Aksi Produksi:
                                                </p>

                                                {(order.status === 'ANTRIAN_PRODUKSI' || order.status === 'CONFIRMED') && (
                                                    <Button
                                                        onClick={() => handleUpdateStatus(order.id, 'SEDANG_DICETAK', 'Sedang Dicetak')}
                                                        disabled={isUpdating}
                                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs py-2.5 shadow-xs"
                                                    >
                                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                                                        {isUpdating ? 'Memproses...' : 'Mulai Cetak'}
                                                    </Button>
                                                )}

                                                {(order.status === 'SEDANG_DICETAK' || order.status === 'PROCESSING') && (
                                                    <Button
                                                        onClick={() => handleUpdateStatus(order.id, 'FINISHING', 'Finishing & Potong')}
                                                        disabled={isUpdating}
                                                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white gap-2 text-xs py-2.5 shadow-xs"
                                                    >
                                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
                                                        {isUpdating ? 'Memproses...' : 'Lanjut Finishing'}
                                                    </Button>
                                                )}

                                                {order.status === 'FINISHING' && (
                                                    <Button
                                                        onClick={() => handleUpdateStatus(order.id, 'SIAP_DIAMBIL', 'Siap Diambil / Dikirim')}
                                                        disabled={isUpdating}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs py-2.5 shadow-xs"
                                                    >
                                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                        {isUpdating ? 'Memproses...' : 'Siap Diambil'}
                                                    </Button>
                                                )}

                                                {(order.status === 'SIAP_DIAMBIL' || order.status === 'READY') && (
                                                    <Button
                                                        onClick={() => handleUpdateStatus(order.id, 'SELESAI', 'Selesai')}
                                                        disabled={isUpdating}
                                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2 text-xs py-2.5 shadow-xs"
                                                    >
                                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                        {isUpdating ? 'Memproses...' : 'Selesai'}
                                                    </Button>
                                                )}

                                                {order.status === 'SELESAI' && (
                                                    <div className="text-center p-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center justify-center gap-1.5">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        Selesai
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

