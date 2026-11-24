'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Printer, ArrowLeft, Share2, CheckCircle2, Clock, AlertTriangle, 
    FileText, Phone, Mail, MapPin, Loader2, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useOrder } from '@/hooks/useOrders';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function OrderInvoicePage() {
    const { id } = useParams();
    const router = useRouter();
    const { order, isLoading } = useOrder(id as string);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-500">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
                <p className="text-sm font-semibold">Memuat data invoice...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-2">Invoice Tidak Ditemukan</h1>
                <p className="text-sm text-slate-500 mb-6">Pesanan dengan ID tersebut tidak tersedia atau telah dihapus.</p>
                <Link href="/my-orders">
                    <Button className="rounded-xl">Kembali ke Pesanan Saya</Button>
                </Link>
            </div>
        );
    }

    const isPaid = [
        'ANTRIAN_PRODUKSI',
        'SEDANG_DICETAK',
        'FINISHING',
        'SIAP_DIAMBIL',
        'DIKIRIM',
        'SELESAI',
        'CONFIRMED',
        'PROCESSING',
        'READY',
        'COMPLETED'
    ].includes(order.status);

    const isCancelled = order.status === 'CANCELLED' || order.status === 'DIBATALKAN';

    const handlePrint = () => {
        window.print();
    };

    const handleShareWA = () => {
        const text = `Halo, berikut adalah tautan invoice pemesanan PrintWere Anda untuk No. Pesanan ${order.orderNo || order.id}:\n${window.location.href}\nTotal: ${formatCurrency(order.totalAmount)}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = order.shippingCost || 0;
    const invoiceNo = `INV-${order.orderNo || order.id.slice(0, 8).toUpperCase()}`;

    return (
        <div className="min-h-screen bg-slate-100 py-6 sm:py-10 px-3 sm:px-6">
            {/* Top Toolbar (Hidden on Print) */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="bg-white border-slate-300 rounded-xl flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Detail Pesanan
                    </Button>
                </Link>

                <div className="flex items-center gap-2">
                    <Button 
                        onClick={handleShareWA}
                        variant="outline" 
                        size="sm" 
                        className="bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl flex items-center gap-2"
                    >
                        <Share2 className="h-4 w-4 text-emerald-600" />
                        Bagikan ke WA
                    </Button>
                    <Button 
                        onClick={handlePrint}
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm flex items-center gap-2 font-bold"
                    >
                        <Printer className="h-4 w-4" />
                        Cetak / Unduh PDF
                    </Button>
                </div>
            </div>

            {/* A4 Invoice Paper */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-12 relative overflow-hidden print:p-0 print:shadow-none print:border-none print:rounded-none">
                
                {/* Stamp Watermark */}
                <div className="absolute right-6 top-28 sm:right-14 sm:top-24 pointer-events-none select-none z-10 rotate-[-12deg] opacity-85">
                    {isPaid ? (
                        <div className="border-4 border-emerald-600 text-emerald-600 font-extrabold px-6 py-2 rounded-2xl text-2xl sm:text-3xl tracking-widest uppercase shadow-xs flex items-center gap-2">
                            <CheckCircle2 className="h-7 w-7" />
                            LUNAS / PAID
                        </div>
                    ) : isCancelled ? (
                        <div className="border-4 border-red-600 text-red-600 font-extrabold px-6 py-2 rounded-2xl text-2xl sm:text-3xl tracking-widest uppercase shadow-xs flex items-center gap-2">
                            <AlertTriangle className="h-7 w-7" />
                            DIBATALKAN
                        </div>
                    ) : (
                        <div className="border-4 border-amber-500 text-amber-600 font-extrabold px-6 py-2 rounded-2xl text-xl sm:text-2xl tracking-widest uppercase shadow-xs flex items-center gap-2">
                            <Clock className="h-6 w-6" />
                            BELUM LUNAS
                        </div>
                    )}
                </div>

                {/* Header Kop Faktur */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900/10 pb-8 mb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                                P
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">PrintWere</h1>
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Digital Printing & Advertising</p>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 space-y-1 mt-3">
                            <p className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                Jl. Percetakan Digital No. 175, Workshop Hub PrintWere
                            </p>
                            <p className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                +62 812-3456-7890 (Customer Care)
                            </p>
                            <p className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                support@printwere.com • www.printwere.com
                            </p>
                        </div>
                    </div>

                    <div className="sm:text-right">
                        <div className="inline-block bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-extrabold uppercase tracking-wider mb-2">
                            FAKTUR / INVOICE
                        </div>
                        <p className="text-lg font-mono font-black text-slate-900">{invoiceNo}</p>
                        <div className="text-xs text-slate-500 mt-2 space-y-1">
                            <p><span className="text-slate-400">Tanggal Terbit:</span> <span className="font-semibold text-slate-700">{formatDate(order.createdAt)}</span></p>
                            {order.dueDate && (
                                <p><span className="text-slate-400">Estimasi Selesai:</span> <span className="font-semibold text-slate-700">{formatDate(order.dueDate)}</span></p>
                            )}
                            <p><span className="text-slate-400">Metode Bayar:</span> <span className="font-semibold text-slate-700 uppercase">{order.paymentMethod || 'Transfer / QRIS'}</span></p>
                            <p><span className="text-slate-400">Tipe Pengambilan:</span> <span className="font-semibold text-slate-700">{order.deliveryType === 'PICKUP' ? 'Ambil di Toko' : 'Kirim Ekspedisi / Kurir'}</span></p>
                        </div>
                    </div>
                </div>

                {/* Customer Information Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-xl border border-slate-200/60 mb-8 text-xs">
                    <div>
                        <span className="font-bold uppercase tracking-wider text-slate-400 block mb-2">Ditujukan Kepada:</span>
                        <h2 className="text-sm font-extrabold text-slate-900">{order.user?.name || 'Pelanggan'}</h2>
                        <p className="text-slate-600 mt-0.5">{order.user?.email || '-'}</p>
                        <p className="text-slate-600 mt-0.5">{order.user?.phone || 'No. Telp Tidak Terdaftar'}</p>
                    </div>
                    <div>
                        <span className="font-bold uppercase tracking-wider text-slate-400 block mb-2">Alamat Pengiriman / Serah Terima:</span>
                        <p className="text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                            {order.shippingAddress || 'Ambil Langsung di Workshop PrintWere'}
                        </p>
                        {order.shippingMethod && (
                            <p className="text-slate-500 mt-1 font-semibold">
                                Layanan: <span className="text-slate-800">{order.shippingMethod}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto mb-8">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b-2 border-slate-800 text-slate-800 uppercase font-black tracking-wider text-[11px]">
                                <th className="py-3 px-2 w-10">No</th>
                                <th className="py-3 px-3">Deskripsi Produk Percetakan</th>
                                <th className="py-3 px-3 text-center">Dimensi / Spesifikasi</th>
                                <th className="py-3 px-3 text-center">Jumlah</th>
                                <th className="py-3 px-3 text-right">Harga Satuan</th>
                                <th className="py-3 px-3 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {order.items.map((item: any, idx: number) => {
                                const parsedOptions = typeof item.options === 'string' 
                                    ? (() => { try { return JSON.parse(item.options); } catch { return item.options; } })() 
                                    : item.options;

                                return (
                                    <tr key={item.id} className="text-slate-700">
                                        <td className="py-3.5 px-2 font-mono font-bold text-slate-400 align-top">{idx + 1}</td>
                                        <td className="py-3.5 px-3 align-top">
                                            <p className="font-bold text-slate-900 text-sm mb-1">{item.product?.name || 'Produk Custom'}</p>
                                            <p className="text-[11px] text-slate-500">Kategori: {item.product?.category || '-'}</p>
                                            {item.notes && (
                                                <p className="text-[11px] text-amber-700 bg-amber-50 p-1 rounded mt-1 border border-amber-200/50">
                                                    Catatan: {item.notes}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-center align-top text-slate-600">
                                            {item.width && item.height ? (
                                                <span className="font-semibold text-slate-800 block">
                                                    {item.width}m × {item.height}m ({(item.width * item.height).toFixed(2)} m²)
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 block">-</span>
                                            )}
                                            {parsedOptions?.finishing && (
                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 mt-1 inline-block">
                                                    {parsedOptions.finishing}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-center font-bold text-slate-800 align-top">
                                            {item.quantity} {item.product?.priceType === 'PACKAGE' ? 'Paket' : 'Pcs'}
                                        </td>
                                        <td className="py-3.5 px-3 text-right font-medium text-slate-700 align-top">
                                            {formatCurrency(item.price)}
                                        </td>
                                        <td className="py-3.5 px-3 text-right font-extrabold text-slate-900 align-top">
                                            {formatCurrency(item.price * item.quantity)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Calculation Summary & Payment Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t-2 border-slate-200 pt-6 mb-8">
                    <div className="text-xs text-slate-500 space-y-3">
                        <div>
                            <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Status Produksi Terkini:</span>
                            <span className="inline-flex items-center gap-1.5 font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                <Sparkles className="h-3 w-3" />
                                {order.status}
                            </span>
                        </div>
                        {order.note && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <span className="font-bold text-slate-700 block mb-0.5">Catatan Pesanan:</span>
                                <p className="italic text-slate-600">{order.note}</p>
                            </div>
                        )}
                        <div className="border-l-2 border-blue-600 pl-3">
                            <p className="font-bold text-slate-800">Garansi & Kebijakan Hasil Cetak:</p>
                            <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                                Periksa kembali hasil cetakan saat serah terima. Komplain cacat produksi dilayani maksimal 1×24 jam sejak barang diterima.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal Barang ({order.items.length} Item)</span>
                            <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Biaya Pengiriman / Ongkos Kirim</span>
                            <span className="font-bold text-slate-800">
                                {shipping > 0 ? formatCurrency(shipping) : 'Gratis / Ambil Sendiri'}
                            </span>
                        </div>
                        <div className="border-t border-slate-200 my-2 pt-3 flex justify-between items-baseline">
                            <span className="text-sm font-black text-slate-900 uppercase">Total Tagihan</span>
                            <span className="text-xl font-black text-blue-600 font-mono">
                                {formatCurrency(order.totalAmount)}
                            </span>
                        </div>
                        {isPaid && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-emerald-800 flex justify-between items-center text-[11px] font-semibold">
                                <span>Status: Pembayaran Terverifikasi</span>
                                <span className="font-bold">LUNAS Rp 0 (Tuntas)</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Signatures */}
                <div className="grid grid-cols-2 gap-8 text-center text-xs text-slate-500 pt-6 border-t border-slate-100">
                    <div>
                        <p className="mb-14 text-slate-400 font-semibold">Penerima / Pemesan,</p>
                        <p className="font-bold text-slate-800 border-t border-slate-300 pt-1 inline-block min-w-[140px]">
                            {order.user?.name || 'Pelanggan'}
                        </p>
                    </div>
                    <div>
                        <p className="mb-14 text-slate-400 font-semibold">Bagian Kasir & Verifikasi,</p>
                        <p className="font-bold text-slate-800 border-t border-slate-300 pt-1 inline-block min-w-[140px]">
                            Admin PrintWere
                        </p>
                    </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 mt-10 print:mt-6">
                    Faktur ini diterbitkan secara otomatis oleh Sistem Percetakan Digital PrintWere pada {formatDate(new Date())}.
                </div>
            </div>

            {/* Print CSS Styling */}
            <style jsx global>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 12mm;
                    }
                }
            `}</style>
        </div>
    );
}
