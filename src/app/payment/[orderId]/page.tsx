'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { orderService } from '@/services/orders';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function PaymentPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (orderId) {
            orderService.getOrderById(orderId as string).then(res => {
                if (res.success && res.data) setOrder(res.data);
            });
        }
    }, [orderId]);

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        // Simulate upload delay
        setTimeout(() => {
            setIsUploading(false);
            router.push(`/orders/${orderId}`);
        }, 2000);
    };

    if (!order) return <div className="p-12 text-center">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-xl">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">
                {order.paymentMethod === 'COD' ? (
                    <>
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Pesanan Berhasil Dibuat!</h1>
                        <p className="text-slate-600 mb-6">
                            Silakan lakukan pembayaran sebesar <span className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span> saat pesanan sampai atau saat pengambilan.
                        </p>
                        <Button onClick={() => router.push(`/orders/${orderId}`)}>
                            Lihat Detail Pesanan
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Menunggu Pembayaran</h1>
                        <p className="text-slate-600 mb-6">
                            Total yang harus dibayar: <span className="font-bold text-2xl text-blue-600 block mt-2">{formatCurrency(order.totalAmount)}</span>
                        </p>

                        <div className="bg-slate-50 p-6 rounded-lg mb-8">
                            <p className="font-medium mb-4">Scan QRIS untuk membayar</p>
                            {/* Placeholder QRIS */}
                            <div className="aspect-square w-48 mx-auto bg-white p-2 rounded border shadow-sm mb-4 relative">
                                <Image
                                    src="https://placehold.co/300x300/png?text=QRIS+CODE"
                                    alt="QRIS Code"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Menerima semua e-wallet & mobile banking</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Upload Bukti Transfer</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors text-center cursor-pointer relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    accept="image/*"
                                />
                                {file ? (
                                    <div className="text-blue-600 font-medium">
                                        {file.name}
                                    </div>
                                ) : (
                                    <div className="text-slate-400">
                                        <Upload className="h-6 w-6 mx-auto mb-2" />
                                        <span>Klik untuk upload bukti</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            disabled={!file || isUploading}
                            onClick={handleUpload}
                        >
                            {isUploading ? 'Mengupload...' : 'Konfirmasi Pembayaran'}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
