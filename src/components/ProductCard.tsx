import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const isM2 = product.priceType === 'M2';

    return (
        <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
            <div>
                {/* Product Image */}
                <Link href={`/products/${product.id}`} className="block relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Category / Type Badge */}
                    <div className="absolute left-3 top-3 flex items-center gap-1.5">
                        <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-slate-800 shadow-xs backdrop-blur-xs">
                            {product.category}
                        </span>
                        {isM2 && (
                            <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                Per Meter (m²)
                            </span>
                        )}
                    </div>
                </Link>

                {/* Details */}
                <div className="p-4 space-y-2">
                    <Link href={`/products/${product.id}`} className="block">
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <div className="flex items-center text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="ml-1 font-bold text-slate-700">{product.rating || '4.9'}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span>Estimasi {product.estDays || 1} hari</span>
                    </div>

                    <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed">
                        {product.description}
                    </p>
                </div>
            </div>

            {/* Footer with Price and Button */}
            <div className="flex items-center justify-between p-4 pt-0 border-t border-slate-100 mt-2">
                <div className="flex flex-col pt-3">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        {isM2 ? 'Harga per m²' : 'Mulai dari'}
                    </span>
                    <span className="text-base font-extrabold text-blue-600">
                        {formatCurrency(product.price)}{isM2 ? '/m²' : ''}
                    </span>
                </div>
                <Link href={`/products/${product.id}`} className="pt-3">
                    <button className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition-all group/btn">
                        <span>Pesan</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
