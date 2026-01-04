import { MapPin, Printer, Clock, ShieldCheck, Upload, CreditCard, Truck, Search } from 'lucide-react';
import Image from 'next/image';

export default function About() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-slate-900 py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-4 text-4xl font-bold md:text-5xl">Tentang Kami</h1>
                    <p className="mx-auto max-w-2xl text-lg text-slate-300">
                        Mitra percetakan terpercaya Anda untuk segala kebutuhan bisnis dan personal. Cepat, berkualitas, dan profesional.
                    </p>
                </div>
            </section>

            {/* Company Profile Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 md:grid-cols-2 items-center">
                        <div className="space-y-6">
                            <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-600">
                                Profil Perusahaan
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">PrintWere by Fotocopy Ilham</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Berlokasi strategis di <strong>Jl. Harapan Jaya, Kec. Sukarame, Kota Bandar Lampung</strong>, kami hadir untuk memenuhi kebutuhan cetak Anda dengan standar kualitas tinggi.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Kami menggabungkan teknologi percetakan modern dengan pelayanan yang ramah dan responsif. Baik untuk kebutuhan mahasiswa, perkantoran, maupun UMKM, kami siap memberikan hasil terbaik.
                            </p>

                            <div className="grid gap-6 sm:grid-cols-2 pt-4">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Kualitas Terjamin</h3>
                                        <p className="text-sm text-gray-600">Hasil cetak tajam dan material terbaik.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Pengerjaan Cepat</h3>
                                        <p className="text-sm text-gray-600">Tepat waktu sesuai deadline Anda.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-[400px] overflow-hidden rounded-2xl bg-slate-100 shadow-xl">
                            {/* Placeholder for shop image */}
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
                                <div className="text-center">
                                    <MapPin className="mx-auto h-12 w-12 opacity-50 mb-2" />
                                    <span className="font-semibold">Lokasi Workshop Kami</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Order Section */}
            <section className="bg-slate-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Tata Cara Pemesanan</h2>
                        <p className="mt-4 text-gray-600">Proses mudah dan praktis untuk mendapatkan hasil cetak yang Anda inginkan</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-4">
                        {/* Step 1 */}
                        <div className="relative rounded-xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md text-center group">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                <Search className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-gray-900">1. Pilih Produk</h3>
                            <p className="text-gray-600 text-sm">
                                Cari dan pilih produk percetakan yang Anda butuhkan di halaman Produk kami.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative rounded-xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md text-center group">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                <Upload className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-gray-900">2. Upload Desain</h3>
                            <p className="text-gray-600 text-sm">
                                Unggah file desain siap cetak Anda atau konsultasikan kebutuhan desain dengan kami.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative rounded-xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md text-center group">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                <CreditCard className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-gray-900">3. Pembayaran</h3>
                            <p className="text-gray-600 text-sm">
                                Lakukan pembayaran dengan metode yang aman dan nyaman (Transfer / E-Wallet).
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="relative rounded-xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md text-center group">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                <Truck className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-gray-900">4. Selesai</h3>
                            <p className="text-gray-600 text-sm">
                                Pesanan diproses dan akan segera dikirim ke alamat Anda atau dapat diambil di lokasi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
