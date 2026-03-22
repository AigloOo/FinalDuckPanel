'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { getTimeParts } from '@/lib/utils';

interface SidebarProps {
  userName: string;
}

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', emoji: '🏠' },
  { href: '/dashboard/notes', label: 'Notes', emoji: '📝' },
  { href: '/dashboard/cloud', label: 'Mini Cloud', emoji: '☁️' },
];

export default function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const { label: timeLabel } = getTimeParts();

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-xl">🦆</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-none">Duc Panel</h1>
            <p className="text-xs text-slate-400 mt-0.5">Dashboard perso</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 mx-3 mt-3 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-xs text-amber-600 font-medium">{timeLabel} 👋</p>
        <p className="text-sm font-semibold text-amber-800">{userName}</p>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              {item.label}
              {isActive && <span className="ml-auto w-1.5 h-1.5 bg-amber-500 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{userName}</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span>🚪</span>
          {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
        </button>
      </div>
    </aside>
  );
}
