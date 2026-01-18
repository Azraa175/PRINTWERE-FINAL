'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    sizes?: string;
    finishing?: string;
    isRecommended: boolean;
    _count?: { orderItems: number };
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            } else {
                toast.error(data.error || 'Gagal memuat produk');
            }
        } catch (error) {
            toast.error('Gagal memuat produk');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus produk "${name}"?`)) return;

        setIsDeleting(id);
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Produk berhasil dihapus');
                fetchProducts();
            } else {
                toast.error(data.error || 'Gagal menghapus produk');
            }
        } catch (error) {
            toast.error('Gagal menghapus produk');
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Produk</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchProducts} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href="/admin/products/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Tambah Produk
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        Belum ada produk. Klik "Tambah Produk" untuk membuat produk baru.
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">Nama Produk</th>
                                <th className="px-6 py-3">Kategori</th>
                                <th className="px-6 py-3">Harga</th>
                                <th className="px-6 py-3">Stok</th>
                                <th className="px-6 py-3">Order</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                                    <td className="px-6 py-4">{product.category}</td>
                                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                                    <td className="px-6 py-4">{product.stock}</td>
                                    <td className="px-6 py-4">{product._count?.orderItems || 0}</td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant="secondary"
                                            className={product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                                        >
                                            {product.stock > 0 ? 'Aktif' : 'Habis'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600"
                                                onClick={() => handleDelete(product.id, product.name)}
                                                disabled={isDeleting === product.id}
                                            >
                                                {isDeleting === product.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
