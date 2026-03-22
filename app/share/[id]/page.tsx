import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatDate, formatBytes } from '@/lib/utils';

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await prisma.image.findUnique({
    where: { publicId: id },
  });

  if (!image) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-amber-200">
            <span className="text-xl">🦆</span>
            <span className="font-semibold text-slate-700">Duc Panel</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-slate-100 flex items-center justify-center min-h-64">
            <img
              src={`/api/images/public/${image.publicId}`}
              alt={image.originalName}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
          <div className="p-5">
            <h1 className="font-semibold text-slate-800 text-lg mb-1 truncate">
              {image.originalName}
            </h1>
            <p className="text-sm text-slate-400">
              {formatBytes(image.size)} · Partagé le {formatDate(image.createdAt)}
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href={`/api/images/public/${image.publicId}`}
                download={image.originalName}
                className="btn-primary text-sm"
              >
                ⬇️ Télécharger
              </a>
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-4">
          Partagé via <span className="font-medium">Duc Panel</span> 🦆
        </p>
      </div>
    </div>
  );
}
