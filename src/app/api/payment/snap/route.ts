import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSnapTransaction } from '@/lib/midtrans';

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
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Pesanan tidak ditemukan' },
                { status: 404 }
            );
        }

        // Tentukan customer details
        const firstName = order.user?.name || 'Pelanggan';
        const email = order.user?.email || 'customer@printwere.com';
        const phone = order.user?.phone || '';

        // Generate Snap Transaction
        const snap = await createSnapTransaction({
            orderId: order.orderNo || order.id,
            grossAmount: order.totalAmount,
            customerDetails: {
                firstName,
                email,
                phone,
            },
            itemDetails: order.items.map(item => ({
                id: item.id,
                name: item.product?.name || 'Produk Cetak',
                price: item.price,
                quantity: item.quantity,
            })),
        });

        // Catat midtransOrderId agar polling/sync status selalu menemukan transaksi ini
        await prisma.orderStatusLog.create({
            data: {
                orderId: order.id,
                fromStatus: order.status,
                toStatus: order.status,
                note: `MIDTRANS_TX:${snap.orderId}`,
            },
        });

        return NextResponse.json({
            success: true,
            token: snap.token,
            redirectUrl: snap.redirect_url,
        });
    } catch (error: any) {
        console.error('[API Payment Snap Error]:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Gagal membuat sesi pembayaran Midtrans Snap' },
            { status: 500 }
        );
    }
}
