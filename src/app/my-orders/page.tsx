'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    Package, 
    Clock, 
    Truck, 
    CheckCircle, 
    XCircle, 
    RefreshCw, 
    Loader2, 
    Eye, 
    Printer, 
    Scissors, 
    Receipt, 
    ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { ORDER_STATUS_LABELS } from '@/types';

const STATUS_TABS = [
    { id: 'all', label: 'Semua', icon: Package },
    { id: 'MENUNGGU_PEMBAYARAN', label: 'Belum Bayar', icon: Clock },
    { id: 'MENUNGGU_VERIFIKASI', label: 'Verifikasi', icon: RefreshCw },
    { id: 'ANTRIAN_PRODUKSI', label: 'Antrean Cetak', icon: Printer },
    { id: 'SEDANG_DICETAK', label: 'Sedang Dicetak', icon: RefreshCw },
    { id: 'FINISHING', label: 'Finishing', icon: Scissors },
    { id: 'SIAP_DIAMBIL', label: 'Siap Diambil/Kirim', icon: Truck },
    { id: 'SELESAI', label: 'Selesai', icon: CheckCircle },
    { id: 'DIBATALKAN', label: 'Dibatalkan', icon: XCircle },
];

export default function MyOrdersPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchOrders();
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/user/orders');
            const data = await res.json();
            if (data.success) {
                setAllOrders(data.data || []);
            } else {
                toast.error(data.error || 'Gagal memuat pesanan');
            }
        } catch (error) {
            toast.error('Gagal memuat pesanan');
        } finally {
            setIsLoading(false);
        }
    };

    const orders = activeTab === 'all'
        ? allOrders
        : allOrders.filter(o => o.status === activeTab);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Pesanan Saya</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Pantau status pengerjaan cetakan dan riwayat pesanan Anda secara real-time.
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchOrders} 
                    disabled={isLoading}
                    className="gap-2 text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 w-fit"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Segarkan
                </Button>
            </div>

            {/* Filter Tabs with Notification Badges */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
                {STATUS_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const count = tab.id === 'all'
                        ? allOrders.length
                        : allOrders.filter(o => o.status === tab.id).length;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{tab.label}</span>
                            {count > 0 && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                    activeTab === tab.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-100 text-slate-700'
                                }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Orders List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-xs text-slate-400">Memuat riwayat pesanan...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <Package className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-base font-semibold text-slate-800">Tidak ada pesanan</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                        {activeTab === 'all' 
                            ? 'Anda belum memiliki riwayat pesanan. Mulai belanja produk cetak berkualitas kami.' 
                            : 'Tidak ada pesanan dengan status yang dipilih.'}
                    </p>
                    <Link href="/products">
                        <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5">
                            Belanja Sekarang
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order: any) => {
                        const statusMeta = ORDER_STATUS_LABELS[order.status] || { 
                            label: order.status, 
                            color: 'bg-slate-100 text-slate-800 border-slate-200' 
                        };
                        const isWaitingPayment = order.status === 'MENUNGGU_PEMBAYARAN' || order.status === 'PENDING';
                        const isWaitingVerif = order.status === 'MENUNGGU_VERIFIKASI';

                        return (
                            <div 
                                key={order.id} 
                                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 sm:p-6 space-y-4"
                            >
                                {/* Order Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                            {order.orderNo || `#${order.id.slice(0, 8).toUpperCase()}`}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.color}`}>
                                        {statusMeta.label}
                                    </span>
                                </div>

                                {/* Order Items Preview */}
                                <div className="space-y-3">
                                    {order.items?.slice(0, 2).map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                {item.product?.image ? (
                                                    <img
                                                        src={item.product?.image}
                                                        alt={item.product?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="h-6 w-6 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 text-sm truncate">
                                                    {item.product?.name}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {item.quantity} pcs × {formatCurrency(item.price)}
                                                </p>
                                                {item.width && item.height && (
                                                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                                                        Ukuran Banner: {item.width}m × {item.height}m ({(item.width * item.height).toFixed(2)} m²)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {order.items?.length > 2 && (
                                        <p className="text-xs text-slate-500 font-medium pl-1">
                                            +{order.items.length - 2} produk lainnya dalam pesanan ini
                                        </p>
                                    )}
                                </div>

                                {/* Alerts for Pending Action */}
                                {isWaitingPayment && (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                                            <span>Silakan selesaikan pembayaran dan unggah bukti transfer.</span>
                                        </div>
                                        <Link 
                                            href={`/payment/${order.id}`}
                                            className="font-bold text-amber-800 underline hover:text-amber-950 shrink-0"
                                        >
                                            Unggah Bukti →
                                        </Link>
                                    </div>
                                )}
                                {isWaitingVerif && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4 text-blue-600 shrink-0 animate-spin" />
                                        <span>Bukti transfer telah diterima dan sedang diverifikasi oleh Tim Admin.</span>
                                    </div>
                                )}

                                {/* Order Footer: Total & Actions */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider block">
                                            Total Pembayaran
                                        </span>
                                        <span className="text-lg font-bold text-slate-900">
                                            {formatCurrency(order.totalAmount)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isWaitingPayment && (
                                            <Link href={`/payment/${order.id}`}>
                                                <Button size="sm" className="rounded-xl text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs">
                                                    <Receipt className="h-3.5 w-3.5" />
                                                    Bayar Sekarang
                                                </Button>
                                            </Link>
                                        )}
                                        <Link href={`/orders/${order.id}`}>
                                            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50">
                                                <Eye className="h-3.5 w-3.5" />
                                                Detail Pesanan
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
