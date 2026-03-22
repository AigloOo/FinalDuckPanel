import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const image = await prisma.image.findFirst({
    where: { id: params.id, userId: session.userId },
  });
  if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await unlink(image.path);
  } catch {
    console.warn('File not found:', image.path);
  }

  await prisma.image.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
