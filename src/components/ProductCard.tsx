import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from './ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Button } from './ui/Button';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Card className="overflow-hidden bg-white transition-all hover:shadow-lg">
            <Link href={`/products/${product.id}`}>
                <div className="relative aspect-[4/3] w-full bg-gray-100">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            </Link>
            <CardContent className="p-4">
                <Link href={`/products/${product.id}`}>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 hover:text-blue-600">
                        {product.name}
                    </h3>
                </Link>
                <div className="mb-2 flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-600">
                        {product.rating || 'New'}
                    </span>
                    <span className="text-xs text-gray-400">• {product.category}</span>
                </div>
                <p className="line-clamp-2 text-sm text-gray-600">
                    {product.description}
                </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 pt-0">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Mulai dari</span>
                    <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(product.price)}
                    </span>
                </div>
                <Link href={`/products/${product.id}`}>
                    <Button size="sm" className="gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Pesan
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
