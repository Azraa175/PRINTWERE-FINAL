
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: id },
                    { orderNo: id }
                ]
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                statusLogs: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        changedBy: {
                            select: { id: true, name: true, role: true }
                        }
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        const orderWithParsedOptions = {
            ...order,
            items: order.items.map((item: any) => ({
                ...item,
                options: item.options ? JSON.parse(item.options as string) : null
            }))
        };

        return NextResponse.json({ success: true, data: orderWithParsedOptions });
    } catch (error) {
        console.error('API GET Order By ID Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}
