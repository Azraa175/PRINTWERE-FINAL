/**
 * Normalisasi format nomor HP Indonesia ke format internasional (628xxx)
 */
export function normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    // Hapus spasi, strip, tanda kurung, dan karakter non-digit
    let cleaned = phone.replace(/[^0-9]/g, '');

    // Jika diawali dengan '0', ganti menjadi '62'
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    }
    // Jika diawali '+62', sudah menjadi '62' karena non-digit dihapus

    return cleaned;
}

export interface SendWhatsAppPayload {
    to: string;
    message: string;
}

/**
 * Mengirim pesan WhatsApp otomatis via Fonnte REST API
 */
export async function sendWhatsAppMessage({ to, message }: SendWhatsAppPayload): Promise<{ success: boolean; response?: any; error?: string }> {
    const fonnteToken = process.env.FONNTE_TOKEN;
    const cleanPhone = normalizePhoneNumber(to);

    if (!cleanPhone) {
        return { success: false, error: 'Nomor telepon kosong atau tidak valid' };
    }

    if (!fonnteToken) {
        console.warn(`[WhatsApp Notification] FONNTE_TOKEN belum dikonfigurasi di .env. Pesan untuk ${cleanPhone} dilewati.`);
        console.log(`[WhatsApp Preview Message]:\n${message}`);
        return { success: false, error: 'FONNTE_TOKEN not configured' };
    }

    try {
        const formData = new FormData();
        formData.append('target', cleanPhone);
        formData.append('message', message);
        formData.append('countryCode', '62');

        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                Authorization: fonnteToken,
            },
            body: formData,
        });

        const data = await response.json();

        if (data.status) {
            console.log(`[WhatsApp Notification] Pesan WA berhasil terkirim ke ${cleanPhone}`);
            return { success: true, response: data };
        } else {
            console.error(`[WhatsApp Notification] Gagal dari provider:`, data.reason || data);
            return { success: false, error: data.reason || 'Failed to send' };
        }
    } catch (error: any) {
        console.error('[WhatsApp Notification] Error koneksi:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Buat link WhatsApp Click-to-Chat (wa.me) sebagai fallback 1-klik
 */
export function getWhatsAppClickToChatUrl(phone: string, message: string): string {
    const cleanPhone = normalizePhoneNumber(phone);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Format pesan WhatsApp yang ramah dan terstruktur
 */
export function formatOrderStatusWhatsAppMessage({
    order,
    customerName,
    newStatus,
    note,
    invoiceUrl
}: {
    order: any;
    customerName: string;
    newStatus: string;
    note?: string;
    invoiceUrl: string;
}): string {
    const formattedTotal = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(order.totalAmount);

    let statusHeader = '';
    let statusAction = '';

    switch (newStatus) {
        case 'MENUNGGU_PEMBAYARAN':
            statusHeader = '🏷️ *PESANAN BARU DIBUAT (MENUNGGU PEMBAYARAN)*';
            statusAction = 'Silakan selesaikan pembayaran dan unggah bukti transfer melalui tautan invoice di bawah ini.';
            break;
        case 'MENUNGGU_VERIFIKASI':
            statusHeader = '⏳ *BUKTI PEMBAYARAN DITERIMA*';
            statusAction = 'Terima kasih! Bukti transfer Anda telah diterima dan sedang diverifikasi oleh admin kami.';
            break;
        case 'PEMBAYARAN_DITOLAK':
            statusHeader = '⚠️ *BUKTI PEMBAYARAN BELUM SESUAI*';
            statusAction = 'Bukti pembayaran tidak dapat diverifikasi. Mohon unggah ulang bukti transfer yang jelas.';
            break;
        case 'ANTRIAN_PRODUKSI':
            statusHeader = '✅ *PEMBAYARAN LUNAS & MASUK ANTREAN CETAK*';
            statusAction = 'Pembayaran telah terverifikasi! Pesanan Anda saat ini telah dimasukkan ke dalam antrean produksi mesin.';
            break;
        case 'SEDANG_DICETAK':
            statusHeader = '🖨️ *PESANAN SEDANG DICETAK*';
            statusAction = 'File desain Anda saat ini sedang dalam proses pencetakan oleh staf percetakan kami.';
            break;
        case 'FINISHING':
            statusHeader = '✂️ *TAHAP FINISHING*';
            statusAction = 'Cetak selesai! Sekarang pesanan Anda sedang dalam proses finishing (potong / laminasi / mata ayam).';
            break;
        case 'SIAP_DIAMBIL':
            statusHeader = '📦 *PESANAN SIAP DIAMBIL!*';
            statusAction = 'Kabar baik! Cetakan Anda sudah selesai dan dapat diambil di workshop PrintWere sekarang.';
            break;
        case 'DIKIRIM':
            statusHeader = '🚚 *PESANAN DALAM PENGIRIMAN*';
            statusAction = 'Paket cetakan Anda telah diserahkan kepada kurir dan sedang dalam perjalanan menuju alamat Anda.';
            break;
        case 'SELESAI':
            statusHeader = '🎉 *PESANAN SELESAI*';
            statusAction = 'Pesanan cetakan Anda telah selesai diterima. Terima kasih banyak telah mempercayakan cetakan Anda pada PrintWere!';
            break;
        case 'DIBATALKAN':
            statusHeader = '❌ *PESANAN DIBATALKAN*';
            statusAction = 'Pesanan Anda telah dibatalkan.';
            break;
        default:
            statusHeader = `📋 *STATUS PESANAN: ${newStatus}*`;
            statusAction = `Pesanan Anda saat ini berada dalam status: ${newStatus}.`;
    }

    const itemsSummary = order.items && order.items.length > 0
        ? order.items.map((i: any) => `• ${i.product?.name || 'Produk'} (${i.quantity}x)`).join('\n')
        : '• Rincian di faktur online';

    let msg = `Halo Kak *${customerName}*,\n\n${statusHeader}\n\n`;
    msg += `${statusAction}\n\n`;
    msg += `📄 *No. Pesanan:* ${order.orderNo || order.id}\n`;
    msg += `💰 *Total Tagihan:* ${formattedTotal}\n`;
    msg += `📦 *Rincian Cetak:*\n${itemsSummary}\n\n`;

    if (note) {
        msg += `💬 *Catatan:* "${note}"\n\n`;
    }

    msg += `Buka & Unduh Faktur / Invoice Resmi Anda di sini:\n👉 ${invoiceUrl}\n\n`;
    msg += `Salam hangat,\n*PrintWere — Percetakan Digital*\nCustomer Care: 0812-3456-7890`;

    return msg;
}
