import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { Sparkles, Printer, ShieldCheck, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
    });

    const categories = ['Semua', ...Array.from(new Set(products.map(p => p.category)))];

    return (
        <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6">
                {/* Header Banner */}
                <div className="mb-10 text-center max-w-2xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Katalog Resmi Percetakan</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Pilih Produk Cetak Kebutuhan Anda
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600">
                        Cetak dokumen, materi promosi, banner spanduk, hingga merchandise dengan bahan berkualitas tinggi dan harga transparan.
                    </p>
                </div>

                {/* Features highlights */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
                    {[
                        { title: 'Bahan Berkualitas', desc: 'Standar cetak profesional', icon: ShieldCheck },
                        { title: 'Hitung Luas Otomatis', desc: 'Dukung spanduk per meter (m²)', icon: Printer },
                        { title: 'Pengerjaan Cepat', desc: 'Estimasi 1-3 hari kerja', icon: Clock },
                        { title: 'Garansi Hasil', desc: 'Hasil tajam & presisi', icon: Sparkles },
                    ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <feat.icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900">{feat.title}</p>
                                <p className="text-[11px] text-slate-500">{feat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={{
                                ...product,
                                priceType: product.priceType as 'UNIT' | 'M2' | 'PACKAGE' | undefined,
                                minArea: product.minArea ?? undefined,
                                rating: product.rating ?? undefined,
                                sizes: product.sizes ? product.sizes.split(',') : undefined,
                                finishing: product.finishing ? product.finishing.split(',') : undefined,
                            }}
                        />
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                        <Printer className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-700">Belum Ada Produk</h3>
                        <p className="text-xs text-slate-500 mt-1">Produk percetakan akan segera diperbarui oleh Admin.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
