'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowLeft, ShieldCheck, MapPin, Truck, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, cn } from '@/lib/utils';

const checkoutSchema = z.object({
    name: z.string().min(3, 'Nama harus diisi minimal 3 karakter'),
    phone: z.string().min(10, 'Nomor telepon / WhatsApp minimal 10 digit'),
    address: z.string().min(10, 'Alamat pengiriman minimal 10 karakter'),
    paymentMethod: z.enum(['COD', 'QRIS']),
    shippingMethod: z.string().min(1, 'Pilih metode pengiriman')
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const SHIPPING_METHODS = [
    { id: 'JNE', name: 'JNE Reguler', desc: 'Pengiriman reguler 2-3 hari kerja', cost: 12000 },
    { id: 'GOSEND', name: 'GoSend / Grab Instant', desc: 'Pengiriman kurir di hari yang sama', cost: 25000 },
    { id: 'PICKUP', name: 'Ambil Sendiri di Outlet', desc: 'Gratis ambil langsung di toko PrintWere', cost: 0 },
];

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, clearCart } = useCartStore();
    const { user, isAuthenticated } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutForm>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
            paymentMethod: 'QRIS',
            shippingMethod: 'JNE'
        }
    });

    const selectedShipping = watch('shippingMethod');
    const selectedPayment = watch('paymentMethod');
    const shippingMethodObj = SHIPPING_METHODS.find(m => m.id === selectedShipping);
    const shippingCost = shippingMethodObj?.cost || 0;

    const subtotal = totalPrice();
    const tax = subtotal * 0.11;
    const finalTotal = subtotal + tax + shippingCost;

    useEffect(() => {
        if (items.length === 0) {
            router.push('/cart');
        }
    }, [items, router]);

    const onSubmit = async (data: CheckoutForm) => {
        if (!isAuthenticated) {
            toast.error('Silakan login terlebih dahulu untuk checkout');
            router.push('/login');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    totalAmount: finalTotal,
                    items: items.map(item => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                        price: item.product.price,
                        width: item.options?.width || null,
                        height: item.options?.height || null,
                        fileUrl: item.options?.fileUrl || null,
                        notes: item.options?.notes || null,
                        options: item.options
                    })),
                    paymentMethod: data.paymentMethod,
                    shippingAddress: `${data.name} (${data.phone})\n${data.address}`,
                    shippingMethod: data.shippingMethod,
                    shippingCost: shippingCost
                })
            });

            const result = await response.json();

            if (result.success && result.data) {
                clearCart();
                toast.success('Pesanan berhasil dibuat!');
                if (data.paymentMethod === 'QRIS') {
                    router.push(`/payment/${result.data.id}`);
                } else {
                    router.push(`/my-orders`);
                }
            } else {
                toast.error(result.error || 'Gagal membuat pesanan');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Terjadi kesalahan saat memproses pesanan');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) return null;

    return (
        <div className="min-h-screen bg-slate-50/50 py-8">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Checkout Pesanan</h1>
                        <p className="text-xs text-slate-500 mt-1">Lengkapi alamat pengiriman dan pilih metode pembayaran</p>
                    </div>
                    <Link href="/cart" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Keranjang
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Column (2 cols) */}
                    <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
                        {/* Shipping Info Card */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <h3 className="font-bold text-sm text-slate-900">Alamat & Kontak Pengiriman</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Nama Lengkap Penerima"
                                    placeholder="Contoh: Muhammad Fajar"
                                    error={errors.name?.message}
                                    {...register('name')}
                                />

                                <Input
                                    label="Nomor WhatsApp / Telepon"
                                    placeholder="Contoh: 081234567890"
                                    error={errors.phone?.message}
                                    {...register('phone')}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Lengkap Tujuan</label>
                                <textarea
                                    className={cn(
                                        "w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[90px] bg-white",
                                        errors.address && "border-red-500 focus:ring-red-500"
                                    )}
                                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos..."
                                    {...register('address')}
                                />
                                {errors.address && (
                                    <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Shipping Method Card */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Truck className="h-4 w-4" />
                                </div>
                                <h3 className="font-bold text-sm text-slate-900">Opsi Pengiriman</h3>
                            </div>

                            <div className="space-y-3">
                                {SHIPPING_METHODS.map((method) => {
                                    const isSelected = selectedShipping === method.id;
                                    return (
                                        <label
                                            key={method.id}
                                            className={cn(
                                                "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer",
                                                isSelected
                                                    ? "border-blue-600 bg-blue-50/40 text-blue-900"
                                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    value={method.id}
                                                    {...register('shippingMethod')}
                                                    onChange={() => setValue('shippingMethod', method.id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <p className="font-bold text-xs text-slate-900">{method.name}</p>
                                                    <p className="text-[11px] text-slate-500">{method.desc}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-xs text-slate-900">
                                                {method.cost === 0 ? 'Gratis' : formatCurrency(method.cost)}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payment Method Card */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <h3 className="font-bold text-sm text-slate-900">Metode Pembayaran</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label
                                    className={cn(
                                        "flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer",
                                        selectedPayment === 'QRIS'
                                            ? "border-blue-600 bg-blue-50/40 text-blue-900"
                                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        value="QRIS"
                                        {...register('paymentMethod')}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 mt-0.5"
                                    />
                                    <div>
                                        <p className="font-bold text-xs text-slate-900">Transfer & QRIS Digital</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">BCA, Mandiri, GoPay, OVO, ShopeePay</p>
                                    </div>
                                </label>

                                <label
                                    className={cn(
                                        "flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer",
                                        selectedPayment === 'COD'
                                            ? "border-blue-600 bg-blue-50/40 text-blue-900"
                                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        value="COD"
                                        {...register('paymentMethod')}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 mt-0.5"
                                    />
                                    <div>
                                        <p className="font-bold text-xs text-slate-900">Bayar di Tempat (COD)</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Bayar saat ambil pesanan di outlet</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            size="lg" 
                            className="w-full h-12 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Memproses Pesanan...
                                </>
                            ) : (
                                `Konfirmasi & Pesan (${formatCurrency(finalTotal)})`
                            )}
                        </Button>
                    </form>

                    {/* Order Summary Column (1 col) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs sticky top-24 space-y-4">
                            <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
                                Ringkasan Belanja ({items.length} Produk)
                            </h3>

                            <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-100 space-y-2">
                                {items.map((item) => (
                                    <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-start text-xs">
                                        <div className="space-y-0.5 pr-2">
                                            <p className="font-bold text-slate-900 line-clamp-1">{item.product.name}</p>
                                            <p className="text-[11px] text-slate-500">
                                                {item.quantity}x • {item.options?.size || 'Standard'}
                                            </p>
                                        </div>
                                        <span className="font-semibold text-slate-900 whitespace-nowrap">
                                            {formatCurrency(item.product.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-100 pt-3 space-y-2.5 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal Produk</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Pajak PPN (11%)</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Biaya Pengiriman</span>
                                    <span className="font-semibold text-slate-900">
                                        {shippingCost === 0 ? 'Gratis' : formatCurrency(shippingCost)}
                                    </span>
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                                    <span className="font-bold text-sm text-slate-900">Total Akhir</span>
                                    <span className="font-black text-xl text-blue-600">{formatCurrency(finalTotal)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Garansi Cetak Ulang Jika Hasil Cacat</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
