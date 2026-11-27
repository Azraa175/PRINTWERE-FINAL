import { prisma } from '@/lib/prisma';
import { getMidtransTransactionStatus } from '@/lib/midtrans';
import { notifyOrderStatusChange } from '@/lib/notifications';

const PENDING_STATUSES = ['MENUNGGU_PEMBAYARAN', 'PENDING', 'PEMBAYARAN_DITOLAK'];

/**
 * Sinkronisasi idempoten status pembayaran Midtrans -> Database PrintWere + Notifikasi WA.
 * Dipanggil baik oleh Webhook maupun oleh active polling GET /api/orders/[id].
 */
export async function applyMidtransPaymentUpdate(params: {
    orderId: string;
    transactionStatus: string;
    fraudStatus?: string;
    paymentType?: string;
    grossAmount?: string | number;
    transactionId?: string;
    source?: 'WEBHOOK' | 'POLLING';
}): Promise<boolean> {
    const {
        orderId,
        transactionStatus,
        fraudStatus,
        paymentType,
        grossAmount,
        transactionId,
        source = 'WEBHOOK',
    } = params;

    let newStatus: string | null = null;
    let isPaid = false;

    if (transactionStatus === 'capture') {
        if (!fraudStatus || fraudStatus === 'accept') {
            newStatus = 'ANTRIAN_PRODUKSI';
            isPaid = true;
        }
    } else if (transactionStatus === 'settlement') {
        newStatus = 'ANTRIAN_PRODUKSI';
        isPaid = true;
    } else if (
        transactionStatus === 'deny' ||
        transactionStatus === 'cancel' ||
        transactionStatus === 'expire'
    ) {
        newStatus = 'DIBATALKAN';
    }

    if (!newStatus) return false;

    // Update atomik & idempoten: hanya update jika status saat ini masih pending
    const updated = await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order || !PENDING_STATUSES.includes(order.status)) {
            return null;
        }

        const res = await tx.order.updateMany({
            where: {
                id: order.id,
                status: { in: PENDING_STATUSES },
            },
            data: {
                status: newStatus as any,
                paymentMethod: paymentType ? paymentType.toUpperCase() : order.paymentMethod,
            },
        });

        if (res.count === 0) {
            return null;
        }

        await tx.orderStatusLog.create({
            data: {
                orderId: order.id,
                fromStatus: order.status,
                toStatus: newStatus!,
                note: isPaid
                    ? `Pembayaran via ${paymentType?.toUpperCase() || 'MIDTRANS'} diverifikasi otomatis (${source}${transactionId ? ': ' + transactionId : ''})`
                    : `Pembaruan status Midtrans: ${transactionStatus}`,
            },
        });

        if (isPaid) {
            const parsedAmount = typeof grossAmount === 'number'
                ? grossAmount
                : parseFloat(String(grossAmount || order.totalAmount)) || order.totalAmount;

            await tx.payment.create({
                data: {
                    orderId: order.id,
                    amount: parsedAmount,
                    method: paymentType ? paymentType.toUpperCase() : 'MIDTRANS',
                    proofUrl: `MIDTRANS:${transactionId || order.orderNo || order.id}`,
                    status: 'DISETUJUI',
                },
            });
        }

        return { order, newStatus: newStatus! };
    });

    if (!updated) return false;

    if (isPaid) {
        const parsedAmount = typeof grossAmount === 'number'
            ? grossAmount
            : parseFloat(String(grossAmount || updated.order.totalAmount)) || updated.order.totalAmount;

        notifyOrderStatusChange({
            orderId: updated.order.id,
            newStatus: 'ANTRIAN_PRODUKSI',
            note: `Pembayaran via ${paymentType?.toUpperCase() || 'MIDTRANS'} sebesar Rp ${Math.round(parsedAmount).toLocaleString('id-ID')} telah berhasil diverifikasi otomatis oleh Midtrans. Pesanan Anda segera diproses cetak!`,
        }).catch(err => {
            console.error('[Midtrans Sync Notification Error]:', err);
        });
    }

    return true;
}

/**
 * Cek status transaksi ke Midtrans API untuk order yang masih menunggu pembayaran.
 */
export async function syncOrderWithMidtrans(orderId: string): Promise<boolean> {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            statusLogs: {
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
        },
    });

    if (!order || !PENDING_STATUSES.includes(order.status)) {
        return false;
    }

    // Kumpulkan semua kandidat midtransOrderId yang pernah dicatat di statusLogs + orderNo/id
    const candidates: string[] = [];
    for (const log of order.statusLogs) {
        if (log.note && log.note.startsWith('MIDTRANS_TX:')) {
            const txOrderId = log.note.replace('MIDTRANS_TX:', '').trim();
            if (txOrderId && !candidates.includes(txOrderId)) {
                candidates.push(txOrderId);
            }
        }
    }
    if (order.orderNo && !candidates.includes(order.orderNo)) {
        candidates.push(order.orderNo);
    }
    if (!candidates.includes(order.id)) {
        candidates.push(order.id);
    }

    for (const midtransOrderId of candidates) {
        const statusData = await getMidtransTransactionStatus(midtransOrderId);
        if (statusData && statusData.transaction_status) {
            const changed = await applyMidtransPaymentUpdate({
                orderId: order.id,
                transactionStatus: statusData.transaction_status,
                fraudStatus: statusData.fraud_status,
                paymentType: statusData.payment_type,
                grossAmount: statusData.gross_amount,
                transactionId: statusData.transaction_id,
                source: 'POLLING',
            });
            if (changed) {
                return true;
            }
        }
    }

    return false;
}
