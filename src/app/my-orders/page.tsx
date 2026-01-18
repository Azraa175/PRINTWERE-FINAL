'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, Truck, CheckCircle, XCircle, RefreshCw, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    items: {
        id: string;
        quantity: number;
        price: number;
        product: {
            id: string;
            name: string;
            image: string;
        };
    }[];
}

const STATUS_TABS = [
    { id: 'all', label: 'Semua', icon: Package },
    { id: 'PENDING', label: 'Belum Bayar', icon: Clock },
    { id: 'CONFIRMED', label: 'Dikemas', icon: Package },
    { id: 'PROCESSING', label: 'Diproses', icon: RefreshCw },
    { id: 'READY', label: 'Siap Kirim', icon: Truck },
    { id: 'COMPLETED', label: 'Selesai', icon: CheckCircle },
    { id: 'CANCELLED', label: 'Dibatalkan', icon: XCircle },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
        case 'PROCESSING': return 'bg-indigo-100 text-indigo-800';
        case 'READY': return 'bg-cyan-100 text-cyan-800';
        case 'COMPLETED': return 'bg-green-100 text-green-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const getStatusLabel = (status: string) => {
    const tab = STATUS_TABS.find(t => t.id === status);
    return tab?.label || status;
};

export default function MyOrdersPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchOrders();
    }, [isAuthenticated, activeTab]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const url = activeTab === 'all'
                ? '/api/user/orders'
                : `/api/user/orders?status=${activeTab}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            } else {
                toast.error(data.error || 'Gagal memuat pesanan');
            }
        } catch (error) {
            toast.error('Gagal memuat pesanan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Pesanan Saya</h1>

            {/* Status Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b">
                {STATUS_TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Orders List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                    <Package className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Tidak ada pesanan</p>
                    <Link href="/products">
                        <Button className="mt-4">Belanja Sekarang</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg border p-4">
                            {/* Order Header */}
                            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-slate-500">
                                        {formatDate(order.createdAt)}
                                    </span>
                                    <span className="text-sm font-mono text-slate-600">
                                        #{order.id.slice(0, 8).toUpperCase()}
                                    </span>
                                </div>
                                <Badge
                                    status={
                                        order.status === 'COMPLETED' ? 'success' :
                                            order.status === 'CANCELLED' ? 'error' :
                                                order.status === 'PENDING' ? 'default' : 'info'
                                    }
                                >
                                    {getStatusLabel(order.status)}
                                </Badge>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3">
                                {order.items.slice(0, 2).map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <img
                                            src={item.product.image || '/placeholder.jpg'}
                                            alt={item.product.name}
                                            className="w-16 h-16 object-cover rounded-lg border"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">{item.product.name}</p>
                                            <p className="text-sm text-slate-500">{item.quantity} x {formatCurrency(item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                                {order.items.length > 2 && (
                                    <p className="text-sm text-slate-500">
                                        +{order.items.length - 2} produk lainnya
                                    </p>
                                )}
                            </div>

                            {/* Order Footer */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div>
                                    <span className="text-sm text-slate-500">Total: </span>
                                    <span className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span>
                                </div>
                                <Link href={`/orders/${order.id}`}>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Eye className="h-4 w-4" />
                                        Lihat Detail
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
