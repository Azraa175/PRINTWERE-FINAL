import { MapPin, Printer, Clock, ShieldCheck, Upload, CreditCard, Truck, Search, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function About() {
    return (
        <div className="bg-white space-y-16 py-8">
            {/* Hero Section */}
            <section className="container mx-auto px-4">
                <div className="bg-slate-900 rounded-3xl p-8 sm:p-14 text-white text-center space-y-4 shadow-md">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        <Printer className="h-3.5 w-3.5" /> Percetakan Digital Modern
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                        Tentang PrintWere
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                        Mitra percetakan terpercaya Anda untuk segala kebutuhan bisnis, komersial, promosi, dan personal. Cepat, berpresisi tinggi, dan profesional.
                    </p>
                </div>
            </section>

            {/* Company Profile Section */}
            <section className="container mx-auto px-4">
                <div className="grid gap-12 lg:grid-cols-2 items-center">
                    <div className="space-y-6">
                        <div className="inline-block rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-bold text-blue-700">
                            Profil Usaha
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                            PrintWere by Fotocopy Ilham
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                            Berlokasi di <strong>Jl. Harapan Jaya, Kec. Sukarame, Kota Bandar Lampung</strong>, kami hadir untuk melayani kebutuhan cetak dokumen, merchandise, banner m², hingga kemasan dengan standar mutu terbaik.
                        </p>
                        <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                            Kami menggabungkan mesin cetak digital beresolusi tinggi dengan sistem pemesanan online real-time. Pesanan Anda dipantau langsung dari antrean cetak hingga siap diambil atau dikirim ke lokasi.
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2 pt-2">
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600 shrink-0">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Kualitas Terjamin</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Warna tajam, bahan bermutu dan finishing presisi.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600 shrink-0">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Pengerjaan Tepat Waktu</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Antrean produksi terpantau langsung via sistem.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-[340px] sm:h-[400px] overflow-hidden rounded-3xl bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center p-8 text-center">
                        <div className="space-y-3">
                            <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
                                <MapPin className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Workshop & Toko Fisik</h3>
                            <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                Fotocopy Ilham, Jl. Harapan Jaya, Kec. Sukarame, Kota Bandar Lampung, Lampung
                            </p>
                            <div className="pt-2 flex justify-center gap-2">
                                <a 
                                    href="https://maps.google.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                                >
                                    <MapPin className="h-3.5 w-3.5" />
                                    Buka di Google Maps
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Order Section */}
            <section className="bg-slate-50/70 py-16 border-y border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center space-y-2">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            Langkah Mudah
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Cara Pemesanan di PrintWere
                        </h2>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Hanya 4 langkah praktis untuk mencetak kebutuhan Anda secara online tanpa repot antre.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-4">
                        {/* Step 1 */}
                        <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200 text-center space-y-3">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
                                <Search className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">1. Pilih Produk</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Tentukan produk cetak, spesifikasi bahan, ukuran custom (m²), dan varian finishing.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200 text-center space-y-3">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
                                <Upload className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">2. Unggah Desain</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Upload file PDF, JPG, PNG, atau WebP siap cetak dan tambahkan catatan cetak khusus.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200 text-center space-y-3">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">3. Bayar & Verifikasi</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Bayar via QRIS otomatis atau transfer bank, lalu unggah bukti bayar untuk diverifikasi.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200 text-center space-y-3">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <Truck className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">4. Cetak & Kirim</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Pantau pesanan di antrean cetak hingga selesai dan siap Anda ambil atau dikirimkan.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-10">
                        <Link href="/products">
                            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm font-semibold shadow-xs">
                                Mulai Pesan Sekarang
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
