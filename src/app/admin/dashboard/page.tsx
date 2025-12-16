'use client';

import { ShoppingBag, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboardPage() {
    // Mock stats
    const stats = [
        {
            title: 'Total Pendapatan',
            value: 15450000,
            icon: DollarSign,
            trend: '+12.5%',
            color: 'text-green-600',
        },
        {
            title: 'Total Pesanan',
            value: 124,
            icon: ShoppingBag,
            trend: '+8.2%',
            color: 'text-blue-600',
        },
        {
            title: 'Pesanan Pending',
            value: 12,
            icon: Clock,
            trend: '-2.4%',
            color: 'text-orange-600',
        },
        {
            title: 'Produk Terlaris',
            value: 'Kartu Nama',
            icon: TrendingUp,
            trend: '+4.1%',
            color: 'text-purple-600',
        },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {typeof stat.value === 'number' && stat.title.includes('top')
                                    ? stat.value
                                    : stat.title.includes('Pendapatan')
                                        ? formatCurrency(stat.value as number)
                                        : stat.value}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                <span className={stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                                    {stat.trend}
                                </span>{' '}
                                dari bulan lalu
                            </p>
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
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Order #ORD-{2024000 + i}</p>
                                        <p className="text-xs text-slate-500">2 items • Rp 150.000</p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm text-green-600">
                                        Selesai
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
