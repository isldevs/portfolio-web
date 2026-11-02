import Link from 'next/link';
import { ArrowUpRight, Code2, GitBranch } from 'lucide-react';
import { Nav } from '@/components/public/nav';
export const dynamic = 'force-dynamic';
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="site-shell">
        <header className="site-header">
          <Link href="/" className="wordmark">
            <Code2 size={25} />
            <span>
              YI SIVLAY
              <small>
                SENIOR BACKEND DEVELOPER <i />
              </small>
            </span>
          </Link>
          <Nav />
        </header>
        <main id="main-content">{children}</main>
        <footer className="site-footer">
          <div className="footer-signature">
            <Code2 size={19} />
            <span>
              YI SIVLAY<span className="muted"> / ENGINEERED WITH INTENTION</span>
            </span>
          </div>
          <div>
            <Link href="/case-studies">Case studies</Link>
            <Link href="/resume">Résumé</Link>
            <a href="https://github.com/isldevs" target="_blank" rel="noopener noreferrer">
              <GitBranch size={14} /> GitHub <ArrowUpRight size={12} />
            </a>
            <Link href="/admin/login" prefetch={false}>
              Admin login
            </Link>
          </div>
          <small>© {new Date().getUTCFullYear()} Yi Sivlay. All systems considered.</small>
        </footer>
      </div>
    </>
  );
}
