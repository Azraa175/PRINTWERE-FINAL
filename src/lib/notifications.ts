import { prisma } from '@/lib/prisma';
import { sendEmail, generateOrderStatusEmailHtml } from '@/lib/email';
import { sendWhatsAppMessage, formatOrderStatusWhatsAppMessage, normalizePhoneNumber } from '@/lib/whatsapp';

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
 * Ekstraksi nomor HP dari teks (misal: "Budi (085156669696)\nJl. Dago...")
 */
function extractPhoneFromText(text?: string | null): string | null {
    if (!text) return null;
    const match = text.match(/(?:(?:\+?62)|0)8[0-9]{8,12}/);
    return match ? match[0] : null;
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

        // Prioritas penentuan nomor HP WhatsApp:
        // 1. customRecipient.phone
        // 2. Jika user.phone ada dan bukan dummy, gunakan user.phone
        // 3. Fallback: ekstraksi dari shippingAddress
        let customerPhone = customRecipient?.phone || order.user?.phone;
        const phoneFromAddress = extractPhoneFromText(order.shippingAddress);

        // Jika nomor user adalah dummy default (081234567890/1/2) dan ada nomor asli di alamat pengiriman, utamakan nomor di alamat
        const isDummySeed = customerPhone && ['081234567890', '081234567891', '081234567892'].includes(customerPhone.trim());
        if ((!customerPhone || isDummySeed) && phoneFromAddress) {
            customerPhone = phoneFromAddress;
        }

        // Base URL untuk invoice - default ke domain produksi Vercel agar link selalu bisa dibuka di perangkat mobile
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || 
                        'https://printwere.vercel.app';
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

        console.log(`[Notification Service] Selesai memproses notifikasi #${order.orderNo || orderId} (${newStatus}) -> Email: ${emailSent ? 'OK' : 'SKIP/FAIL'}, WA (${customerPhone}): ${waSent ? 'OK' : 'SKIP/FAIL'}`);
        return { emailSent, waSent };
    } catch (error: any) {
        console.error('[Notification Service] Critical error:', error);
        return { emailSent: false, waSent: false, error: error.message };
    }
}
