'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, LogOut, Menu, X } from 'lucide-react';
import { errorText, request } from './api';

const navigation = [
  ['Dashboard', '/admin'],
  ['Profile', '/admin/profile'],
  ['Experience', '/admin/experience'],
  ['Skills', '/admin/skills'],
  ['Projects', '/admin/projects'],
  ['Case studies', '/admin/case-studies'],
  ['Blog posts', '/admin/blog'],
  ['Categories', '/admin/categories'],
  ['Tags', '/admin/tags'],
  ['Media library', '/admin/media'],
  ['Messages', '/admin/messages'],
  ['Settings', '/admin/settings'],
  ['Security', '/admin/security'],
];

export default function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function logout() {
    setPending(true);
    setError('');
    try {
      await request('/admin/auth/logout', { method: 'POST' });
      client.clear();
      router.replace('/admin/login');
      router.refresh();
    } catch (failure) {
      setError(errorText(failure));
      setPending(false);
    }
  }
  return (
    <div className="admin-frame">
      <aside id="admin-navigation" className={`admin-sidebar ${open ? 'is-open' : ''}`} aria-label="Admin navigation">
        <Link className="admin-brand" href="/admin">
          <span>&lt;/&gt;</span> YI SIVLAY
          <span className="admin-dot" />
        </Link>
        <p className="admin-eyebrow">{'// ADMIN_CONSOLE'}</p>
        <nav>
          {navigation.map(([label, href], index) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={
                path === href || (href !== '/admin' && path.startsWith(`${href}/`)) ? 'active' : ''
              }
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank">
            View public site <ArrowUpRight size={14} />
          </Link>
          <span>SESSION / AUTHENTICATED</span>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu"
            aria-controls="admin-navigation"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <span className="admin-dot" /> CONTROL PLANE{' '}
            <span className="admin-muted">/ {path.replace('/admin', '') || 'overview'}</span>
          </div>
          <div className="admin-user">
            <span>{username}</span>
            <button onClick={logout} disabled={pending} aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </header>
        {error && (
          <div className="admin-alert error" role="alert">
            {error}
          </div>
        )}
        <main className="admin-content" id="admin-content">
          {children}
        </main>
        <footer className="admin-footer">
          <span>ISL // CONTENT MANAGEMENT</span>
          <span>Changes are persisted to your database.</span>
        </footer>
      </div>
    </div>
  );
}
