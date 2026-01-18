
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

        const { id } = await params;

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Cannot cancel completed or already cancelled orders
        if (order.status === 'COMPLETED') {
            return NextResponse.json({
                success: false,
                error: 'Cannot cancel a completed order'
            }, { status: 400 });
        }

        if (order.status === 'CANCELLED') {
            return NextResponse.json({
                success: false,
                error: 'Order is already cancelled'
            }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        return NextResponse.json({
            success: true,
            data: updatedOrder,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        console.error('Admin Order Cancel Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to cancel order' }, { status: 500 });
    }
}
