import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createQrisCharge } from '@/lib/midtrans';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json(
                { success: false, error: 'Order ID wajib disertakan' },
                { status: 400 }
            );
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Pesanan tidak ditemukan' },
                { status: 404 }
            );
        }

        const qris = await createQrisCharge({
            orderId: order.orderNo || order.id,
            grossAmount: order.totalAmount,
            customerDetails: {
                firstName: order.user?.name || 'Pelanggan',
                email: order.user?.email || 'customer@printwere.com',
                phone: order.user?.phone || '',
            },
        });

        return NextResponse.json({
            success: true,
            ...qris,
        });
    } catch (error: any) {
        console.error('[API Payment QRIS Error]:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Gagal membuat QRIS Midtrans' },
            { status: 500 }
        );
    }
}
