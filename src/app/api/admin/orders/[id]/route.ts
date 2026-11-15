
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// GET /api/admin/orders/[id] - Get single order detail
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
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: id },
                    { orderNo: id }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        status: true,
                        createdAt: true
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        verifiedBy: {
                            select: { id: true, name: true }
                        }
                    }
                },
                statusLogs: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        changedBy: {
                            select: { id: true, name: true, role: true }
                        }
                    }
                },
                assignedStaff: {
                    select: { id: true, name: true, phone: true }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Parse options JSON string
        const orderWithParsedOptions = {
            ...order,
            items: order.items.map((item: any) => ({
                ...item,
                options: item.options ? JSON.parse(item.options) : null
            }))
        };

        return NextResponse.json({ success: true, data: orderWithParsedOptions });
    } catch (error) {
        console.error('Admin Order GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 });
    }
}
