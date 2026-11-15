import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Status yang masuk dalam alur kerja produksi karyawan
const PRODUCTION_STATUSES = [
    'ANTRIAN_PRODUKSI',
    'SEDANG_DICETAK',
    'FINISHING',
    'SIAP_DIAMBIL',
    'CONFIRMED',
    'PROCESSING',
    'READY'
];

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
            return NextResponse.json({ success: false, error: 'Akses khusus Karyawan / Admin' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status');

        const whereCondition: any = {};
        if (statusFilter && statusFilter !== 'ALL') {
            whereCondition.status = statusFilter;
        } else {
            // Default: tampilkan semua yang berada dalam alur produksi atau yang belum selesai
            whereCondition.status = {
                in: [...PRODUCTION_STATUSES, 'MENUNGGU_VERIFIKASI', 'DIKIRIM']
            };
        }

        const orders = await prisma.order.findMany({
            where: whereCondition,
            orderBy: [
                { dueDate: 'asc' },
                { createdAt: 'desc' }
            ],
            include: {
                user: {
                    select: { id: true, name: true, phone: true, email: true }
                },
                items: {
                    include: {
                        product: {
                            select: { id: true, name: true, priceType: true, category: true, image: true }
                        }
                    }
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                statusLogs: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        changedBy: {
                            select: { id: true, name: true, role: true }
                        }
                    }
                }
            }
        });

        const parsedOrders = orders.map((order) => ({
            ...order,
            items: order.items.map((item) => ({
                ...item,
                options: item.options ? (() => {
                    try { return JSON.parse(item.options as string); } catch { return item.options; }
                })() : null
            }))
        }));

        return NextResponse.json({ success: true, data: parsedOrders });
    } catch (error) {
        console.error('Staff Queue GET Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengambil antrian produksi' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
            return NextResponse.json({ success: false, error: 'Akses khusus Karyawan / Admin' }, { status: 403 });
        }

        const body = await request.json();
        const { orderId, nextStatus, note } = body;

        if (!orderId || !nextStatus) {
            return NextResponse.json({ success: false, error: 'orderId dan nextStatus wajib diisi' }, { status: 400 });
        }

        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!existingOrder) {
            return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
        }

        const previousStatus = existingOrder.status;

        // Update status order dan catat di OrderStatusLog
        const updatedOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: nextStatus,
                    assignedStaffId: user.id
                }
            });

            await tx.orderStatusLog.create({
                data: {
                    orderId: orderId,
                    fromStatus: previousStatus,
                    toStatus: nextStatus,
                    changedById: user.id,
                    note: note || `Status diperbarui oleh ${user.name} (${user.role})`
                }
            });

            return order;
        });

        return NextResponse.json({
            success: true,
            data: updatedOrder,
            message: `Status pesanan berhasil diubah menjadi ${nextStatus}`
        });
    } catch (error) {
        console.error('Staff Queue PATCH Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memperbarui status produksi' }, { status: 500 });
    }
}

