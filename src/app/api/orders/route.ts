import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { notifyOrderStatusChange } from '@/lib/notifications';

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true, status: true }
                },
                items: {
                    include: {
                        product: {
                            select: { id: true, name: true, image: true, price: true, category: true }
                        }
                    }
                }
            }
        });

        const ordersWithParsedOptions = orders.map((order: any) => ({
            ...order,
            items: order.items.map((item: any) => ({
                ...item,
                options: item.options ? JSON.parse(item.options as string) : null
            }))
        }));

        return NextResponse.json({ success: true, data: ordersWithParsedOptions });
    } catch (error) {
        console.error('API GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Get authenticated user
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu' }, { status: 401 });
        }

        // Find user in database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 });
        }

        // Check if user is banned
        if (user.status === 'BANNED') {
            return NextResponse.json({ success: false, error: 'Akun Anda telah diblokir' }, { status: 403 });
        }

        const body = await request.json();
        const { items, totalAmount, paymentMethod, shippingAddress, shippingMethod, shippingCost, phone } = body;

        // Update nomor telepon user jika disertakan dan valid
        if (phone && phone.trim().length >= 8) {
            await prisma.user.update({
                where: { id: user.id },
                data: { phone: phone.trim() }
            }).catch(err => console.log('Update user phone error:', err));
        }

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, error: 'Tidak ada produk dalam pesanan' }, { status: 400 });
        }

        // Validate required fields
        if (!shippingAddress || shippingAddress.trim().length < 5) {
            return NextResponse.json({ success: false, error: 'Alamat pengiriman tidak valid' }, { status: 400 });
        }

        if (!paymentMethod || !['COD', 'QRIS', 'TRANSFER'].includes(paymentMethod)) {
            return NextResponse.json({ success: false, error: 'Metode pembayaran tidak valid' }, { status: 400 });
        }

        // Validate all product IDs exist
        const productIds = items.map((item: any) => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } }
        });

        if (products.length !== productIds.length) {
            return NextResponse.json({ success: false, error: 'Beberapa produk tidak ditemukan' }, { status: 400 });
        }

        // Generate format nomor pesanan: PW-YYYYMMDD-XXXX
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderNo = `PW-${todayStr}-${randomSuffix}`;

        // Use transaction for data consistency
        const order = await prisma.$transaction(async (tx) => {
            // Create order with items
            const newOrder = await tx.order.create({
                data: {
                    orderNo: orderNo,
                    userId: user.id,
                    totalAmount: totalAmount || 0,
                    status: 'MENUNGGU_PEMBAYARAN',
                    paymentMethod: paymentMethod,
                    shippingAddress: shippingAddress.trim(),
                    shippingMethod: shippingMethod || 'JNE',
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
                            note: 'Pesanan baru dibuat oleh pelanggan, menunggu pembayaran'
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

        // Kirim notifikasi WA & Gmail (asinkron tanpa menghambat response)
        notifyOrderStatusChange({
            orderId: order.id,
            newStatus: 'MENUNGGU_PEMBAYARAN',
            note: 'Pesanan baru dibuat, silakan lakukan pembayaran',
            customRecipient: phone ? { phone: phone.trim() } : undefined
        }).catch(err => console.error('[Order Create Notification Error]:', err));

        return NextResponse.json({ success: true, data: order }, { status: 201 });
    } catch (error) {
        console.error('API POST Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal membuat pesanan. Silakan coba lagi.' }, { status: 500 });
    }
}
