import crypto from 'crypto';

export function getMidtransServerKey(): string {
    return process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-zq9v4P~AE9nrij7wleUnucN9';
}

export function getMidtransClientKey(): string {
    return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-K7XwXTsA5VzBPpSg';
}

export function isMidtransProduction(): boolean {
    return process.env.MIDTRANS_IS_PRODUCTION === 'true';
}

export function getSnapApiBaseUrl(): string {
    return isMidtransProduction()
        ? 'https://app.midtrans.com'
        : 'https://app.sandbox.midtrans.com';
}

export function getCoreApiBaseUrl(): string {
    return isMidtransProduction()
        ? 'https://api.midtrans.com'
        : 'https://api.sandbox.midtrans.com';
}

export interface SnapTransactionParams {
    orderId: string;
    grossAmount: number;
    customerDetails?: {
        firstName?: string;
        email?: string;
        phone?: string;
        billingAddress?: any;
        shippingAddress?: any;
    };
    itemDetails?: Array<{
        id: string;
        price: number;
        quantity: number;
        name: string;
    }>;
}

export interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
    orderId: string;
}

/**
 * Buat transaksi Midtrans Snap
 */
export async function createSnapTransaction(params: SnapTransactionParams): Promise<SnapTransactionResponse> {
    const serverKey = getMidtransServerKey();
    const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');
    const endpoint = `${getSnapApiBaseUrl()}/snap/v1/transactions`;

    // Pastikan gross_amount integer (Rupiah)
    const amount = Math.round(params.grossAmount);

    // Validasi item_details: Midtrans mewajibkan sum(price * quantity) === gross_amount
    let validItemDetails: Array<{ id: string; price: number; quantity: number; name: string }> | undefined = undefined;
    if (params.itemDetails && params.itemDetails.length > 0) {
        const mapped = params.itemDetails.map(item => ({
            id: item.id.slice(0, 50),
            price: Math.round(item.price),
            quantity: item.quantity,
            name: item.name.slice(0, 50),
        }));
        const itemsSum = mapped.reduce((sum, i) => sum + i.price * i.quantity, 0);
        if (itemsSum === amount) {
            validItemDetails = mapped;
        } else if (amount > itemsSum) {
            mapped.push({
                id: 'FEE-TAX',
                price: amount - itemsSum,
                quantity: 1,
                name: 'Pajak PPN / Ongkir / Biaya',
            });
            validItemDetails = mapped;
        }
        // Jika amount < itemsSum (misal ada diskon), jangan kirim item_details agar tidak ditolak Midtrans
    }

    const buildPayload = (midtransOrderId: string) => ({
        transaction_details: {
            order_id: midtransOrderId,
            gross_amount: amount,
        },
        credit_card: {
            secure: true,
        },
        customer_details: {
            first_name: params.customerDetails?.firstName || 'Pelanggan',
            email: params.customerDetails?.email || 'customer@printwere.com',
            phone: params.customerDetails?.phone || '',
        },
        ...(validItemDetails ? { item_details: validItemDetails } : {}),
    });

    const callSnap = async (midtransOrderId: string) => {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify(buildPayload(midtransOrderId)),
        });
        const data = await res.json();
        return { ok: res.ok, data };
    };

    let usedOrderId = params.orderId;
    let result = await callSnap(usedOrderId);

    // Jika order_id sudah pernah dipakai di Midtrans (user buka ulang halaman bayar), retry dengan suffix unik
    if (!result.ok && JSON.stringify(result.data).includes('already been taken')) {
        usedOrderId = `${params.orderId}-${Date.now().toString().slice(-5)}`;
        result = await callSnap(usedOrderId);
    }

    if (!result.ok || !result.data?.token) {
        console.error('[Midtrans Snap Error]:', result.data);
        throw new Error(
            result.data?.error_messages
                ? result.data.error_messages.join(', ')
                : 'Gagal membuat transaksi Midtrans Snap'
        );
    }

    return {
        token: result.data.token,
        redirect_url: result.data.redirect_url,
        orderId: usedOrderId,
    };
}

export interface QrisChargeResponse {
    transactionId: string;
    orderId: string;
    qrCodeUrl: string;
    qrString: string;
    expiryTime?: string;
}

/**
 * Buat transaksi QRIS langsung via Midtrans Core API (/v2/charge)
 * Menghasilkan URL gambar PNG resmi (api.sandbox.midtrans.com/v2/qris/.../qr-code)
 */
export async function createQrisCharge(params: SnapTransactionParams): Promise<QrisChargeResponse> {
    const serverKey = getMidtransServerKey();
    const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');
    const endpoint = `${getCoreApiBaseUrl()}/v2/charge`;
    const amount = Math.round(params.grossAmount);

    const callCharge = async (midtransOrderId: string) => {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({
                payment_type: 'qris',
                transaction_details: {
                    order_id: midtransOrderId,
                    gross_amount: amount,
                },
                customer_details: {
                    first_name: params.customerDetails?.firstName || 'Pelanggan',
                    email: params.customerDetails?.email || 'customer@printwere.com',
                    phone: params.customerDetails?.phone || '',
                },
            }),
        });
        const data = await res.json();
        return { ok: res.ok, data };
    };

    let result = await callCharge(params.orderId);

    // Retry dengan suffix unik jika order_id sudah pernah dipakai di Midtrans
    if (
        result.data?.status_code === '406' ||
        JSON.stringify(result.data).toLowerCase().includes('already') ||
        JSON.stringify(result.data).toLowerCase().includes('duplicate')
    ) {
        const retryOrderId = `${params.orderId}-Q${Date.now().toString().slice(-4)}`;
        result = await callCharge(retryOrderId);
    }

    const data = result.data;
    const qrAction = Array.isArray(data?.actions)
        ? data.actions.find((a: any) => a.name === 'generate-qr-code')
        : null;

    if (!qrAction?.url) {
        console.error('[Midtrans Core QRIS Error]:', data);
        throw new Error(data?.status_message || 'Gagal membuat QRIS Midtrans');
    }

    return {
        transactionId: data.transaction_id,
        orderId: data.order_id,
        qrCodeUrl: qrAction.url,
        qrString: data.qr_string || '',
        expiryTime: data.expiry_time,
    };
}

/**
 * Cek status transaksi langsung ke Midtrans Core API (/v2/{orderId}/status)
 */
export async function getMidtransTransactionStatus(midtransOrderId: string): Promise<any | null> {
    try {
        const serverKey = getMidtransServerKey();
        const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');
        const endpoint = `${getCoreApiBaseUrl()}/v2/${encodeURIComponent(midtransOrderId)}/status`;

        const res = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': authHeader,
            },
            cache: 'no-store',
        });

        const data = await res.json();
        if (!res.ok || data.status_code === '404') {
            return null;
        }
        return data;
    } catch (e) {
        console.error('[Midtrans Get Status Error]:', e);
        return null;
    }
}

/**
 * Validasi SHA512 Signature Key dari webhook notifikasi Midtrans
 */
export function verifyMidtransSignature(
    orderId?: string,
    statusCode?: string,
    grossAmount?: string,
    signatureKey?: string
): boolean {
    if (!orderId || !statusCode || !grossAmount || !signatureKey) {
        return false;
    }
    const serverKey = getMidtransServerKey();
    const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const calculatedHash = crypto.createHash('sha512').update(raw).digest('hex');
    return calculatedHash.toLowerCase() === signatureKey.toLowerCase();
}
