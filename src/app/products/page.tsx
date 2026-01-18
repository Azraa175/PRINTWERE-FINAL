import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';

export default async function Products() {
    const products = await prisma.product.findMany({});

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Produk Kami</h1>
                <p className="mt-2 text-gray-600">
                    Temukan berbagai solusi percetakan berkualitas untuk kebutuhan Anda
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products?.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={{
                            ...product,
                            sizes: product.sizes ? product.sizes.split(',') : undefined
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
