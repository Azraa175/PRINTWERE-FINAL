
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const [totalOrders, pendingOrders, paidOrders, totalRevenue, totalUsers] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PROCESSING', 'READY', 'COMPLETED'] } } }),
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { status: { not: 'CANCELLED' } }
            }),
            prisma.user.count({ where: { role: 'CUSTOMER' } })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                paidOrders,
                totalRevenue: totalRevenue._sum.totalAmount || 0,
                totalUsers
            }
        });
    } catch (error) {
        console.error('Admin Stats GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
    }
}
