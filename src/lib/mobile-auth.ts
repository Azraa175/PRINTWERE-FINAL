import crypto from 'crypto';
import { prisma } from './prisma';

const SECRET = process.env.AUTH_SECRET || 'printwere-super-secret-key-mobile-2026';

export interface MobileTokenPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

export function createMobileToken(payload: { id: string; email: string; role: string }): string {
    const data: MobileTokenPayload = {
        userId: payload.id,
        email: payload.email,
        role: payload.role,
        iat: Date.now(),
        exp: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(data)).toString('base64url');
    const signature = crypto
        .createHmac('sha256', SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');

    return `${header}.${body}.${signature}`;
}

export function verifyMobileToken(tokenString: string): MobileTokenPayload | null {
    try {
        const parts = tokenString.split('.');
        if (parts.length !== 3) return null;

        const [header, body, signature] = parts;
        const expectedSignature = crypto
            .createHmac('sha256', SECRET)
            .update(`${header}.${body}`)
            .digest('base64url');

        if (signature !== expectedSignature) return null;

        const payload: MobileTokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
        if (Date.now() > payload.exp) return null;

        return payload;
    } catch {
        return null;
    }
}

export async function getMobileAuthUser(request: Request) {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader) return null;

    let token = '';
    if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
    } else {
        token = authHeader.trim();
    }

    const payload = verifyMobileToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            bio: true,
            status: true,
            avatar: true
        }
    });

    if (!user || user.status === 'BANNED') return null;
    return user;
}
