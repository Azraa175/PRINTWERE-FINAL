import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// PATCH /api/admin/orders/[id]/cancel - Cancel order
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email as string }
        });

        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const reason = body.reason || '';

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) {
            return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
        }

        // Cannot cancel completed or already cancelled orders
        if (order.status === 'COMPLETED' || order.status === 'SELESAI') {
            return NextResponse.json({
                success: false,
                error: 'Tidak dapat membatalkan pesanan yang sudah selesai'
            }, { status: 400 });
        }

        if (order.status === 'CANCELLED' || order.status === 'DIBATALKAN') {
            return NextResponse.json({
                success: false,
                error: 'Pesanan sudah dibatalkan sebelumnya'
            }, { status: 400 });
        }

        const previousStatus = order.status;

        const updatedOrder = await prisma.$transaction(async (tx) => {
            const ord = await tx.order.update({
                where: { id },
                data: { status: 'DIBATALKAN' }
            });

            await tx.orderStatusLog.create({
                data: {
                    orderId: id,
                    fromStatus: previousStatus,
                    toStatus: 'DIBATALKAN',
                    changedById: adminUser?.id,
                    note: reason
                        ? `Dibatalkan oleh Admin: ${reason}`
                        : `Pesanan dibatalkan oleh ${adminUser?.name || 'Admin'}`
                }
            });

            return ord;
        });

        return NextResponse.json({
            success: true,
            data: updatedOrder,
            message: 'Pesanan berhasil dibatalkan'
        });

    } catch (error) {
        console.error('Admin Order Cancel Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal membatalkan pesanan' }, { status: 500 });
    }
}
