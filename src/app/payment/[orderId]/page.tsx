'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { 
    Upload, 
    CheckCircle2, 
    Clock, 
    Loader2, 
    AlertCircle, 
    Copy, 
    Check, 
    ArrowLeft, 
    CreditCard, 
    QrCode, 
    Building2, 
    FileImage, 
    Trash2,
    ShieldCheck,
    Hash,
    Sparkles,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Order } from '@/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';

const BANK_ACCOUNTS = [
    {
        bank: 'BCA',
        number: '8735098212',
        name: 'PT PRINTWERE DIGITAL INDONESIA',
        color: 'from-blue-600 to-blue-700'
    },
    {
        bank: 'MANDIRI',
        number: '1320098765431',
        name: 'PT PRINTWERE DIGITAL INDONESIA',
        color: 'from-indigo-600 to-blue-800'
    }
];

export default function PaymentPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMidtransLoading, setIsMidtransLoading] = useState(false);
    const [qrisData, setQrisData] = useState<{ qrCodeUrl: string; qrString: string; expiryTime?: string } | null>(null);
    const [isQrisLoading, setIsQrisLoading] = useState(false);
    const [qrisError, setQrisError] = useState<string | null>(null);
    const [copiedQrisUrl, setCopiedQrisUrl] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [paymentTab, setPaymentTab] = useState<'qris' | 'transfer'>('qris');

    useEffect(() => {
        if (order) {
            if (order.paymentMethod === 'TRANSFER') {
                setPaymentTab('transfer');
            } else if (order.paymentMethod === 'QRIS') {
                setPaymentTab('qris');
            }
        }
    }, [order]);

    // Generate live Midtrans Core API QRIS saat order QRIS belum dibayar
    useEffect(() => {
        if (!order || order.paymentMethod !== 'QRIS') return;
        const isPending = ['MENUNGGU_PEMBAYARAN', 'PENDING', 'PEMBAYARAN_DITOLAK'].includes(order.status);
        if (!isPending || qrisData || isQrisLoading) return;

        setIsQrisLoading(true);
        setQrisError(null);
        fetch('/api/payment/qris', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.qrCodeUrl) {
                    setQrisData({
                        qrCodeUrl: data.qrCodeUrl,
                        qrString: data.qrString || '',
                        expiryTime: data.expiryTime,
                    });
                } else {
                    setQrisError(data.error || 'Gagal memuat QRIS Midtrans');
                }
            })
            .catch(() => setQrisError('Gagal terhubung ke Midtrans QRIS'))
            .finally(() => setIsQrisLoading(false));
    }, [order]);

    // Auto-polling status pesanan setiap 5 detik saat menunggu pembayaran QRIS
    useEffect(() => {
        if (!order || order.paymentMethod !== 'QRIS') return;
        const isPending = ['MENUNGGU_PEMBAYARAN', 'PENDING'].includes(order.status);
        if (!isPending) return;

        const timer = setInterval(async () => {
            try {
                const res = await fetch(`/api/orders/${order.id}`);
                const data = await res.json();
                if (data.success && data.data && !['MENUNGGU_PEMBAYARAN', 'PENDING'].includes(data.data.status)) {
                    setOrder(data.data);
                    toast.success('Pembayaran QRIS berhasil diterima!');
                    clearInterval(timer);
                    router.push(`/orders/${order.id}`);
                }
            } catch {
                // ignore polling error
            }
        }, 5000);

        return () => clearInterval(timer);
    }, [order, router]);

    useEffect(() => {
        if (orderId) {
            fetch(`/api/orders/${orderId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        setOrder(data.data);
                    } else {
                        toast.error(data.error || 'Gagal memuat detail pesanan');
                    }
                })
                .catch(() => toast.error('Terjadi kesalahan koneksi'))
                .finally(() => setIsLoading(false));
        }
    }, [orderId]);

    // Handle file preview
    useEffect(() => {
        if (!file) {
            setFilePreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setFilePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success('Nomor rekening berhasil disalin!');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleMidtransPay = async () => {
        if (!order) return;
        setIsMidtransLoading(true);
        try {
            const res = await fetch('/api/payment/snap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: order.id }),
            });
            const data = await res.json();
            if (data.success && data.token) {
                if (typeof window !== 'undefined' && (window as any).snap) {
                    (window as any).snap.pay(data.token, {
                        onSuccess: () => {
                            toast.success('Pembayaran berhasil dikonfirmasi!');
                            router.push(`/orders/${order.id}`);
                        },
                        onPending: () => {
                            toast.info('Selesaikan pembayaran sesuai instruksi.');
                            router.push(`/orders/${order.id}`);
                        },
                        onError: () => {
                            toast.error('Pembayaran gagal atau dibatalkan.');
                        },
                        onClose: () => {
                            toast.info('Jendela pembayaran ditutup.');
                        },
                    });
                } else if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                }
            } else {
                toast.error(data.error || 'Gagal memulai sesi pembayaran Midtrans');
            }
        } catch (e: any) {
            toast.error('Terjadi kesalahan saat memproses pembayaran');
        } finally {
            setIsMidtransLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Pilih file bukti transfer terlebih dahulu');
            return;
        }

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
                throw new Error(uploadData.error || 'Gagal mengupload berkas bukti');
            }

            // Extract file URL safely from any possible response shape
            const proofUrl = uploadData.data?.url || uploadData.fileUrl || uploadData.url;
            if (!proofUrl) {
                throw new Error('URL berkas bukti tidak valid');
            }

            // 2. Update order with payment proof URL
            const paymentRes = await fetch(`/api/orders/${orderId}/payment`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentProof: proofUrl })
            });
            const paymentData = await paymentRes.json();

            if (paymentData.success) {
                toast.success('Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.');
                router.push(`/orders/${orderId}`);
            } else {
                throw new Error(paymentData.error || 'Gagal memproses pembayaran');
            }
        } catch (err: any) {
            toast.error(err.message || 'Terjadi kesalahan saat memproses pembayaran');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
                <p className="text-sm font-medium text-slate-600">Memuat rincian pembayaran...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-md">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertCircle className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Pesanan Tidak Ditemukan</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Nomor pesanan yang Anda tuju tidak valid atau telah dihapus.
                </p>
                <Link href="/">
                    <Button className="rounded-xl">Kembali ke Beranda</Button>
                </Link>
            </div>
        );
    }

    // Check payment method
    const isQRIS = order.paymentMethod === 'QRIS';
    const isUploadAllowed = order.paymentMethod === 'TRANSFER' || order.paymentMethod === 'COD' || !order.paymentMethod;
    const isAlreadyVerified = !['MENUNGGU_PEMBAYARAN', 'PENDING', 'PEMBAYARAN_DITOLAK'].includes(order.status);

    return (
        <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-6">
                <Link 
                    href="/my-orders" 
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Pesanan Saya</span>
                </Link>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    <Hash className="h-3.5 w-3.5 text-slate-400" />
                    {order.orderNo || order.id}
                </div>
            </div>

            {/* Already Paid Banner */}
            {isAlreadyVerified && (
                <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-emerald-900">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-base">Pembayaran Telah Diterima / Dalam Verifikasi</h3>
                            <p className="text-xs text-emerald-700 mt-1">
                                Status pesanan saat ini: <span className="font-bold uppercase">{order.status}</span>. Anda tidak perlu mengunggah ulang bukti pembayaran kecuali diminta oleh Admin.
                            </p>
                            <Link href={`/orders/${order.id}`} className="inline-block mt-3">
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs">
                                    Lihat Detail & Lacak Pesanan →
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {isQRIS ? (
                /* QRIS Mode: No upload proof required */
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 text-center">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tagihan QRIS</p>
                        <h1 className="text-3xl font-extrabold text-blue-600 mt-1">
                            {formatCurrency(order.totalAmount)}
                        </h1>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 mt-3">
                            <Clock className="h-3.5 w-3.5" />
                            Menunggu Pembayaran QRIS
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 text-center space-y-4">
                        {/* Live Midtrans Core API QRIS */}
                        {isQrisLoading ? (
                            <div className="py-10 flex flex-col items-center justify-center text-slate-500 gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <p className="text-xs font-medium">Membuat QRIS Midtrans...</p>
                            </div>
                        ) : qrisData?.qrCodeUrl ? (
                            <div className="space-y-3">
                                <div className="bg-white p-3 rounded-2xl shadow-xs border-2 border-slate-100 inline-block">
                                    <img
                                        src={qrisData.qrCodeUrl}
                                        alt="QRIS Code Midtrans PrintWere"
                                        className="w-52 h-52 mx-auto rounded-lg object-contain"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-800">Scan QRIS menggunakan m-Banking atau e-Wallet</p>
                                    <p className="text-[11px] text-slate-400">BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs rounded-lg gap-1.5 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50"
                                        onClick={() => {
                                            navigator.clipboard.writeText(qrisData.qrCodeUrl);
                                            setCopiedQrisUrl(true);
                                            toast.success('URL QRIS disalin! Tempel di Midtrans Simulator.');
                                            setTimeout(() => setCopiedQrisUrl(false), 2500);
                                        }}
                                    >
                                        {copiedQrisUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                        {copiedQrisUrl ? 'URL QRIS Tersalin' : 'Salin URL QRIS (Simulator)'}
                                    </Button>
                                </div>
                            </div>
                        ) : qrisError ? (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                                {qrisError} — gunakan tombol Midtrans Snap di bawah.
                            </div>
                        ) : null}

                        <div className="flex items-center gap-3 my-2">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-[11px] text-slate-400 font-semibold uppercase">atau bayar via metode lain</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        <Button
                            onClick={handleMidtransPay}
                            disabled={isMidtransLoading}
                            className="w-full h-11 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-2"
                        >
                            {isMidtransLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Membuka Midtrans...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 text-amber-300" />
                                    Pilih Metode Lain (VA / Kartu / E-Wallet)
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </>
                            )}
                        </Button>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                            Status pesanan otomatis terverifikasi setelah pembayaran berhasil.
                        </div>
                        <Link href={`/orders/${order.id}`} className="block pt-1">
                            <Button variant="outline" className="w-full h-10 rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50">
                                Periksa Status Pesanan →
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                /* TRANSFER / COD Mode: Bank info + Upload Form */
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="md:col-span-3 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tagihan</p>
                                    <h1 className="text-3xl font-extrabold text-blue-600 mt-0.5">
                                        {formatCurrency(order.totalAmount)}
                                    </h1>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock className="h-3.5 w-3.5" />
                                    Menunggu Bayar
                                </span>
                            </div>

                            <div className="pt-4 space-y-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Item Pesanan</p>
                                {order.items?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center text-xs">
                                        <span className="text-slate-700 truncate max-w-[220px]">
                                            {item.quantity}x {item.product?.name || 'Produk Cetak'}
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
                            <h3 className="font-bold text-sm text-slate-900">Rekening Transfer Bank</h3>
                            <p className="text-xs text-slate-500 mb-2">
                                Transfer tepat sesuai nominal ke salah satu rekening resmi PrintWere:
                            </p>
                            {BANK_ACCOUNTS.map((acc, idx) => (
                                <div 
                                    key={acc.bank} 
                                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-sm text-slate-900">{acc.bank}</span>
                                            <span className="text-[10px] text-slate-400">Transfer Otomatis</span>
                                        </div>
                                        <p className="font-mono text-base font-bold text-blue-600 tracking-wider">
                                            {acc.number}
                                        </p>
                                        <p className="text-[10px] text-slate-500 uppercase">{acc.name}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1.5 text-xs rounded-lg"
                                        onClick={() => handleCopy(acc.number, idx)}
                                    >
                                        {copiedIndex === idx ? (
                                            <>
                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                <span className="text-emerald-600">Tersalin</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5 text-slate-500" />
                                                <span>Salin</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-bold text-base text-slate-900">Upload Bukti Transfer</h3>
                                <p className="text-xs text-slate-500">
                                    Unggah foto atau tangkapan layar struk transfer bank
                                </p>
                            </div>

                            <div className={cn(
                                "relative rounded-2xl border-2 border-dashed transition-all overflow-hidden text-center",
                                file 
                                    ? "border-blue-300 bg-blue-50/30 p-4" 
                                    : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/60 p-6 cursor-pointer"
                            )}>
                                {!file ? (
                                    <>
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            accept="image/jpeg,image/png,image/webp,application/pdf"
                                        />
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-2">
                                                <Upload className="h-6 w-6" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-700">Pilih Berkas Bukti</p>
                                            <p className="text-[11px] text-slate-400 mt-1">JPG, PNG, WEBP, atau PDF (Maks. 10MB)</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        {filePreview && file.type.startsWith('image/') ? (
                                            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                                <img
                                                    src={filePreview}
                                                    alt="Pratinjau Bukti Bayar"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-blue-100/50 rounded-xl flex items-center gap-3 text-left">
                                                <FileImage className="h-8 w-8 text-blue-600 shrink-0" />
                                                <div className="truncate">
                                                    <p className="text-xs font-bold text-blue-900 truncate">{file.name}</p>
                                                    <p className="text-[10px] text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs pt-1">
                                            <span className="font-semibold text-slate-700 truncate max-w-[140px] text-[11px]">
                                                {file.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setFile(null)}
                                                className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 font-semibold text-[11px]"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                className="w-full h-11 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                disabled={!file || isUploading}
                                onClick={handleUpload}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mengunggah Bukti...
                                    </>
                                ) : (
                                    'Kirim Bukti Pembayaran'
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Verifikasi aman oleh tim Admin</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Script
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-K7XwXTsA5VzBPpSg'}
                strategy="lazyOnload"
            />
        </div>
    );
}
