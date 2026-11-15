import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Neon S3 client configuration
const getS3Client = () => {
    const endpoint = process.env.AWS_ENDPOINT_URL_S3;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'ap-southeast-1';

    if (!endpoint || !accessKeyId || !secretAccessKey) {
        return null;
    }

    return new S3Client({
        region,
        endpoint,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
        forcePathStyle: true, // Required for Neon S3
    });
};

export interface UploadResult {
    url: string;
    filename: string;
    size: number;
    type: string;
}

/**
 * Upload a single file to Neon Object Storage with fallback to Base64 or local disk
 */
export async function uploadFileToStorage(file: File, folder = 'designs'): Promise<UploadResult> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique safe filename
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${cleanName}`;
    const objectKey = `${folder}/${filename}`;

    const s3 = getS3Client();
    const bucket = process.env.NEON_STORAGE_BUCKET || 'printwere-uploads';

    if (s3) {
        try {
            await s3.send(
                new PutObjectCommand({
                    Bucket: bucket,
                    Key: objectKey,
                    Body: buffer,
                    ContentType: file.type || 'application/octet-stream',
                })
            );

            // Construct public read URL
            const endpoint = process.env.AWS_ENDPOINT_URL_S3!.replace(/\/$/, '');
            const publicUrl = `${endpoint}/${bucket}/${objectKey}`;

            return {
                url: publicUrl,
                filename: file.name,
                size: file.size,
                type: file.type,
            };
        } catch (s3Error) {
            console.error('S3 upload error, trying fallback:', s3Error);
        }
    }

    // Serverless (Vercel) fallback without S3: Base64 Data URL
    // This guarantees images and documents upload without read-only filesystem errors
    const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
    if (isVercel || !process.cwd()) {
        const mime = file.type || 'image/jpeg';
        const base64Data = buffer.toString('base64');
        const dataUrl = `data:${mime};base64,${base64Data}`;
        return {
            url: dataUrl,
            filename: file.name,
            size: file.size,
            type: file.type,
        };
    }

    // Local development fallback to public/uploads
    try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        const localUrl = `/uploads/${folder}/${filename}`;
        return {
            url: localUrl,
            filename: file.name,
            size: file.size,
            type: file.type,
        };
    } catch {
        // Ultimate fallback to Data URL
        const mime = file.type || 'image/jpeg';
        const base64Data = buffer.toString('base64');
        return {
            url: `data:${mime};base64,${base64Data}`,
            filename: file.name,
            size: file.size,
            type: file.type,
        };
    }
}
