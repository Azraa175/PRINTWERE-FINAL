
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/products/[id] - Get single product
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id }
        });

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        // Transform sizes to array for frontend compatibility
        const transformedProduct = {
            ...product,
            sizes: product.sizes ? product.sizes.split(',') : undefined,
            finishing: product.finishing ? product.finishing.split(',') : undefined
        };

        return NextResponse.json({ success: true, data: transformedProduct });
    } catch (error) {
        console.error('API Product GET Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}
