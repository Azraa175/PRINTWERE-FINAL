import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const [
            totalOrders,
            pendingOrders,
            waitingVerification,
            inProductionOrders,
            completedOrders,
            totalRevenue,
            totalUsers,
            totalStaff
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({
                where: { status: { in: ['MENUNGGU_PEMBAYARAN', 'PENDING'] } }
            }),
            prisma.order.count({
                where: { status: { in: ['MENUNGGU_VERIFIKASI'] } }
            }),
            prisma.order.count({
                where: {
                    status: {
                        in: [
                            'ANTRIAN_PRODUKSI', 'SEDANG_DICETAK', 'FINISHING', 'SIAP_DIAMBIL', 'DIKIRIM',
                            'CONFIRMED', 'PROCESSING', 'READY'
                        ]
                    }
                }
            }),
            prisma.order.count({
                where: { status: { in: ['SELESAI', 'COMPLETED'] } }
            }),
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { status: { notIn: ['CANCELLED', 'DIBATALKAN', 'PEMBAYARAN_DITOLAK'] } }
            }),
            prisma.user.count({ where: { role: 'CUSTOMER' } }),
            prisma.user.count({ where: { role: 'STAFF' } })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                waitingVerification,
                inProductionOrders,
                completedOrders,
                paidOrders: inProductionOrders + completedOrders, // Backward compat
                totalRevenue: totalRevenue._sum.totalAmount || 0,
                totalUsers,
                totalStaff
            }
        });
    } catch (error) {
        console.error('Admin Stats GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
    }
}
