
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true
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
