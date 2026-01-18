
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// PATCH /api/admin/users/[id]/ban - Ban user
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Cannot ban admin users
        if (user.role === 'ADMIN') {
            return NextResponse.json({
                success: false,
                error: 'Cannot ban admin users'
            }, { status: 400 });
        }

        // Already banned
        if (user.status === 'BANNED') {
            return NextResponse.json({
                success: false,
                error: 'User is already banned'
            }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { status: 'BANNED' }
        });

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: `User ${user.name} has been banned`
        });

    } catch (error) {
        console.error('Admin User Ban Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to ban user' }, { status: 500 });
    }
}
