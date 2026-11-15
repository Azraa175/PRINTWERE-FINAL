import { NextResponse } from 'next/server';
import { getMobileAuthUser } from '@/lib/mobile-auth';
import { uploadFileToStorage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const user = await getMobileAuthUser(request);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ success: false, error: 'Tidak ada file yang diunggah' }, { status: 400 });
        }

        const result = await uploadFileToStorage(file, 'mobile');

        return NextResponse.json({
            success: true,
            fileUrl: result.url,
            url: result.url,
            data: {
                url: result.url,
                fileUrl: result.url,
                filename: result.filename,
                size: result.size,
                type: result.type,
            }
        });
    } catch (error) {
        console.error('Mobile Upload Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengunggah file' }, { status: 500 });
    }
}
