import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMidtransSignature } from '@/lib/midtrans';
import { applyMidtransPaymentUpdate } from '@/lib/midtransSync';

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

        if (!order_id || !status_code || !gross_amount || !signature_key) {
            return NextResponse.json(
                { status: 'error', message: 'Missing required Midtrans notification fields' },
                { status: 400 }
            );
        }

        // 1. Verifikasi Signature Key untuk keamanan
        const isValidSignature = verifyMidtransSignature(
            String(order_id),
            String(status_code),
            String(gross_amount),
            String(signature_key)
        );

        if (!isValidSignature) {
            console.warn('[Midtrans Webhook] Invalid signature key for order:', order_id);
            return NextResponse.json(
                { status: 'error', message: 'Invalid signature key' },
                { status: 403 }
            );
        }

        // Tangani Test Notification dari Midtrans Dashboard ("payment_notif_test_...")
        if (String(order_id).startsWith('payment_notif_test_')) {
            return NextResponse.json({ status: 'OK', message: 'Midtrans test notification received successfully' });
        }

        // 2. Cari order di database berdasarkan orderNo, ID, suffix retry, atau log MIDTRANS_TX
        const rawOrderId = String(order_id);
        const strippedOrderId = rawOrderId.replace(/-(?:Q)?\d{4,5}$/, '');

        let order = await prisma.order.findFirst({
            where: {
                OR: [
                    { orderNo: rawOrderId },
                    { orderNo: strippedOrderId },
                    { id: rawOrderId },
                    { id: strippedOrderId },
                ],
            },
        });

        if (!order) {
            const logMatch = await prisma.orderStatusLog.findFirst({
                where: { note: `MIDTRANS_TX:${rawOrderId}` },
                include: { order: true },
            });
            if (logMatch?.order) {
                order = logMatch.order;
            }
        }

        if (!order) {
            console.warn('[Midtrans Webhook] Order not found in database:', order_id);
            return NextResponse.json(
                { status: 'error', message: 'Order not found' },
                { status: 404 }
            );
        }

        // 3. Terapkan pembaruan status secara atomik & idempoten
        await applyMidtransPaymentUpdate({
            orderId: order.id,
            transactionStatus: String(transaction_status || ''),
            fraudStatus: fraud_status ? String(fraud_status) : undefined,
            paymentType: payment_type ? String(payment_type) : undefined,
            grossAmount: String(gross_amount),
            transactionId: transaction_id ? String(transaction_id) : undefined,
            source: 'WEBHOOK',
        });

        return NextResponse.json({ status: 'OK', message: 'Notification processed' });
    } catch (error: any) {
        console.error('[Midtrans Webhook Error]:', error);
        return NextResponse.json(
            { status: 'error', message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
