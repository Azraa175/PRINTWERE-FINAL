'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Keranjang Belanja Masih Kosong</h2>
                <p className="text-xs text-slate-500 max-w-sm mb-6">
                    Anda belum memasukkan produk percetakan ke dalam keranjang. Mulai jelajahi katalog kami.
                </p>
                <Link href="/products">
                    <Button className="rounded-xl px-6 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white">
                        Jelajahi Produk Cetak
                    </Button>
                </Link>
            </div>
        );
    }

    const subtotal = totalPrice();
    const tax = subtotal * 0.11;
    const finalTotal = subtotal + tax;

    return (
        <div className="min-h-screen bg-slate-50/50 py-8">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Keranjang Belanja</h1>
                        <p className="text-xs text-slate-500 mt-1">Periksa kembali berkas dan spesifikasi pesanan Anda sebelum checkout</p>
                    </div>
                    <Link href="/products" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Tambah Produk Lain
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items List (2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => {
                            const isM2 = item.product.priceType === 'M2';
                            return (
                                <div 
                                    key={item.id} 
                                    className="flex gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-200 transition-colors"
                                >
                                    <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="font-bold text-sm text-slate-900">{item.product.name}</h3>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                    title="Hapus dari keranjang"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Specific print options */}
                                            <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                                                {item.options?.size && (
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                                                        Ukuran: {item.options.size}
                                                    </span>
                                                )}
                                                {item.options?.material && (
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                                                        Bahan: {item.options.material}
                                                    </span>
                                                )}
                                                {item.options?.width && item.options?.height && (
                                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                                                        {item.options.width}m × {item.options.height}m ({item.options.area?.toFixed(2)} m²)
                                                    </span>
                                                )}
                                            </div>

                                            {item.options?.fileName && (
                                                <p className="text-[11px] text-emerald-600 font-medium mt-1 truncate max-w-[250px]">
                                                    ✓ Berkas: {item.options.fileName}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                            {/* Quantity counter */}
                                            <div className="flex items-center border border-slate-300 rounded-lg p-0.5 bg-slate-50">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-md text-xs font-bold text-slate-600"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-md text-xs font-bold text-slate-600"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <p className="font-extrabold text-sm sm:text-base text-blue-600">
                                                {formatCurrency(item.product.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary (1 col) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs sticky top-24 space-y-5">
                            <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
                                Ringkasan Tagihan
                            </h3>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal Cetak</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Pajak PPN (11%)</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Ongkos Kirim</span>
                                    <span className="text-slate-400">Dihitung di checkout</span>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                                    <span className="font-bold text-sm text-slate-900">Total Estimasi</span>
                                    <span className="font-black text-xl text-blue-600">{formatCurrency(finalTotal)}</span>
                                </div>
                            </div>

                            <Link href="/checkout" className="block pt-2">
                                <Button className="w-full h-11 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-2">
                                    <span>Lanjut ke Checkout</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>

                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Transaksi Aman & Bergaransi</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
