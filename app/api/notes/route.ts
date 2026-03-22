import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(notes);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: { title: title.trim(), content: content || '', userId: session.userId },
  });

  return NextResponse.json(note, { status: 201 });
}
