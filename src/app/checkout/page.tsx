'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { orderService } from '@/services/orders';
import { formatCurrency } from '@/lib/utils';

const checkoutSchema = z.object({
    name: z.string().min(3, 'Nama harus diisi'),
    phone: z.string().min(10, 'Nomor telepon tidak valid'),
    address: z.string().min(10, 'Alamat terlalu pendek'),
    paymentMethod: z.enum(['COD', 'QRIS']),
    shippingMethod: z.string().min(1, 'Pilih metode pengiriman')
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const SHIPPING_COSTS: Record<string, number> = {
    'JNE': 12000,
    'GOSEND': 25000,
    'PICKUP': 0
};

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, clearCart } = useCartStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutForm>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            paymentMethod: 'QRIS',
            shippingMethod: 'JNE'
        }
    });

    const selectedShipping = watch('shippingMethod');
    const shippingCost = SHIPPING_COSTS[selectedShipping] || 0;
    const subtotal = totalPrice();
    const tax = subtotal * 0.11;
    const finalTotal = subtotal + tax + shippingCost;

    const onSubmit = async (data: CheckoutForm) => {
        setIsSubmitting(true);
        try {
            const response = await orderService.createOrder({
                totalAmount: finalTotal,
                items: items.map(item => ({
                    ...item,
                    price: item.product.price,
                    options: item.options
                })),
                paymentMethod: data.paymentMethod,
                shippingAddress: data.address,
                shippingMethod: data.shippingMethod,
                shippingCost: SHIPPING_COSTS[data.shippingMethod] || 0
            });

            if (response.success && response.data) {
                clearCart();
                toast.success('Pesanan berhasil dibuat!');
                if (data.paymentMethod === 'QRIS') {
                    router.push(`/payment/${response.data.id}`);
                } else {
                    router.push(`/orders/${response.data.id}`);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (items.length === 0) {
            router.push('/cart');
        }
    }, [items, router]);

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-slate-200">
                        <h3 className="font-semibold text-lg mb-4">Informasi Pengiriman</h3>

                        <div className="space-y-4">
                            <Input
                                label="Nama Lengkap"
                                error={errors.name?.message}
                                {...register('name')}
                            />

                            <Input
                                label="Nomor Telepon / WhatsApp"
                                placeholder="081234567890"
                                error={errors.phone?.message}
                                {...register('phone')}
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">Alamat Lengkap</label>
                                <textarea
                                    className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 min-h-[100px] ${errors.address ? 'border-red-500 focus:ring-red-500' : ''
                                        }`}
                                    {...register('address')}
                                />
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-slate-200">
                        <h3 className="font-semibold text-lg mb-4">Metode Pengiriman (Tester)</h3>
                        <div className="space-y-3">
                            {[
                                { id: 'JNE', name: 'JNE Reguler', cost: 12000, etd: '2-3 Hari' },
                                { id: 'GOSEND', name: 'GoSend Instant', cost: 25000, etd: 'Instant' },
                                { id: 'PICKUP', name: 'Ambil Sendiri', cost: 0, etd: 'Di Toko' },
                            ].map((method) => (
                                <label key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                                    <input
                                        type="radio"
                                        value={method.id}
                                        {...register('shippingMethod')}
                                        onChange={() => setValue('shippingMethod', method.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1 flex justify-between items-center">
                                        <div>
                                            <span className="block font-medium">{method.name}</span>
                                            <span className="text-sm text-slate-500">{method.etd}</span>
                                        </div>
                                        <span className="font-semibold text-slate-700">
                                            {method.cost === 0 ? 'Gratis' : formatCurrency(method.cost)}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {errors.shippingMethod && <p className="mt-2 text-sm text-red-500">{errors.shippingMethod.message}</p>}
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-slate-200">
                        <h3 className="font-semibold text-lg mb-4">Metode Pembayaran</h3>

                        <div className="space-y-3">
                            <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                                <input
                                    type="radio"
                                    value="QRIS"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    {...register('paymentMethod')}
                                />
                                <div className="flex-1">
                                    <span className="block font-medium">QRIS (Scan & Upload)</span>
                                    <span className="text-sm text-slate-500">Bayar cepat dengan GoPay, OVO, Dana, dll</span>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                                <input
                                    type="radio"
                                    value="COD"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    {...register('paymentMethod')}
                                />
                                <div className="flex-1">
                                    <span className="block font-medium">Cash On Delivery (COD)</span>
                                    <span className="text-sm text-slate-500">Bayar saat barang sampai/diambil</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses Pesanan...
                            </>
                        ) : (
                            'Buat Pesanan'
                        )}
                    </Button>
                </form>

                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-lg sticky top-24">
                        <h3 className="font-semibold text-lg mb-4">Ringkasan Pesanan</h3>
                        <div className="space-y-3 mb-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">
                                        {item.quantity}x {item.product.name}
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(item.product.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Pajak (11%)</span>
                                <span>{formatCurrency(tax)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Ongkos Kirim</span>
                                <span>{formatCurrency(shippingCost)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-slate-900 pt-2 border-t mt-2">
                                <span>Total Bayar</span>
                                <span>{formatCurrency(finalTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
