'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
const links = [
  ['01', 'Home', '/'],
  ['02', 'About', '/about'],
  ['03', 'Projects', '/projects'],
  ['04', 'Blog', '/blog'],
  ['05', 'Contact', '/contact'],
];
export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        aria-label="Toggle navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav
        id="main-nav"
        className={`main-nav ${open ? 'nav-open' : ''}`}
        aria-label="Main navigation"
      >
        {links.map(([n, name, url]) => (
          <Link
            key={url}
            href={url}
            className={(url === '/' ? path === '/' : path.startsWith(url)) ? 'active' : ''}
            onClick={() => setOpen(false)}
          >
            <small>{n}_</small>
            {name.toUpperCase()}
          </Link>
        ))}
      </nav>
    </>
  );
}
