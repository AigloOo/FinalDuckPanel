'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatDate, formatBytes } from '@/lib/utils';

interface Image {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  publicId: string;
  createdAt: string;
}

export default function CloudPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async () => {
    const res = await fetch('/api/images');
    const data = await res.json();
    setImages(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/images', { method: 'POST', body: formData });
      if (res.ok) {
        const newImage = await res.json();
        setImages((prev) => [newImage, ...prev]);
      }
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const deleteImage = async (id: string) => {
    if (!confirm('Supprimer cette image ?')) return;
    await fetch(`/api/images/${id}`, { method: 'DELETE' });
    setImages(images.filter((i) => i.id !== id));
    if (selectedImage?.id === id) setSelectedImage(null);
  };

  const copyLink = async (publicId: string, type: 'public' | 'private') => {
    const url =
      type === 'public'
        ? `${window.location.origin}/share/${publicId}`
        : `${window.location.origin}/api/images/public/${publicId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(`${type}-${publicId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">☁️ Mini Cloud</h1>
          <p className="text-slate-500 text-sm mt-1">{images.length} image{images.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
          ⬆️ Uploader
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6 ${
          dragOver
            ? 'border-amber-400 bg-amber-50'
            : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
        }`}
      >
        {uploading ? (
          <div className="text-slate-600">
            <div className="animate-spin text-3xl mb-2">🔄</div>
            <p className="font-medium">Upload en cours...</p>
          </div>
        ) : (
          <div className="text-slate-400">
            <span className="text-4xl block mb-2">📤</span>
            <p className="font-medium text-slate-600">Glissez vos images ici</p>
            <p className="text-sm mt-1">ou cliquez pour sélectionner</p>
            <p className="text-xs mt-2 text-slate-300">PNG, JPG, GIF, WebP acceptés</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Chargement...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <span className="text-5xl block mb-3">🖼️</span>
          <p className="text-lg font-medium text-slate-600">Aucune image</p>
          <p className="text-sm mt-1">Commencez par uploader une image</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative card overflow-hidden cursor-pointer hover:shadow-md transition-all"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-square">
                <img
                  src={`/api/images/public/${image.publicId}`}
                  alt={image.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyLink(image.publicId, 'public'); }}
                    className="bg-white text-slate-700 p-2 rounded-lg text-xs hover:bg-amber-400 transition-colors"
                    title="Copier lien public"
                  >
                    {copiedId === `public-${image.publicId}` ? '✅' : '🔗'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteImage(image.id); }}
                    className="bg-white text-red-500 p-2 rounded-lg text-xs hover:bg-red-100 transition-colors"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={`/api/images/public/${selectedImage.publicId}`}
                alt={selectedImage.originalName}
                className="w-full rounded-t-2xl max-h-[60vh] object-contain bg-slate-100"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-slate-800 truncate mb-1">{selectedImage.originalName}</h3>
              <p className="text-sm text-slate-400 mb-4">
                {formatBytes(selectedImage.size)} · {formatDate(selectedImage.createdAt)}
              </p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => copyLink(selectedImage.publicId, 'public')}
                    className="btn-primary flex-1 justify-center text-sm"
                  >
                    {copiedId === `public-${selectedImage.publicId}` ? '✅ Copié !' : '🔗 Lien public'}
                  </button>
                  <button
                    onClick={() => copyLink(selectedImage.publicId, 'private')}
                    className="btn-secondary flex-1 justify-center text-sm"
                  >
                    {copiedId === `private-${selectedImage.publicId}` ? '✅ Copié !' : '🔒 Lien direct'}
                  </button>
                </div>
                <button
                  onClick={() => { deleteImage(selectedImage.id); setSelectedImage(null); }}
                  className="btn-danger w-full justify-center"
                >
                  🗑️ Supprimer l&apos;image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
