'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/agent', label: 'AI Agent' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2">
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-[12px] px-3.5 py-2 text-xs font-bold uppercase transition-colors ${
              isActive
                ? 'bg-[var(--yo-yellow)] text-black'
                : 'bg-[var(--surface-2)] text-[var(--text)] hover:opacity-80'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
