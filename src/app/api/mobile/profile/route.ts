import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileAuthUser } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const user = await getMobileAuthUser(request);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu' }, { status: 401 });
        }

        // Get user order stats
        const [totalOrders, activeOrders, completedOrders] = await Promise.all([
            prisma.order.count({ where: { userId: user.id } }),
            prisma.order.count({
                where: {
                    userId: user.id,
                    status: {
                        in: ['MENUNGGU_PEMBAYARAN', 'MENUNGGU_VERIFIKASI', 'ANTRIAN_PRODUKSI', 'SEDANG_DICETAK', 'FINISHING', 'SIAP_DIAMBIL']
                    }
                }
            }),
            prisma.order.count({ where: { userId: user.id, status: 'SELESAI' } })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                user,
                stats: {
                    totalOrders,
                    activeOrders,
                    completedOrders
                }
            }
        });
    } catch (error) {
        console.error('Mobile Profile GET Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memuat profil pengguna' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getMobileAuthUser(request);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, address, bio } = body;

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: name ? name.trim() : user.name,
                phone: phone !== undefined ? (phone ? phone.trim() : null) : user.phone,
                bio: (address || bio) !== undefined ? ((address || bio) ? (address || bio).trim() : null) : user.bio
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                bio: true,
                avatar: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Profil berhasil diperbarui',
            data: updated
        });
    } catch (error) {
        console.error('Mobile Profile PUT Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memperbarui profil' }, { status: 500 });
    }
}
