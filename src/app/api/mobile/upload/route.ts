import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getMobileAuthUser } from '@/lib/mobile-auth';

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

        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `mobile_${timestamp}_${originalName}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'mobile');
        await mkdir(uploadDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/mobile/${filename}`;

        return NextResponse.json({
            success: true,
            fileUrl,
            url: fileUrl,
            data: {
                url: fileUrl,
                fileUrl,
                filename: file.name,
                size: file.size
            }
        });
    } catch (error) {
        console.error('Mobile Upload Error:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengunggah file' }, { status: 500 });
    }
}
