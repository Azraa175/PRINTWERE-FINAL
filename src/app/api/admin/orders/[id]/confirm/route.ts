
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['PROCESSING', 'CANCELLED'],
    'PROCESSING': ['READY', 'CANCELLED'],
    'READY': ['COMPLETED'],
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
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const targetStatus = body.status; // Optional: specific status to set

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        const currentStatus = order.status;
        const validNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

        // If target status is specified, validate it
        let newStatus: string;
        if (targetStatus) {
            if (!validNextStatuses.includes(targetStatus)) {
                return NextResponse.json({
                    success: false,
                    error: `Cannot change status from ${currentStatus} to ${targetStatus}. Valid options: ${validNextStatuses.join(', ')}`
                }, { status: 400 });
            }
            newStatus = targetStatus;
        } else {
            // Auto-advance to next logical status (excluding CANCELLED)
            const nextStatus = validNextStatuses.find(s => s !== 'CANCELLED');
            if (!nextStatus) {
                return NextResponse.json({
                    success: false,
                    error: `Order is already ${currentStatus} and cannot be advanced further`
                }, { status: 400 });
            }
            newStatus = nextStatus;
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status: newStatus }
        });

        return NextResponse.json({
            success: true,
            data: updatedOrder,
            message: `Order status changed from ${currentStatus} to ${newStatus}`
        });

    } catch (error) {
        console.error('Admin Order Confirm Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to confirm order' }, { status: 500 });
    }
}
