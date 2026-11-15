import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileAuthUser } from '@/lib/mobile-auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getMobileAuthUser(request);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { paymentProof } = body;

        if (!paymentProof) {
            return NextResponse.json({ success: false, error: 'Bukti pembayaran wajib dilampirkan' }, { status: 400 });
        }

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
            }
        });

        if (!order) {
            return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan atau bukan milik Anda' }, { status: 404 });
        }

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
                    changedById: user.id,
                    note: 'Pelanggan telah mengunggah bukti transfer via Mobile App'
                }
            });

            return ord;
        });

        return NextResponse.json({
            success: true,
            data: updatedOrder,
            message: 'Bukti pembayaran berhasil dikirim'
        });
    } catch (error) {
        console.error('Mobile Payment Proof API Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memproses bukti pembayaran' }, { status: 500 });
    }
}
