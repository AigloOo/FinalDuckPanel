import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content } = await request.json();
  
  const note = await prisma.note.findFirst({
    where: { id: params.id, userId: session.userId },
  });
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.note.update({
    where: { id: params.id },
    data: { title: title?.trim() || note.title, content: content ?? note.content },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const note = await prisma.note.findFirst({
    where: { id: params.id, userId: session.userId },
  });
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.note.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
