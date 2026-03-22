import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [notesCount, imagesCount, recentNotes, recentImages] = await Promise.all([
    prisma.note.count({ where: { userId: session.userId } }),
    prisma.image.count({ where: { userId: session.userId } }),
    prisma.note.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    }),
    prisma.image.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ]);

  const hour = new Date().getHours();
  let greeting = '';
  let greetingEmoji = '';
  if (hour >= 5 && hour < 12) { greeting = 'Bonjour'; greetingEmoji = '🌅'; }
  else if (hour >= 12 && hour < 18) { greeting = 'Bon après-midi'; greetingEmoji = '☀️'; }
  else if (hour >= 18 && hour < 22) { greeting = 'Bonsoir'; greetingEmoji = '🌆'; }
  else { greeting = 'Bonne nuit'; greetingEmoji = '🌙'; }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{greetingEmoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {greeting}, <span className="text-amber-500">{session.name}</span> !
            </h1>
            <p className="text-slate-500 mt-0.5">
              Bienvenue sur votre espace personnel Duc Panel 🦆
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link href="/dashboard/notes" className="card p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Notes</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{notesCount}</p>
              <p className="text-sm text-slate-400 mt-1">notes enregistrées</p>
            </div>
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/cloud" className="card p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Images</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{imagesCount}</p>
              <p className="text-sm text-slate-400 mt-1">fichiers uploadés</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <span className="text-2xl">☁️</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Notes récentes</h2>
            <Link href="/dashboard/notes" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              Voir tout →
            </Link>
          </div>
          {recentNotes.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-3xl block mb-2">📝</span>
              Aucune note pour l&apos;instant
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note.id} className="p-3 bg-slate-50 rounded-lg hover:bg-amber-50 transition-colors">
                  <p className="font-medium text-slate-800 text-sm truncate">{note.title}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{note.content}</p>
                  <p className="text-xs text-slate-300 mt-1">{formatDate(note.updatedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Images récentes</h2>
            <Link href="/dashboard/cloud" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              Voir tout →
            </Link>
          </div>
          {recentImages.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-3xl block mb-2">☁️</span>
              Aucune image uploadée
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {recentImages.map((image) => (
                <div key={image.id} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={`/api/images/public/${image.publicId}`}
                    alt={image.originalName}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-slate-300 text-sm">
        <span>🦆 Duc Panel — Fait avec ❤️ pour Jean</span>
      </div>
    </div>
  );
}
