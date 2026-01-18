
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // Basic validation
        if (!name || name.trim().length < 3) {
            return NextResponse.json({ success: false, error: 'Nama minimal 3 karakter' }, { status: 400 });
        }

        if (!email || !email.includes('@')) {
            return NextResponse.json({ success: false, error: 'Email tidak valid' }, { status: 400 });
        }

        if (!password || password.length < 6) {
            return NextResponse.json({ success: false, error: 'Password minimal 6 karakter' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 400 });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                passwordHash,
                role: 'CUSTOMER',
                status: 'ACTIVE',
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
            }
        });

        return NextResponse.json({
            success: true,
            data: { user },
            message: 'Registrasi berhasil. Silakan login.'
        }, { status: 201 });
    } catch (error) {
        console.error('Registration API Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal melakukan registrasi' }, { status: 500 });
    }
}
