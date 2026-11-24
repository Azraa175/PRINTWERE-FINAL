import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, formatOrderStatusWhatsAppMessage, normalizePhoneNumber } from '@/lib/whatsapp';

// POST /api/orders/[id]/send-invoice - Kirim invoice ke nomor WhatsApp
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));

        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: id },
                    { orderNo: id }
                ]
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                category: true,
                                price: true
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
        }

        // Tentukan nomor tujuan:
        // 1. Dari body request (jika user menginputkan manual)
        // 2. Dari order.user.phone
        // 3. Ekstraksi dari order.shippingAddress
        let targetPhone = body.phone;

        if (!targetPhone) {
            targetPhone = order.user?.phone;
            // Jika dummy atau kosong, cari di alamat
            const isDummySeed = targetPhone && ['081234567890', '081234567891', '081234567892'].includes(targetPhone.trim());
            if (!targetPhone || isDummySeed) {
                const match = order.shippingAddress?.match(/(?:(?:\+?62)|0)8[0-9]{8,12}/);
                if (match) {
                    targetPhone = match[0];
                }
            }
        }

        if (!targetPhone) {
            return NextResponse.json({
                success: false,
                error: 'Nomor WhatsApp tidak ditemukan. Silakan masukkan nomor WhatsApp tujuan.'
            }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || 
                        'https://printwere.vercel.app';
        const invoiceUrl = `${baseUrl.replace(/\/+$/, '')}/orders/${order.id}/invoice`;

        const waMessage = formatOrderStatusWhatsAppMessage({
            order,
            customerName: order.user?.name || 'Pelanggan',
            newStatus: order.status,
            note: 'Berikut adalah tautan faktur / invoice digital resmi pesanan percetakan Anda.',
            invoiceUrl
        });

        const res = await sendWhatsAppMessage({
            to: targetPhone,
            message: waMessage
        });

        if (res.success) {
            return NextResponse.json({
                success: true,
                message: `Invoice digital berhasil dikirim ke WhatsApp (${normalizePhoneNumber(targetPhone)})`,
                data: res.response
            });
        } else {
            return NextResponse.json({
                success: false,
                error: res.error || 'Gagal mengirim pesan via WhatsApp Fonnte'
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Send Invoice WhatsApp Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
    }
}
