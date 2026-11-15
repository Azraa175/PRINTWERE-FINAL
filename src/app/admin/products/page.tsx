'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    Plus, 
    Edit, 
    Trash, 
    Loader2, 
    RefreshCw, 
    Search, 
    Package, 
    Layers, 
    CheckCircle2, 
    AlertTriangle 
} from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data || []);
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
        if (!confirm(`Hapus produk "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;

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

    // Categories list for filter
    const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900">Katalog Produk</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Kelola katalog produk percetakan, harga per satuan / m², dan stok barang.
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={fetchProducts} 
                        disabled={isLoading}
                        className="gap-2 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex-1 sm:flex-none"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Segarkan
                    </Button>
                    <Link href="/admin/products/create" className="flex-1 sm:flex-none">
                        <Button size="sm" className="w-full gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                            <Plus className="h-4 w-4" /> Tambah Produk
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 md:items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama atau kategori produk..."
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Kategori:</span>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="flex-1 md:flex-none text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat === 'ALL' ? 'Semua Kategori' : cat}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-xs text-slate-400">Memuat katalog produk...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-slate-800">
                            {products.length === 0 ? 'Belum Ada Produk' : 'Produk Tidak Ditemukan'}
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                            {products.length === 0 
                                ? 'Mulai tambahkan produk percetakan baru ke dalam etalase toko Anda.'
                                : 'Tidak ditemukan produk yang cocok dengan pencarian atau filter yang dipilih.'}
                        </p>
                        {products.length === 0 ? (
                            <Link href="/admin/products/create">
                                <Button size="sm" className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="h-4 w-4" /> Tambah Produk Sekarang
                                </Button>
                            </Link>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
                                className="rounded-xl text-xs"
                            >
                                Reset Filter
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="block md:hidden divide-y divide-slate-100">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Package className="h-6 w-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-semibold text-sm text-slate-900 leading-snug">
                                                    {product.name}
                                                </p>
                                                {product.isRecommended && (
                                                    <span className="shrink-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                        Unggulan
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                                {product.description || 'Tidak ada deskripsi'}
                                            </p>
                                            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700">
                                                <Layers className="h-3 w-3 text-slate-400" />
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2">
                                            <p className="text-[10px] uppercase font-semibold text-slate-400">Harga</p>
                                            <p className="font-bold text-slate-900 leading-tight mt-0.5 break-words">
                                                {formatCurrency(product.price)}
                                            </p>
                                            {product.category?.toLowerCase().includes('banner') && (
                                                <p className="text-[10px] text-blue-600 font-medium">/ m²</p>
                                            )}
                                        </div>
                                        <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2">
                                            <p className="text-[10px] uppercase font-semibold text-slate-400">Stok</p>
                                            <p className="font-bold text-slate-900 mt-0.5">{product.stock}</p>
                                        </div>
                                        <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2">
                                            <p className="text-[10px] uppercase font-semibold text-slate-400">Terjual</p>
                                            <p className="font-bold text-slate-900 mt-0.5">{product._count?.orderItems || 0}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <Badge
                                            variant="secondary"
                                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                                product.stock > 0
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-red-50 text-red-700 border border-red-200'
                                            }`}
                                        >
                                            {product.stock > 0 ? 'Tersedia' : 'Habis'}
                                        </Badge>
                                        <div className="flex items-center gap-1.5">
                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-1.5 rounded-lg text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                onClick={() => handleDelete(product.id, product.name)}
                                                disabled={isDeleting === product.id}
                                                title="Hapus Produk"
                                            >
                                                {isDeleting === product.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                                ) : (
                                                    <Trash className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3.5">Produk</th>
                                    <th className="px-6 py-3.5">Kategori</th>
                                    <th className="px-6 py-3.5">Harga</th>
                                    <th className="px-6 py-3.5">Stok</th>
                                    <th className="px-6 py-3.5">Terjual</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                    {product.image ? (
                                                        <img 
                                                            src={product.image} 
                                                            alt={product.name} 
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="h-6 w-6 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-900 line-clamp-1">
                                                            {product.name}
                                                        </span>
                                                        {product.isRecommended && (
                                                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                                                Unggulan
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                                        {product.description || 'Tidak ada deskripsi'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                                                <Layers className="h-3 w-3 text-slate-400" />
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-900">
                                                {formatCurrency(product.price)}
                                            </span>
                                            {product.category?.toLowerCase().includes('banner') && (
                                                <span className="text-[11px] text-blue-600 block font-medium">/ m²</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">
                                            {product.stock}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {product._count?.orderItems || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="secondary"
                                                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                                    product.stock > 0 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                        : 'bg-red-50 text-red-700 border border-red-200'
                                                }`}
                                            >
                                                {product.stock > 0 ? 'Tersedia' : 'Habis'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-1.5">
                                                <Link href={`/admin/products/${product.id}/edit`}>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                                        title="Edit Produk"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    disabled={isDeleting === product.id}
                                                    title="Hapus Produk"
                                                >
                                                    {isDeleting === product.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
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
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
