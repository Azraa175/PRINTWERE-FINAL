import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createMobileToken } from '@/lib/mobile-auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, phone, address } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, error: 'Nama, email, dan password wajib diisi' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Password minimal 6 karakter' },
                { status: 400 }
            );
        }

        const existing = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Email sudah terdaftar. Silakan login.' },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                passwordHash,
                role: 'CUSTOMER',
                phone: phone ? phone.trim() : null,
                bio: address ? address.trim() : null,
                status: 'ACTIVE'
            }
        });

        const token = createMobileToken({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role
        });

        return NextResponse.json({
            success: true,
            message: 'Registrasi berhasil',
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    phone: newUser.phone,
                    bio: newUser.bio,
                    avatar: newUser.avatar
                },
                token
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Mobile Register API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal melakukan pendaftaran akun' },
            { status: 500 }
        );
    }
}
