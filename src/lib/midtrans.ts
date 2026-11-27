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

    let result = await callSnap(params.orderId);

    // Jika order_id sudah pernah dipakai di Midtrans (user buka ulang halaman bayar), retry dengan suffix unik
    if (!result.ok && JSON.stringify(result.data).includes('already been taken')) {
        const retryOrderId = `${params.orderId}-${Date.now().toString().slice(-5)}`;
        result = await callSnap(retryOrderId);
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
    };
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
