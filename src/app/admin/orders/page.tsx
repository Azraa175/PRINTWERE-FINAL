'use client';

import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatus } from '@/types';

// Mock Orders Data (same as service but exposed here for map)
const MOCK_ADMIN_ORDERS = [
    {
        id: 'ORD-20231215-001',
        customer: 'Budi Santoso',
        total: 90000,
        status: 'COMPLETED' as OrderStatus,
        date: '2023-12-15T10:00:00Z',
    },
    {
        id: 'ORD-20231216-002',
        customer: 'Siti Aminah',
        total: 75000,
        status: 'PROCESSING' as OrderStatus,
        date: '2023-12-16T09:30:00Z',
    },
    {
        id: 'ORD-20231216-003',
        customer: 'Ahmad Dani',
        total: 350000,
        status: 'PENDING' as OrderStatus,
        date: '2023-12-16T14:15:00Z',
    },
];

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'COMPLETED': return 'bg-green-100 text-green-800';
        case 'PROCESSING': return 'bg-blue-100 text-blue-800';
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

export default function AdminOrdersPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Pesanan</h1>

            <div className="rounded-md border border-slate-200 bg-white">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-3">ID Pesanan</th>
                            <th className="px-6 py-3">Pelanggan</th>
                            <th className="px-6 py-3">Tanggal</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_ADMIN_ORDERS.map((order) => (
                            <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{order.id}</td>
                                <td className="px-6 py-4">{order.customer}</td>
                                <td className="px-6 py-4">{formatDate(order.date)}</td>
                                <td className="px-6 py-4">{formatCurrency(order.total)}</td>
                                <td className="px-6 py-4">
                                    <Badge variant="secondary" className={getStatusColor(order.status)}>
                                        {order.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title="Lihat Detail">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {order.status === 'PENDING' && (
                                            <>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" title="Terima">
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" title="Tolak">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
