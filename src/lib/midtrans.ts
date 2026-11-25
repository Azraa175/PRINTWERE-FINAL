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

    const payload = {
        transaction_details: {
            order_id: params.orderId,
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
        item_details: params.itemDetails && params.itemDetails.length > 0
            ? params.itemDetails.map(item => ({
                id: item.id.slice(0, 50),
                price: Math.round(item.price),
                quantity: item.quantity,
                name: item.name.slice(0, 50),
            }))
            : undefined,
    };

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authHeader,
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
        console.error('[Midtrans Snap Error]:', data);
        throw new Error(data.error_messages ? data.error_messages.join(', ') : 'Gagal membuat transaksi Midtrans Snap');
    }

    return {
        token: data.token,
        redirect_url: data.redirect_url,
    };
}

/**
 * Validasi SHA512 Signature Key dari webhook notifikasi Midtrans
 */
export function verifyMidtransSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
): boolean {
    const serverKey = getMidtransServerKey();
    const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const calculatedHash = crypto.createHash('sha512').update(raw).digest('hex');
    return calculatedHash.toLowerCase() === signatureKey.toLowerCase();
}
