import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileAuthUser } from '@/lib/mobile-auth';

// GET /api/mobile/orders - List customer orders
export async function GET(request: Request) {
    try {
        const user = await getMobileAuthUser(request);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const whereClause: any = { userId: user.id };
        if (status && status !== 'all') {
            whereClause.status = status.toUpperCase();
        }

        const orders = await prisma.order.findMany({
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

        const ordersWithParsedOptions = orders.map((order: any) => ({
            ...order,
            items: order.items.map((item: any) => {
                let parsedOptions = null;
                try {
                    parsedOptions = item.options ? JSON.parse(item.options) : null;
                } catch {
                    parsedOptions = null;
                }
                return { ...item, options: parsedOptions };
            })
        }));

        return NextResponse.json({ success: true, data: ordersWithParsedOptions });
    } catch (error) {
        console.error('Mobile Orders GET Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memuat daftar pesanan' }, { status: 500 });
    }
}

// POST /api/mobile/orders - Create new order
export async function POST(request: Request) {
    try {
        const user = await getMobileAuthUser(request);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu' }, { status: 401 });
        }

        const body = await request.json();
        const { items, totalAmount, paymentMethod, shippingAddress, shippingMethod, shippingCost } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, error: 'Keranjang belanja kosong' }, { status: 400 });
        }

        if (!shippingAddress || shippingAddress.trim().length < 5) {
            return NextResponse.json({ success: false, error: 'Alamat pengiriman wajib diisi lengkap' }, { status: 400 });
        }

        const productIds = items.map((item: any) => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } }
        });

        if (products.length !== productIds.length) {
            return NextResponse.json({ success: false, error: 'Sebagian produk tidak ditemukan' }, { status: 400 });
        }

        // Generate nomor pesanan PW-YYYYMMDD-XXXX
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderNo = `PW-${todayStr}-${randomSuffix}`;

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    orderNo,
                    userId: user.id,
                    totalAmount: totalAmount || 0,
                    status: 'MENUNGGU_PEMBAYARAN',
                    paymentMethod: paymentMethod || 'TRANSFER',
                    shippingAddress: shippingAddress.trim(),
                    shippingMethod: shippingMethod || 'AMBIL_SENDIRI',
                    shippingCost: shippingCost || 0,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: Math.max(1, parseInt(item.quantity) || 1),
                            price: parseFloat(item.price) || 0,
                            width: item.width ? parseFloat(item.width) : null,
                            height: item.height ? parseFloat(item.height) : null,
                            fileUrl: item.fileUrl || null,
                            notes: item.notes || null,
                            options: item.options ? JSON.stringify(item.options) : null
                        }))
                    },
                    statusLogs: {
                        create: {
                            fromStatus: 'BARU',
                            toStatus: 'MENUNGGU_PEMBAYARAN',
                            changedById: user.id,
                            note: 'Pesanan dibuat melalui Aplikasi Mobile PrintWere'
                        }
                    }
                },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            });

            return newOrder;
        });

        return NextResponse.json({
            success: true,
            message: 'Pesanan berhasil dibuat',
            data: order
        }, { status: 201 });
    } catch (error) {
        console.error('Mobile Orders POST Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal membuat pesanan' }, { status: 500 });
    }
}
