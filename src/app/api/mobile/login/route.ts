import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createMobileToken } from '@/lib/mobile-auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email dan password wajib diisi' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Email atau password salah' },
                { status: 401 }
            );
        }

        if (user.status === 'BANNED') {
            return NextResponse.json(
                { success: false, error: 'Akun Anda telah dinonaktifkan / diblokir' },
                { status: 403 }
            );
        }

        if (!user.passwordHash) {
            return NextResponse.json(
                { success: false, error: 'Akun belum memiliki password terdaftar' },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json(
                { success: false, error: 'Email atau password salah' },
                { status: 401 }
            );
        }

        const token = createMobileToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        return NextResponse.json({
            success: true,
            message: 'Login berhasil',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    bio: user.bio,
                    avatar: user.avatar
                },
                token
            }
        });
    } catch (error) {
        console.error('Mobile Login API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan pada server saat login' },
            { status: 500 }
        );
    }
}
