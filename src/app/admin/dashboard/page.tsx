'use client';

import { 
    ShoppingBag, 
    DollarSign, 
    Clock, 
    Users, 
    Loader2, 
    Printer, 
    CheckCircle2, 
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    Calendar,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAdminStats, useAdminOrders } from '@/hooks/useAdminOrders';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ORDER_STATUS_LABELS } from '@/types';

export default function AdminDashboardPage() {
    const { stats, isLoading: statsLoading } = useAdminStats();
    const { orders: recentOrders, isLoading: ordersLoading } = useAdminOrders();

    const dashboardStats = [
        {
            title: 'Total Pendapatan',
            value: stats.totalRevenue,
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-200',
        },
        {
            title: 'Total Pesanan',
            value: stats.totalOrders,
            icon: ShoppingBag,
            color: 'text-blue-600',
            bg: 'bg-blue-50 border-blue-200',
        },
        {
            title: 'Menunggu Verifikasi',
            value: stats.waitingVerification ?? stats.pendingOrders,
            icon: AlertCircle,
            color: 'text-amber-600',
            bg: 'bg-amber-50 border-amber-200',
        },
        {
            title: 'Dalam Produksi',
            value: stats.inProductionOrders ?? 0,
            icon: Printer,
            color: 'text-purple-600',
            bg: 'bg-purple-50 border-purple-200',
        },
        {
            title: 'Pesanan Selesai',
            value: stats.completedOrders ?? 0,
            icon: CheckCircle2,
            color: 'text-teal-600',
            bg: 'bg-teal-50 border-teal-200',
        },
        {
            title: 'Total Pelanggan',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 border-indigo-200',
        },
    ];

    // Weekly sales simulation data for visualization
    const weeklyData = [
        { day: 'Sen', amount: 450000, height: '45%' },
        { day: 'Sel', amount: 620000, height: '62%' },
        { day: 'Rab', amount: 890000, height: '89%' },
        { day: 'Kam', amount: 530000, height: '53%' },
        { day: 'Jum', amount: 980000, height: '98%' },
        { day: 'Sab', amount: 750000, height: '75%' },
        { day: 'Min', amount: 410000, height: '41%' },
    ];

    return (
        <div className="space-y-6">
            {/* Top Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        Ringkasan Operasional PrintWere
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Pantau metrik penjualan, antrean produksi, dan verifikasi bukti bayar pelanggan secara terpadu.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/orders">
                        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all">
                            <span>Kelola Pesanan</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Metrics 6-Card Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {dashboardStats.map((stat) => (
                    <div 
                        key={stat.title}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
                                {stat.title}
                            </span>
                            <div className={`h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </div>

                        <div>
                            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                {statsLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-slate-400 my-1" />
                                ) : (
                                    stat.title.includes('Pendapatan')
                                        ? formatCurrency(stat.value as number)
                                        : stat.value
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Split Section: Analytics Chart & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                {/* Sales Chart (4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                Aktivitas Transaksi Mingguan
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Grafik pergerakan omzet pesanan percetakan</p>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            +18.4% Minggu Ini
                        </span>
                    </div>

                    {/* Interactive Bar Chart Visualization */}
                    <div className="pt-4 pb-2">
                        <div className="flex items-end justify-between gap-3 h-48 px-2">
                            {weeklyData.map((bar) => (
                                <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                    <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {(bar.amount / 1000).toFixed(0)}k
                                    </span>
                                    <div className="w-full bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden">
                                        <div 
                                            className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                                            style={{ height: bar.height }}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-600">{bar.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Puncak pesanan rata-rata pada hari Jumat</span>
                        <span className="font-bold text-slate-800">Rata-rata Rp 670.000 / hari</span>
                    </div>
                </div>

                {/* Recent Orders (3 cols) */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                Pesanan Terbaru
                            </h3>
                            <Link href="/admin/orders" className="text-xs font-semibold text-blue-600 hover:underline">
                                Semua ({recentOrders.length})
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100 mt-2">
                            {ordersLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
                                    <span className="text-xs">Memuat pesanan...</span>
                                </div>
                            ) : recentOrders.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-8">Belum ada pesanan terbaru.</p>
                            ) : (
                                recentOrders.slice(0, 5).map((order: any) => {
                                    const statusInfo = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-800' };
                                    return (
                                        <Link 
                                            key={order.id} 
                                            href={`/admin/orders/${order.id}`}
                                            className="py-3 flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors group block"
                                        >
                                            <div className="space-y-0.5 min-w-0 pr-2">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                                        {order.user?.name || 'Pelanggan'}
                                                    </p>
                                                    <span className="font-mono text-[10px] text-slate-400">
                                                        {order.orderNo || ''}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500">
                                                    {formatDate(order.createdAt)} • <span className="font-semibold text-slate-800">{formatCurrency(order.totalAmount)}</span>
                                                </p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border whitespace-nowrap shrink-0 ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <Link 
                        href="/admin/orders" 
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                        <span>Buka Manajemen Pesanan Lengkap</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
