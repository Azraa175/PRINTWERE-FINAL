import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Valid status transitions (Alur PRD v2 + Kompatibilitas Legacy)
const VALID_TRANSITIONS: Record<string, string[]> = {
    'MENUNGGU_PEMBAYARAN': ['MENUNGGU_VERIFIKASI', 'DIBATALKAN', 'ANTRIAN_PRODUKSI'],
    'MENUNGGU_VERIFIKASI': ['ANTRIAN_PRODUKSI', 'PEMBAYARAN_DITOLAK', 'DIBATALKAN'],
    'PEMBAYARAN_DITOLAK': ['MENUNGGU_VERIFIKASI', 'DIBATALKAN'],
    'ANTRIAN_PRODUKSI': ['SEDANG_DICETAK', 'DIBATALKAN'],
    'SEDANG_DICETAK': ['FINISHING', 'DIBATALKAN'],
    'FINISHING': ['SIAP_DIAMBIL', 'DIBATALKAN'],
    'SIAP_DIAMBIL': ['DIKIRIM', 'SELESAI'],
    'DIKIRIM': ['SELESAI'],
    'SELESAI': [],
    'DIBATALKAN': [],

    // Legacy status transitions
    'PENDING': ['CONFIRMED', 'ANTRIAN_PRODUKSI', 'CANCELLED'],
    'CONFIRMED': ['PROCESSING', 'SEDANG_DICETAK', 'CANCELLED'],
    'PROCESSING': ['READY', 'FINISHING', 'CANCELLED'],
    'READY': ['COMPLETED', 'SELESAI'],
    'COMPLETED': [],
    'CANCELLED': []
};

// PATCH /api/admin/orders/[id]/confirm - Confirm/Advance order status
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'STAFF')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email as string }
        });

        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const targetStatus = body.status;
        const note = body.note;

        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: id },
                    { orderNo: id }
                ]
            }
        });
        if (!order) {
            return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
        }

        const currentStatus = order.status;
        const validNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

        let newStatus: string;
        if (targetStatus) {
            if (!validNextStatuses.includes(targetStatus)) {
                return NextResponse.json({
                    success: false,
                    error: `Tidak dapat mengubah status dari ${currentStatus} ke ${targetStatus}. Pilihan valid: ${validNextStatuses.join(', ')}`
                }, { status: 400 });
            }
            newStatus = targetStatus;
        } else {
            // Auto-advance to next logical status
            const nextStatus = validNextStatuses.find(s => s !== 'CANCELLED' && s !== 'DIBATALKAN' && s !== 'PEMBAYARAN_DITOLAK');
            if (!nextStatus) {
                return NextResponse.json({
                    success: false,
                    error: `Pesanan sudah berstatus ${currentStatus} dan tidak dapat dimajukan lagi`
                }, { status: 400 });
            }
            newStatus = nextStatus;
        }

        const updatedOrder = await prisma.$transaction(async (tx) => {
            const ord = await tx.order.update({
                where: { id: order.id },
                data: { status: newStatus }
            });

            // Jika verifikasi pembayaran disetujui (ke Antrian Produksi), update status Payment
            if (newStatus === 'ANTRIAN_PRODUKSI' || newStatus === 'CONFIRMED') {
                const latestPayment = await tx.payment.findFirst({
                    where: { orderId: order.id, status: 'MENUNGGU' },
                    orderBy: { createdAt: 'desc' }
                });
                if (latestPayment) {
                    await tx.payment.update({
                        where: { id: latestPayment.id },
                        data: {
                            status: 'DISETUJUI',
                            verifiedById: adminUser?.id,
                            verifiedAt: new Date()
                        }
                    });
                }
            }

            // Jika pembayaran ditolak
            if (newStatus === 'PEMBAYARAN_DITOLAK') {
                const latestPayment = await tx.payment.findFirst({
                    where: { orderId: order.id, status: 'MENUNGGU' },
                    orderBy: { createdAt: 'desc' }
                });
                if (latestPayment) {
                    await tx.payment.update({
                        where: { id: latestPayment.id },
                        data: {
                            status: 'DITOLAK',
                            rejectReason: note || 'Bukti transfer tidak valid atau tidak terbaca',
                            verifiedById: adminUser?.id,
                            verifiedAt: new Date()
                        }
                    });
                }
            }

            // Catat log perubahan status
            await tx.orderStatusLog.create({
                data: {
                    orderId: order.id,
                    fromStatus: currentStatus,
                    toStatus: newStatus,
                    changedById: adminUser?.id,
                    note: note || `Status diperbarui menjadi ${newStatus} oleh ${adminUser?.name || 'Admin'}`
                }
            });

            return ord;
        });

        return NextResponse.json({
            success: true,
            data: updatedOrder,
            message: `Status pesanan berhasil diubah menjadi ${newStatus}`
        });

    } catch (error) {
        console.error('Admin Order Confirm Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memperbarui status pesanan' }, { status: 500 });
    }
}
