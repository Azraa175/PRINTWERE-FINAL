import Link from 'next/link';
import { Printer, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white">
                            <Printer className="h-6 w-6 text-blue-500" />
                            <span className="text-xl font-bold">PrintWere</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Solusi percetakan online cepat, berkualitas, dan terpercaya untuk kebutuhan bisnis & personal Anda.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-white">Menu</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-blue-500">Beranda</Link></li>
                            <li><Link href="/products" className="hover:text-blue-500">Produk</Link></li>
                            <li><Link href="/track-order" className="hover:text-blue-500">Lacak Pesanan</Link></li>
                            <li><Link href="/about" className="hover:text-blue-500">Tentang Kami</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-white">Layanan</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/category/print" className="hover:text-blue-500">Print Dokumen</Link></li>
                            <li><Link href="/category/merch" className="hover:text-blue-500">Merchandise</Link></li>
                            <li><Link href="/category/banner" className="hover:text-blue-500">Banner & Spanduk</Link></li>
                            <li><Link href="/category/sticker" className="hover:text-blue-500">Stiker & Label</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-white">Hubungi Kami</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 shrink-0 text-blue-500" />
                                <span>Jl. Teknologi No. 10, Jakarta Selatan, Indonesia</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 shrink-0 text-blue-500" />
                                <span>+62 812-3456-7890</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 shrink-0 text-blue-500" />
                                <span>support@printwere.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} PrintWere. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
