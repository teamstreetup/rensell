const path = require('path');
const fs = require('fs/promises');
const { put } = require('@vercel/blob');

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

async function uploadImage(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const extension = path.extname(file.originalname || '').toLowerCase();
    const mimeType = (file.mimetype || '').toLowerCase();
    const isAllowedMime = ALLOWED_MIME_TYPES.has(mimeType);
    const isAllowedExt = ALLOWED_EXTENSIONS.has(extension);

    if (!isAllowedMime && !isAllowedExt) {
      return res.status(400).json({
        error: 'Unsupported file format. Please upload a JPG, PNG, WEBP, GIF, or SVG image.',
      });
    }

    const ext =
      extension ||
      (mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : '.jpg');
    const rawBase = path.basename(file.originalname || 'upload', extension);
    const safeBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'upload';
    const fileName = `${Date.now()}-${safeBase}${ext}`;

    // 1. Attempt Vercel Blob upload when configured
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken && !blobToken.includes('your-vercel-blob')) {
      try {
        const blobPath = `${req.user.userId}/${fileName}`;
        const blob = await put(blobPath, file.buffer, {
          access: 'public',
          token: blobToken,
          contentType: mimeType || 'image/jpeg',
        });
        return res.json({ url: blob.url });
      } catch (blobError) {
        console.warn('Vercel Blob upload failed, falling back to local storage:', blobError.message);
      }
    }

    // 2. Fallback: Save to local backend/uploads directory
    const uploadDir = path.join(__dirname, '..', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, file.buffer);

    return res.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    next(error);
  }
}

module.exports = { uploadImage };
