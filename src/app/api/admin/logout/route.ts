
import { NextResponse } from 'next/server';
import { signOut } from '@/auth';

// POST /api/admin/logout - Logout admin
export async function POST() {
    try {
        // NextAuth v5 handles session clearing automatically
        // This endpoint can be used for custom logout logic if needed

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully',
            redirectTo: '/login'
        });

    } catch (error) {
        console.error('Admin Logout Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to logout' }, { status: 500 });
    }
}
