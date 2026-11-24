import { prisma } from '@/lib/prisma';
import { sendEmail, generateOrderStatusEmailHtml } from '@/lib/email';
import { sendWhatsAppMessage, formatOrderStatusWhatsAppMessage } from '@/lib/whatsapp';

export interface NotifyOrderStatusParams {
    orderId: string;
    newStatus: string;
    note?: string;
    customRecipient?: {
        name?: string;
        email?: string;
        phone?: string;
    };
}

/**
 * Service Notifikasi Terpusat: Mengirimkan Email & WhatsApp setiap status pesanan berubah
 */
export async function notifyOrderStatusChange({
    orderId,
    newStatus,
    note,
    customRecipient
}: NotifyOrderStatusParams): Promise<{ emailSent: boolean; waSent: boolean; error?: string }> {
    try {
        // Ambil data order lengkap beserta pemesan & item
        const order = await prisma.order.findUnique({
            where: { id: orderId },
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
            console.warn(`[Notification Service] Order ${orderId} tidak ditemukan untuk dikirimi notifikasi.`);
            return { emailSent: false, waSent: false, error: 'Order not found' };
        }

        const customerName = customRecipient?.name || order.user?.name || 'Pelanggan Setia';
        const customerEmail = customRecipient?.email || order.user?.email;
        const customerPhone = customRecipient?.phone || order.user?.phone;

        // Base URL untuk invoice
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const invoiceUrl = `${baseUrl.replace(/\/+$/, '')}/orders/${order.id}/invoice`;

        let emailSent = false;
        let waSent = false;

        // 1. Kirim Email Notifikasi via Gmail
        if (customerEmail) {
            try {
                const subject = `[PrintWere] Pembaruan Status Pesanan #${order.orderNo || order.id.slice(0, 8)}: ${newStatus}`;
                const html = generateOrderStatusEmailHtml({
                    order,
                    customerName,
                    newStatus,
                    note,
                    invoiceUrl
                });

                const res = await sendEmail({
                    to: customerEmail,
                    subject,
                    html
                });
                emailSent = res.success;
            } catch (err: any) {
                console.error('[Notification Service] Gagal kirim email:', err.message);
            }
        } else {
            console.log(`[Notification Service] Email pelanggan tidak tersedia untuk pesanan ${orderId}`);
        }

        // 2. Kirim Notifikasi WhatsApp via Fonnte
        if (customerPhone) {
            try {
                const waMessage = formatOrderStatusWhatsAppMessage({
                    order,
                    customerName,
                    newStatus,
                    note,
                    invoiceUrl
                });

                const res = await sendWhatsAppMessage({
                    to: customerPhone,
                    message: waMessage
                });
                waSent = res.success;
            } catch (err: any) {
                console.error('[Notification Service] Gagal kirim WhatsApp:', err.message);
            }
        } else {
            console.log(`[Notification Service] Nomor telepon/WA tidak tersedia untuk pesanan ${orderId}`);
        }

        console.log(`[Notification Service] Selesai memproses notifikasi #${order.orderNo || orderId} (${newStatus}) -> Email: ${emailSent ? 'OK' : 'SKIP/FAIL'}, WA: ${waSent ? 'OK' : 'SKIP/FAIL'}`);
        return { emailSent, waSent };
    } catch (error: any) {
        console.error('[Notification Service] Critical error:', error);
        return { emailSent: false, waSent: false, error: error.message };
    }
}
