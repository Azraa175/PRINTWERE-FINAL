
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

// GET /api/admin/products/[id] - Get single product
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                orderItems: {
                    include: { order: true }
                }
            }
        });

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error('Admin Product GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch product' }, { status: 500 });
    }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const formData = await request.formData();

        // Check if product exists
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        // Extract fields (only update if provided)
        const updateData: any = {};

        const name = formData.get('name');
        if (name) updateData.name = name as string;

        const description = formData.get('description');
        if (description) updateData.description = description as string;

        const priceStr = formData.get('price');
        if (priceStr) {
            const price = parseFloat(priceStr as string);
            if (isNaN(price) || price < 0) {
                return NextResponse.json({ success: false, error: 'Invalid price' }, { status: 400 });
            }
            updateData.price = price;
        }

        const stockStr = formData.get('stock');
        if (stockStr) {
            const stock = parseInt(stockStr as string);
            if (isNaN(stock) || stock < 0) {
                return NextResponse.json({ success: false, error: 'Invalid stock' }, { status: 400 });
            }
            updateData.stock = stock;
        }

        const category = formData.get('category');
        if (category) updateData.category = category as string;

        const sizes = formData.get('sizes');
        if (sizes !== null) updateData.sizes = sizes as string || null;

        const finishing = formData.get('finishing');
        if (finishing !== null) updateData.finishing = finishing as string || null;

        const isRecommended = formData.get('isRecommended');
        if (isRecommended !== null) updateData.isRecommended = isRecommended === 'true';

        // Handle image upload
        const imageFile = formData.get('image') as File | null;
        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const extension = imageFile.name.split('.').pop();
            const filename = `product-${uniqueSuffix}.${extension}`;

            const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            await writeFile(join(uploadDir, filename), buffer);
            updateData.image = `/uploads/products/${filename}`;
        }

        // Update product
        const product = await prisma.product.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            data: product,
            message: 'Product updated successfully'
        });

    } catch (error) {
        console.error('Admin Product PUT Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check if product exists
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        // Check if product has orders
        const orderCount = await prisma.orderItem.count({ where: { productId: id } });
        if (orderCount > 0) {
            return NextResponse.json({
                success: false,
                error: `Cannot delete product with ${orderCount} existing orders. Consider setting stock to 0 instead.`
            }, { status: 400 });
        }

        await prisma.product.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Admin Product DELETE Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
    }
}
