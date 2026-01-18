'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function PaymentPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetch(`/api/orders/${orderId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setOrder(data.data);
                    } else {
                        toast.error(data.error || 'Gagal memuat detail pesanan');
                    }
                })
                .catch(() => toast.error('Terjadi kesalahan koneksi'))
                .finally(() => setIsLoading(false));
        }
    }, [orderId]);

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        try {
            // 1. Upload file to /api/upload
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (!uploadData.success) {
                throw new Error(uploadData.error || 'Gagal mengupload file');
            }

            // 2. Update order with payment proof URL
            const paymentRes = await fetch(`/api/orders/${orderId}/payment`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentProof: uploadData.fileUrl })
            });
            const paymentData = await paymentRes.json();

            if (paymentData.success) {
                toast.success('Bukti pembayaran berhasil dikonfirmasi!');
                router.push(`/orders/${orderId}`);
            } else {
                throw new Error(paymentData.error || 'Gagal memproses pembayaran');
            }
        } catch (err: any) {
            toast.error(err.message || 'Terjadi kesalahan');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
    );

    if (!order) return (
        <div className="container mx-auto px-4 py-20 text-center">
            <AlertCircle className="h-16 w-16 text-red-100 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700">Pesanan Tidak Ditemukan</h2>
            <Button onClick={() => router.push('/')} className="mt-4">Kembali ke Beranda</Button>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-12 max-w-xl">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                {order.paymentMethod === 'COD' ? (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Pesanan Behasil!</h1>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Pesanan Anda telah kami terima. Silakan lakukan pembayaran sebesar <span className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span> saat pesanan sampai atau diambil.
                        </p>
                        <Button className="w-full h-12 rounded-xl" onClick={() => router.push(`/orders/${orderId}`)}>
                            Lihat Detail Pesanan
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="h-10 w-10 text-amber-600" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Selesaikan Pembayaran</h1>
                        <p className="text-slate-600 mb-8">
                            Segera lakukan pembayaran agar pesanan Anda dapat kami proses.
                        </p>

                        <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
                            <p className="text-sm text-slate-500 mb-1">Total Bayar</p>
                            <p className="text-3xl font-extrabold text-blue-600 mb-6">{formatCurrency(order.totalAmount)}</p>

                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 inline-block">
                                <Image
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PRINTWERE-PAYMENT-MOCK"
                                    alt="QRIS Code"
                                    width={200}
                                    height={200}
                                    className="mx-auto"
                                />
                            </div>
                            <p className="text-xs text-slate-400">Scan QRIS di atas melalui Aplikasi Mobile Banking atau E-Wallet Anda</p>
                        </div>

                        <div className="mb-8 text-left">
                            <label className="block text-sm font-bold text-slate-700 mb-3">Upload Bukti Transfer</label>
                            <div className={cn(
                                "group border-2 border-dashed rounded-2xl p-8 transition-all relative text-center",
                                file ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                            )}>
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    accept="image/*"
                                />
                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                                            <CheckCircle className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-bold text-blue-900">{file.name}</p>
                                        <p className="text-xs text-blue-500 mt-1">Klik untuk mengganti file</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-600">Pilih file gambar bukti transfer</p>
                                        <p className="text-xs text-slate-400 mt-1">JPG, PNG, atau WEBP (Maks 5MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={!file || isUploading}
                            onClick={handleUpload}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Sedang Memproses...
                                </>
                            ) : (
                                'Konfirmasi Pembayaran'
                            )}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
