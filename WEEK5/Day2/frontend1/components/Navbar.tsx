'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import NotificationsBell from '@/components/NotificationsBell';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user } = useAuth() as any;
  const [theme, setTheme] = useState<'dark'|'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem('theme') as 'dark'|'light') || 'dark';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand" style={{ fontSize: 18 }}>
          <span className="text-gradient">★ Aurora</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-muted btn-sm"
            aria-label="Toggle theme"
            onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <NotificationsBell />
          {user ? (() => {
            const uid = (user as any)._id || (user as any).id;
            return (
            <Link href={`/profile/${uid}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <img
                src={(user as any).avatarUrl || `https://api.multiavatar.com/${uid}.svg`}
                alt="avatar"
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  const name = encodeURIComponent((user as any).name || 'User');
                  target.src = `https://ui-avatars.com/api/?name=${name}&background=random&size=64&format=svg`;
                }}
              />
              <span style={{ fontSize: 14 }}>{(user as any).name}</span>
            </Link>
            );
          })() : (
            <Link href="/">{'Login'}</Link>
          )}
        </div>
      </div>
    </header>
  );
}
