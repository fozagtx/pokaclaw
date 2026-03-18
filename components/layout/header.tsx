'use client';

import Link from 'next/link';
import { ConnectButton } from '@luno-kit/ui';
import { LiveIndicator } from '@/components/ui/live-indicator';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/agent', label: 'AI Agent' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1700px] mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-[13px] font-bold uppercase tracking-[1.2px] text-[var(--yo-yellow)]">
            PokaClaw
          </Link>
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <LiveIndicator />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
