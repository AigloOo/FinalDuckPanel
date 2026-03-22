'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');

  const fetchNotes = useCallback(async () => {
    const res = await fetch('/api/notes');
    const data = await res.json();
    setNotes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsNew(false);
  };

  const newNote = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setIsNew(true);
  };

  const saveNote = async () => {
    if (!title.trim()) return;
    setSaving(true);

    if (isNew) {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const created = await res.json();
      setNotes([created, ...notes]);
      setSelectedNote(created);
      setIsNew(false);
    } else if (selectedNote) {
      const res = await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const updated = await res.json();
      setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
      setSelectedNote(updated);
    }

    setSaving(false);
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Supprimer cette note ?')) return;
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    setNotes(notes.filter((n) => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setTitle('');
      setContent('');
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full">
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-slate-800">📝 Notes</h1>
            <button onClick={newNote} className="btn-primary px-3 py-1.5 text-sm">
              + Nouvelle
            </button>
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input text-sm"
          />
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-400">Chargement...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <span className="text-3xl block mb-2">📝</span>
              <p className="text-sm">Aucune note</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => selectNote(note)}
                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-amber-50 transition-colors ${
                  selectedNote?.id === note.id ? 'bg-amber-50 border-l-2 border-l-amber-400' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{note.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{note.content}</p>
                    <p className="text-xs text-slate-300 mt-1">{formatDate(note.updatedAt)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {isNew || selectedNote ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la note..."
                className="flex-1 text-lg font-semibold border-none outline-none bg-transparent text-slate-900 placeholder:text-slate-300"
              />
              <button
                onClick={saveNote}
                disabled={saving || !title.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrivez votre note ici..."
              className="flex-1 p-6 resize-none outline-none bg-white text-slate-700 text-base leading-relaxed"
            />
            {selectedNote && (
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
                Créée le {formatDate(selectedNote.createdAt)} · Modifiée le {formatDate(selectedNote.updatedAt)}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center text-slate-400">
              <span className="text-5xl block mb-3">📝</span>
              <p className="text-lg font-medium text-slate-600">Sélectionnez une note</p>
              <p className="text-sm mt-1">ou créez-en une nouvelle</p>
              <button onClick={newNote} className="btn-primary mt-4 mx-auto">
                + Nouvelle note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
