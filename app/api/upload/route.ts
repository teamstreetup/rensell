import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { verifyToken } from '@/lib/jwt';
import path from 'path';
import fs from 'fs/promises';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB limit

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/x-png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif',
  '.svg',
]);

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Please log in first' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid or expired session. Please log in again.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string' || !file.name) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const extension = path.extname(file.name || '').toLowerCase();
    const mimeType = (file.type || '').toLowerCase();
    const isAllowedMime = ALLOWED_MIME_TYPES.has(mimeType);
    const isAllowedExt = ALLOWED_EXTENSIONS.has(extension);

    if (!isAllowedMime && !isAllowedExt) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload a JPG, PNG, WEBP, GIF, or SVG image.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const ext = extension || (mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : '.jpg');
    const rawBase = path.basename(file.name, extension);
    const safeBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'upload';
    const fileName = `${Date.now()}-${safeBase}${ext}`;

    // 1. Attempt Vercel Blob if token is configured
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken && !blobToken.includes('your-vercel-blob')) {
      try {
        const blobPath = `${payload.userId}/${fileName}`;
        const blob = await put(blobPath, file, {
          access: 'public',
          token: blobToken,
        });
        return NextResponse.json({ url: blob.url });
      } catch (blobError) {
        console.warn('Vercel Blob upload failed, using local storage fallback:', blobError);
      }
    }

    // 2. Fallback: Save to local public/uploads directory
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      return NextResponse.json({ url: `/uploads/${fileName}` });
    } catch (fsError) {
      console.error('Local file write error:', fsError);
      throw fsError;
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
