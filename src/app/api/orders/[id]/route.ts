
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { syncOrderWithMidtrans } from '@/lib/midtransSync';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        let order = await prisma.order.findFirst({
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

        // Sinkronisasi aktif dengan Midtrans jika status masih menunggu pembayaran
        if (['MENUNGGU_PEMBAYARAN', 'PENDING', 'PEMBAYARAN_DITOLAK'].includes(order.status)) {
            const synced = await syncOrderWithMidtrans(order.id);
            if (synced) {
                const refreshed = await prisma.order.findUnique({
                    where: { id: order.id },
                    include: {
                        items: { include: { product: true } },
                        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
                        statusLogs: {
                            orderBy: { createdAt: 'desc' },
                            include: { changedBy: { select: { id: true, name: true, role: true } } }
                        }
                    }
                });
                if (refreshed) order = refreshed;
            }
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
