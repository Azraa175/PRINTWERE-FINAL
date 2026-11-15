import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFileToStorage, UploadResult } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const session = await auth();
        // Allow authenticated users or guests submitting order checkout files
        const formData = await request.formData();

        // Extract files from formData (supports 'files', 'file', or multiple keys)
        const rawFiles: File[] = [];
        for (const [key, value] of formData.entries()) {
            if (value instanceof File && value.size > 0) {
                rawFiles.push(value);
            }
        }

        if (rawFiles.length === 0) {
            return NextResponse.json({ success: false, error: 'Tidak ada berkas yang dikirim' }, { status: 400 });
        }

        // Validate types and sizes
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
        ];

        const uploadResults: UploadResult[] = [];

        for (const file of rawFiles) {
            // Check size (max 15MB)
            if (file.size > 15 * 1024 * 1024) {
                return NextResponse.json({
                    success: false,
                    error: `Berkas "${file.name}" terlalu besar. Maksimal 15MB.`,
                }, { status: 400 });
            }

            // Check mime type (or extension fallback)
            const ext = file.name.split('.').pop()?.toLowerCase();
            const isValidExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'svg'].includes(ext || '');
            if (!allowedTypes.includes(file.type) && !isValidExt) {
                return NextResponse.json({
                    success: false,
                    error: `Format berkas "${file.name}" tidak didukung. Format yang diizinkan: JPG, PNG, WEBP, PDF.`,
                }, { status: 400 });
            }

            const result = await uploadFileToStorage(file, 'designs');
            uploadResults.push(result);
        }

        const urls = uploadResults.map(r => r.url);
        const primaryUrl = urls.join(',');

        return NextResponse.json({
            success: true,
            fileUrl: primaryUrl,
            url: uploadResults[0]?.url || '',
            urls: urls,
            files: uploadResults,
            data: {
                urls,
                files: uploadResults,
                url: uploadResults[0]?.url || '',
                fileUrl: primaryUrl,
            },
        });
    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({
            success: false,
            error: 'Gagal mengunggah berkas. Silakan coba kembali.',
        }, { status: 500 });
    }
}
