
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

// GET /api/admin/products - List all products
export async function GET() {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { orderItems: true }
                }
            }
        });

        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error('Admin Products GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST /api/admin/products - Create new product
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();

        // Extract fields
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string);
        const stock = parseInt(formData.get('stock') as string);
        const category = formData.get('category') as string;
        const sizes = formData.get('sizes') as string; // Comma separated
        const finishing = formData.get('finishing') as string; // Comma separated
        const isRecommended = formData.get('isRecommended') === 'true';
        const imageFile = formData.get('image') as File | null;

        // Validation
        if (!name || !description || isNaN(price) || isNaN(stock) || !category) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: name, description, price, stock, category'
            }, { status: 400 });
        }

        if (price < 0) {
            return NextResponse.json({ success: false, error: 'Price cannot be negative' }, { status: 400 });
        }

        if (stock < 0) {
            return NextResponse.json({ success: false, error: 'Stock cannot be negative' }, { status: 400 });
        }

        // Handle image upload
        let imageUrl = '/placeholder.jpg';
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
            imageUrl = `/uploads/products/${filename}`;
        }

        // Create product
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                category,
                sizes: sizes || null,
                finishing: finishing || null,
                isRecommended,
                image: imageUrl,
            }
        });

        return NextResponse.json({
            success: true,
            data: product,
            message: 'Product created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Admin Products POST Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
    }
}
