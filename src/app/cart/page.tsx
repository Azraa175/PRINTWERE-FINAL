'use client';

import Link from 'next/link';
import { Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h2 className="text-2xl font-bold mb-4">Keranjang Belanja Kosong</h2>
                <p className="text-slate-500 mb-8">Anda belum menambahkan produk apapun.</p>
                <Link href="/">
                    <Button>Mulai Belanja</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Keranjang Belanja</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-slate-100">
                                <Image
                                    src={item.product.image}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex flex-1 flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-slate-900">{item.product.name}</h3>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {item.options?.size} • {item.options?.material}
                                    </p>
                                    {item.options?.fileName && (
                                        <p className="text-xs text-blue-600 mt-1 truncate max-w-[200px]">
                                            File: {item.options.fileName}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2 border rounded-md p-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="font-bold text-slate-900">
                                        {formatCurrency(item.product.price * item.quantity)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm sticky top-24">
                        <h3 className="font-semibold text-lg mb-6">Ringkasan Pesanan</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(totalPrice())}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Pajak (11%)</span>
                                <span>{formatCurrency(totalPrice() * 0.11)}</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold text-lg text-slate-900">
                                <span>Total</span>
                                <span>{formatCurrency(totalPrice() * 1.11)}</span>
                            </div>
                        </div>

                        <Link href="/checkout">
                            <Button className="w-full" size="lg">
                                Checkout <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
