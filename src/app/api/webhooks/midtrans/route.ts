import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMidtransSignature } from '@/lib/midtrans';
import { notifyOrderStatusChange } from '@/lib/notifications';

export async function POST(req: Request) {
    try {
        const notification = await req.json();

        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            fraud_status,
            payment_type,
            transaction_id,
        } = notification;

        console.log(`[Midtrans Webhook Received] Order: ${order_id}, Status: ${transaction_status}, Type: ${payment_type}`);

        // 1. Verifikasi Signature Key untuk keamanan
        const isValidSignature = verifyMidtransSignature(
            order_id,
            status_code,
            gross_amount,
            signature_key
        );

        if (!isValidSignature) {
            console.warn('[Midtrans Webhook] Invalid signature key for order:', order_id);
            return NextResponse.json(
                { status: 'error', message: 'Invalid signature key' },
                { status: 403 }
            );
        }

        // 2. Cari order di database berdasarkan orderNo atau ID
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { orderNo: order_id },
                    { id: order_id },
                ],
            },
            include: {
                user: true,
            },
        });

        if (!order) {
            console.warn('[Midtrans Webhook] Order not found in database:', order_id);
            return NextResponse.json(
                { status: 'error', message: 'Order not found' },
                { status: 404 }
            );
        }

        // 3. Evaluasi status transaksi dari Midtrans
        let newStatus: string | null = null;
        let isPaid = false;

        if (transaction_status === 'capture') {
            if (fraud_status === 'accept') {
                newStatus = 'ANTRIAN_PRODUKSI';
                isPaid = true;
            }
        } else if (transaction_status === 'settlement') {
            newStatus = 'ANTRIAN_PRODUKSI';
            isPaid = true;
        } else if (transaction_status === 'pending') {
            newStatus = 'MENUNGGU_PEMBAYARAN';
        } else if (
            transaction_status === 'deny' ||
            transaction_status === 'cancel' ||
            transaction_status === 'expire'
        ) {
            newStatus = 'DIBATALKAN';
        }

        // 4. Update order dan database jika status berubah
        if (newStatus && newStatus !== order.status) {
            await prisma.$transaction(async (tx) => {
                // Update Order Status
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        status: newStatus as any,
                        paymentMethod: payment_type ? payment_type.toUpperCase() : order.paymentMethod,
                    },
                });

                // Catat Log Status
                await tx.orderStatusLog.create({
                    data: {
                        orderId: order.id,
                        fromStatus: order.status,
                        toStatus: newStatus,
                        note: isPaid
                            ? `Pembayaran via ${payment_type?.toUpperCase() || 'MIDTRANS'} diverifikasi otomatis oleh Midtrans (${transaction_id || ''})`
                            : `Pembaruan status Midtrans: ${transaction_status}`,
                    },
                });

                // Jika lunas (settlement / capture), catat ke tabel Payment
                if (isPaid) {
                    await tx.payment.create({
                        data: {
                            orderId: order.id,
                            amount: parseFloat(gross_amount) || order.totalAmount,
                            method: payment_type ? payment_type.toUpperCase() : 'MIDTRANS',
                            proofUrl: `MIDTRANS:${transaction_id || order_id}`,
                            status: 'DISETUJUI',
                        },
                    });
                }
            });

            console.log(`[Midtrans Webhook] Order ${order.id} status updated to ${newStatus}`);

            // 5. Kirim notifikasi WhatsApp & Email jika pembayaran telah lunas (ANTRIAN_PRODUKSI)
            if (isPaid) {
                notifyOrderStatusChange({
                    orderId: order.id,
                    newStatus: 'ANTRIAN_PRODUKSI',
                    note: `Pembayaran via ${payment_type?.toUpperCase()} sebesar Rp ${Math.round(parseFloat(gross_amount)).toLocaleString('id-ID')} telah berhasil diverifikasi otomatis oleh Midtrans. Pesanan Anda segera diproses cetak!`,
                }).catch(err => {
                    console.error('[Midtrans Webhook Notification Error]:', err);
                });
            }
        }

        return NextResponse.json({ status: 'OK', message: 'Notification processed' });
    } catch (error: any) {
        console.error('[Midtrans Webhook Error]:', error);
        return NextResponse.json(
            { status: 'error', message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
