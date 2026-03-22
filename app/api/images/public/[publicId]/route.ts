import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { publicId: string } }) {
  const image = await prisma.image.findUnique({
    where: { publicId: params.publicId },
  });

  if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const file = await readFile(image.path);
    return new NextResponse(file, {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
