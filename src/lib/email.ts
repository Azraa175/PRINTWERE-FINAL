import nodemailer from 'nodemailer';

// Helper transporter untuk Gmail SMTP
const getTransporter = () => {
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass.replace(/\s+/g, ''), // Hapus spasi jika ada di App Password
        },
    });
};

export interface SendEmailPayload {
    to: string;
    subject: string;
    html: string;
}

/**
 * Mengirim email menggunakan Gmail SMTP
 */
export async function sendEmail({ to, subject, html }: SendEmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const transporter = getTransporter();
        const sender = process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@printwere.com';

        if (!transporter) {
            console.warn('[Email Notification] SMTP_USER atau SMTP_PASS belum dikonfigurasi di .env. Email dilewati.');
            return { success: false, error: 'SMTP credentials not configured' };
        }

        const info = await transporter.sendMail({
            from: `"PrintWere Percetakan" <${sender}>`,
            to,
            subject,
            html,
        });

        console.log(`[Email Notification] Email sukses terkirim ke ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error('[Email Notification] Gagal mengirim email:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Status meta deskripsi untuk isi email
 */
const STATUS_DESCRIPTIONS: Record<string, { title: string; color: string; desc: string }> = {
    'MENUNGGU_PEMBAYARAN': {
        title: 'Pesanan Diterima - Menunggu Pembayaran',
        color: '#f59e0b',
        desc: 'Pesanan Anda telah berhasil dibuat. Silakan lakukan pembayaran dan unggah bukti transfer agar pesanan Anda dapat segera kami proses.'
    },
    'MENUNGGU_VERIFIKASI': {
        title: 'Bukti Pembayaran Diterima',
        color: '#3b82f6',
        desc: 'Terima kasih telah melakukan pembayaran! Admin kami sedang memverifikasi bukti pembayaran Anda.'
    },
    'PEMBAYARAN_DITOLAK': {
        title: 'Pembayaran Ditolak',
        color: '#ef4444',
        desc: 'Mohon maaf, bukti pembayaran yang Anda unggah tidak valid atau tidak terbaca. Silakan unggah ulang bukti transfer yang jelas.'
    },
    'ANTRIAN_PRODUKSI': {
        title: 'Pembayaran Dikonfirmasi - Masuk Antrean Cetak',
        color: '#10b981',
        desc: 'Pembayaran telah kami terima dan diverifikasi. Pesanan Anda saat ini telah masuk antrean produksi workshop.'
    },
    'SEDANG_DICETAK': {
        title: 'Pesanan Sedang Dicetak',
        color: '#6366f1',
        desc: 'Pesanan Anda saat ini sedang dalam proses pencetakan oleh operator mesin kami.'
    },
    'FINISHING': {
        title: 'Tahap Finishing & Quality Check',
        color: '#8b5cf6',
        desc: 'Cetak telah selesai! Saat ini pesanan Anda sedang dalam proses pemotongan, laminasi, atau pemasangan mata ayam.'
    },
    'SIAP_DIAMBIL': {
        title: 'Pesanan Siap Diambil!',
        color: '#059669',
        desc: 'Kabar gembira! Pesanan cetak Anda sudah selesai dan siap diambil di workshop PrintWere.'
    },
    'DIKIRIM': {
        title: 'Pesanan Telah Dikirimkan',
        color: '#0ea5e9',
        desc: 'Paket pesanan cetak Anda telah diserahkan kepada jasa ekspedisi/kurir dan sedang menuju ke alamat pengiriman Anda.'
    },
    'SELESAI': {
        title: 'Pesanan Selesai',
        color: '#10b981',
        desc: 'Pesanan Anda telah dinyatakan selesai. Terima kasih telah mempercayakan kebutuhan cetak Anda kepada PrintWere!'
    },
    'DIBATALKAN': {
        title: 'Pesanan Dibatalkan',
        color: '#64748b',
        desc: 'Pesanan ini telah dibatalkan. Jika ada pertanyaan, silakan hubungi tim customer service kami.'
    }
};

/**
 * Generator template email HTML profesional
 */
export function generateOrderStatusEmailHtml({
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
    const meta = STATUS_DESCRIPTIONS[newStatus] || {
        title: `Status Pesanan: ${newStatus}`,
        color: '#2563eb',
        desc: `Pesanan Anda saat ini berstatus ${newStatus}.`
    };

    const formattedTotal = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(order.totalAmount);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${meta.title} - PrintWere</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px 0; color: #1e293b;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <tr>
            <td style="background-color: #1e3a8a; padding: 28px 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PrintWere</h1>
                <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Sistem Manajemen Percetakan Digital</p>
            </td>
        </tr>

        <!-- Status Banner -->
        <tr>
            <td style="padding: 24px 32px 0 32px;">
                <div style="background-color: ${meta.color}15; border-left: 4px solid ${meta.color}; padding: 14px 18px; border-radius: 8px;">
                    <p style="margin: 0; color: ${meta.color}; font-weight: 700; font-size: 16px;">${meta.title}</p>
                    <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px; line-height: 1.5;">${meta.desc}</p>
                    ${note ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #0f172a; font-style: italic; background-color: rgba(255,255,255,0.7); padding: 6px 10px; border-radius: 4px;">Catatan Admin/Staff: "${note}"</p>` : ''}
                </div>
            </td>
        </tr>

        <!-- Greeting -->
        <tr>
            <td style="padding: 20px 32px 0 32px;">
                <p style="font-size: 14px; margin: 0; line-height: 1.6;">Halo, <strong>${customerName}</strong>!</p>
                <p style="font-size: 13px; color: #64748b; margin: 6px 0 0 0;">Berikut adalah rincian terkini mengenai pesanan cetak Anda:</p>
            </td>
        </tr>

        <!-- Order Information Box -->
        <tr>
            <td style="padding: 16px 32px;">
                <table width="100%" style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; font-size: 13px; border: 1px solid #e2e8f0;">
                    <tr>
                        <td style="color: #64748b; padding: 4px 0;">No. Pesanan:</td>
                        <td align="right" style="font-weight: 700; color: #0f172a; font-family: monospace;">${order.orderNo || order.id}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; padding: 4px 0;">Total Pembayaran:</td>
                        <td align="right" style="font-weight: 800; color: #1d4ed8; font-size: 15px;">${formattedTotal}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; padding: 4px 0;">Metode Bayar:</td>
                        <td align="right" style="font-weight: 600; color: #334155; text-transform: uppercase;">${order.paymentMethod || 'Transfer / QRIS'}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; padding: 4px 0;">Opsi Penyerahan:</td>
                        <td align="right" style="font-weight: 600; color: #334155;">${order.deliveryType === 'PICKUP' ? 'Ambil di Toko' : 'Kirim Ekspedisi'}</td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- CTA Button -->
        <tr>
            <td style="padding: 10px 32px 28px 32px; text-align: center;">
                <a href="${invoiceUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                    📄 Buka Faktur / Invoice Resmi
                </a>
                <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8;">Anda dapat mencetak atau mengunduh invoice dalam format PDF kapan saja.</p>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                <p style="margin: 0; font-weight: 600; color: #334155;">PrintWere — Percetakan Digital Cepat & Berkualitas</p>
                <p style="margin: 4px 0 0 0;">Jl. Percetakan Digital No. 175 • Customer Support: +62 812-3456-7890</p>
                <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 10px;">Email ini dikirimkan otomatis oleh sistem. Mohon tidak membalas langsung ke alamat ini.</p>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}
