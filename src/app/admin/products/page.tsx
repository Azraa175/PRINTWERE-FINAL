'use client';

import Link from 'next/link';
import { Plus, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_PRODUCTS } from '@/services/products';
import { formatCurrency } from '@/lib/utils';

export default function AdminProductsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Produk</h1>
                <Link href="/admin/products/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Tambah Produk
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border border-slate-200 bg-white">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-3">Nama Produk</th>
                            <th className="px-6 py-3">Kategori</th>
                            <th className="px-6 py-3">Harga</th>
                            <th className="px-6 py-3">Stok</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_PRODUCTS.map((product) => (
                            <tr key={product.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                                <td className="px-6 py-4">{product.category}</td>
                                <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                                <td className="px-6 py-4">{product.stock}</td>
                                <td className="px-6 py-4">
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        Aktif
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                                            <Trash className="h-4 w-4" />
                                        </Button>
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
