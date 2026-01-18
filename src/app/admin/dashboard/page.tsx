'use client';

import { ShoppingBag, DollarSign, Clock, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAdminStats, useAdminOrders } from '@/hooks/useAdminOrders';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export default function AdminDashboardPage() {
    const { stats, isLoading: statsLoading } = useAdminStats();
    const { orders: recentOrders, isLoading: ordersLoading } = useAdminOrders();

    const dashboardStats = [
        {
            title: 'Total Pendapatan',
            value: stats.totalRevenue,
            icon: DollarSign,
            color: 'text-green-600',
        },
        {
            title: 'Total Pesanan',
            value: stats.totalOrders,
            icon: ShoppingBag,
            color: 'text-blue-600',
        },
        {
            title: 'Pesanan Pending',
            value: stats.pendingOrders,
            icon: Clock,
            color: 'text-orange-600',
        },
        {
            title: 'Total Pelanggan',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-purple-600',
        },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {dashboardStats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statsLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                ) : (
                                    stat.title.includes('Pendapatan')
                                        ? formatCurrency(stat.value as number)
                                        : stat.value
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview Penjualan</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] w-full bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                            Chart Placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Pesanan Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {ordersLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                </div>
                            ) : recentOrders.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">Belum ada pesanan.</p>
                            ) : (
                                recentOrders.slice(0, 5).map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {order.user?.name || 'Pelanggan'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatDate(order.createdAt)} • {formatCurrency(order.totalAmount)}
                                            </p>
                                        </div>
                                        <Badge status={order.status === 'COMPLETED' ? 'success' : 'warning'} className="text-[10px] px-1.5 py-0 h-5">
                                            {order.status}
                                        </Badge>
                                    </div>
                                ))
                            )}
                            <Link href="/admin/orders" className="block text-center text-xs text-blue-600 hover:underline pt-2">
                                Lihat Semua Pesanan
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
