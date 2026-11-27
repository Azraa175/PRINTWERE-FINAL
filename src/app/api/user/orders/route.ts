
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { syncOrderWithMidtrans } from '@/lib/midtransSync';

// GET /api/user/orders - Get orders for authenticated user
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu' }, { status: 401 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 });
        }

        // Check if banned
        if (user.status === 'BANNED') {
            return NextResponse.json({ success: false, error: 'Akun Anda telah diblokir' }, { status: 403 });
        }

        // Get status filter from query params
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const whereClause: any = { userId: user.id };
        if (status && status !== 'all') {
            whereClause.status = status.toUpperCase();
        }

        let orders = await prisma.order.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                price: true,
                                priceType: true,
                                category: true
                            }
                        }
                    }
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                statusLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: {
                        changedBy: {
                            select: { id: true, name: true, role: true }
                        }
                    }
                }
            }
        });

        // Sinkronisasi aktif pesanan yang masih menunggu pembayaran dengan Midtrans
        const pendingOrders = orders
            .filter((o: any) => ['MENUNGGU_PEMBAYARAN', 'PENDING', 'PEMBAYARAN_DITOLAK'].includes(o.status))
            .slice(0, 3);
        if (pendingOrders.length > 0) {
            const syncResults = await Promise.all(
                pendingOrders.map((o: any) => syncOrderWithMidtrans(o.id))
            );
            if (syncResults.some(Boolean)) {
                orders = await prisma.order.findMany({
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true,
                                        price: true,
                                        priceType: true,
                                        category: true
                                    }
                                }
                            }
                        },
                        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
                        statusLogs: {
                            orderBy: { createdAt: 'desc' },
                            take: 5,
                            include: { changedBy: { select: { id: true, name: true, role: true } } }
                        }
                    }
                });
            }
        }

        // Parse options JSON string with error handling
        const ordersWithParsedOptions = orders.map((order: any) => ({
            ...order,
            items: order.items.map((item: any) => {
                let parsedOptions = null;
                try {
                    parsedOptions = item.options ? JSON.parse(item.options) : null;
                } catch (e) {
                    parsedOptions = null;
                }
                return { ...item, options: parsedOptions };
            })
        }));

        return NextResponse.json({ success: true, data: ordersWithParsedOptions });
    } catch (error) {
        console.error('User Orders GET Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memuat pesanan' }, { status: 500 });
    }
}
