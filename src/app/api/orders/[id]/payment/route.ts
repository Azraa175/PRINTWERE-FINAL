
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { notifyOrderStatusChange } from '@/lib/notifications';

// PATCH /api/orders/[id]/payment - Upload payment proof
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { paymentProof } = body;

        if (!paymentProof) {
            return NextResponse.json({ success: false, error: 'Bukti pembayaran harus diupload' }, { status: 400 });
        }

        // Find order and check ownership
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: id },
                    { orderNo: id }
                ]
            },
            include: { user: true }
        });

        if (!order) {
            return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
        }

        if (order.user.email !== session.user.email) {
            return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 });
        }

        // Update order dan buat record Payment serta log riwayat
        const previousStatus = order.status;
        const newStatus = 'MENUNGGU_VERIFIKASI';

        const updatedOrder = await prisma.$transaction(async (tx) => {
            const ord = await tx.order.update({
                where: { id: order.id },
                data: {
                    paymentProof,
                    status: newStatus
                }
            });

            await tx.payment.create({
                data: {
                    orderId: order.id,
                    amount: order.totalAmount,
                    method: order.paymentMethod || 'TRANSFER',
                    proofUrl: paymentProof,
                    status: 'MENUNGGU'
                }
            });

            await tx.orderStatusLog.create({
                data: {
                    orderId: order.id,
                    fromStatus: previousStatus,
                    toStatus: newStatus,
                    changedById: order.userId,
                    note: 'Pelanggan telah mengunggah bukti pembayaran. Menunggu verifikasi admin.'
                }
            });

            return ord;
        });

        // Kirim notifikasi WA & Gmail
        notifyOrderStatusChange({
            orderId: order.id,
            newStatus: 'MENUNGGU_VERIFIKASI',
            note: 'Bukti pembayaran telah diunggah dan sedang dalam antrean verifikasi Admin'
        }).catch(err => console.error('[Payment Proof Notification Error]:', err));

        return NextResponse.json({
            success: true,
            data: updatedOrder,
            message: 'Bukti pembayaran berhasil dikirim'
        });
    } catch (error) {
        console.error('Order Payment API Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memproses pembayaran' }, { status: 500 });
    }
}
