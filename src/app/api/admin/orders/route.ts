
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/orders - List all orders with optional status filter
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // Filter by status

        const whereClause: any = {};
        if (status && status !== 'all') {
            whereClause.status = status.toUpperCase();
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        status: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                price: true
                            }
                        }
                    }
                }
            }
        });

        // Parse options JSON string
        const ordersWithParsedOptions = orders.map((order: any) => ({
            ...order,
            items: order.items.map((item: any) => ({
                ...item,
                options: item.options ? JSON.parse(item.options) : null
            }))
        }));

        return NextResponse.json({ success: true, data: ordersWithParsedOptions });
    } catch (error) {
        console.error('Admin Orders GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
    }
}
