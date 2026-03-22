import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getUploadDir } from '@/lib/server-utils';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const images = await prisma.image.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(images);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Images uniquement' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB)' }, { status: 400 });
    }

    const uploadDir = getUploadDir();
    const publicId = uuidv4();
    const ext = path.extname(file.name) || '.jpg';
    const filename = `${publicId}${ext}`;
    const filepath = path.join(uploadDir, filename);
    const extRegex = new RegExp(`\\${ext}$`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      const sharp = (await import('sharp')).default;
      const optimized = await sharp(buffer)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      const jpegFilepath = filepath.replace(extRegex, '.jpg');
      await writeFile(jpegFilepath, optimized);
      
      const image = await prisma.image.create({
        data: {
          filename: filename.replace(extRegex, '.jpg'),
          originalName: file.name,
          mimeType: 'image/jpeg',
          size: optimized.length,
          publicId,
          path: jpegFilepath,
          userId: session.userId,
        },
      });
      return NextResponse.json(image, { status: 201 });
    } catch {
      await writeFile(filepath, buffer);
      const image = await prisma.image.create({
        data: {
          filename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          publicId,
          path: filepath,
          userId: session.userId,
        },
      });
      return NextResponse.json(image, { status: 201 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 });
  }
}
