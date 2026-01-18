
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// PATCH /api/admin/users/[id]/unban - Unban user
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

        // Not banned
        if (user.status !== 'BANNED') {
            return NextResponse.json({
                success: false,
                error: 'User is not banned'
            }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { status: 'ACTIVE' }
        });

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: `User ${user.name} has been unbanned`
        });

    } catch (error) {
        console.error('Admin User Unban Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to unban user' }, { status: 500 });
    }
}
