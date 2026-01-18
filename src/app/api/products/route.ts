
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Parse sizes string back to array for API response if needed, 
        // though strictly speaking Front-end might expect it. 
        // Let's just return as is and let FE handle parsing or parse here.
        // For consistency with other endpoints, let's keep it raw or cleaned.
        // But since we changed schema to String, let's return it as is.

        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error('API Products Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
    }
}
