import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileAuthUser } from '@/lib/mobile-auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getMobileAuthUser(request);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu' }, { status: 401 });
        }

        const id = (await params).id;
        const order = await prisma.order.findFirst({
            where: {
                AND: [
                    {
                        OR: [
                            { id: id },
                            { orderNo: id }
                        ]
                    },
                    { userId: user.id }
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
                { success: false, error: 'Pesanan tidak ditemukan' },
                { status: 404 }
            );
        }

        const orderWithParsedOptions = {
            ...order,
            items: order.items.map((item: any) => ({
                ...item,
                options: item.options ? (() => {
                    try { return JSON.parse(item.options as string); } catch { return null; }
                })() : null
            }))
        };

        return NextResponse.json({ success: true, data: orderWithParsedOptions });
    } catch (error) {
        console.error('Mobile Order GET by ID Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memuat detail pesanan' }, { status: 500 });
    }
}
