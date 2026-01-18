
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// GET /api/user/profile - Get current user profile
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                avatar: true,
                phone: true,
                bio: true,
                gender: true,
                birthDate: true,
                createdAt: true,
                _count: { select: { orders: true } }
            }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Check if banned
        if (user.status === 'BANNED') {
            return NextResponse.json({
                success: false,
                error: 'Account is banned',
                data: { ...user, isBanned: true }
            }, { status: 403 });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        console.error('Profile GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
    }
}

// PUT /api/user/profile - Update current user profile
export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user exists and not banned
        const existingUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!existingUser) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        if (existingUser.status === 'BANNED') {
            return NextResponse.json({ success: false, error: 'Account is banned' }, { status: 403 });
        }

        const body = await request.json();
        const { name, phone, bio, gender, birthDate } = body;

        // Validation
        if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
            return NextResponse.json({ success: false, error: 'Nama minimal 2 karakter' }, { status: 400 });
        }

        if (phone !== undefined && phone !== '' && !/^[0-9+\-\s()]{8,15}$/.test(phone)) {
            return NextResponse.json({ success: false, error: 'Nomor HP tidak valid' }, { status: 400 });
        }

        if (gender !== undefined && gender !== '' && !['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
            return NextResponse.json({ success: false, error: 'Jenis kelamin tidak valid' }, { status: 400 });
        }

        if (bio !== undefined && typeof bio === 'string' && bio.length > 500) {
            return NextResponse.json({ success: false, error: 'Bio maksimal 500 karakter' }, { status: 400 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone || null;
        if (bio !== undefined) updateData.bio = bio || null;
        if (gender !== undefined) updateData.gender = gender || null;
        if (birthDate !== undefined) updateData.birthDate = birthDate || null;

        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                avatar: true,
                phone: true,
                bio: true,
                gender: true,
                birthDate: true,
                createdAt: true
            }
        });

        return NextResponse.json({ success: true, data: user, message: 'Profil berhasil diperbarui' });
    } catch (error) {
        console.error('Profile PUT Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memperbarui profil' }, { status: 500 });
    }
}
