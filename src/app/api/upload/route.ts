import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';


// If uuid is not installed, we can use crypto.randomUUID() if environment supports it, 
// or just install uuid. Since I didn't install uuid, I'll use crypto.randomUUID() if available, 
// or a simple fallback. Actually, let's use crypto.randomUUID() which is standard in Node 20.

const ALLOWED_MIME_TYPES: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
};

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const fileType = searchParams.get('fileType');

        if (!fileType) {
            return NextResponse.json({ error: 'File type is required' }, { status: 400 });
        }

        // Strict validation
        const extension = ALLOWED_MIME_TYPES[fileType];
        if (!extension) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed.' }, { status: 400 });
        }

        const fileName = `${crypto.randomUUID()}-${Date.now()}.${extension}`;
        const objectKey = `uploads/${session.user.id}/${fileName}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: objectKey,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
        const fileUrl = `${R2_PUBLIC_URL}/${objectKey}`;

        return NextResponse.json({ uploadUrl, fileUrl });
    } catch (error) {
        console.error('Error generating upload URL:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
