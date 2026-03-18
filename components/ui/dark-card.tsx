import type { ReactNode } from 'react';

interface DarkCardProps {
  children: ReactNode;
  className?: string;
}

export function DarkCard({ children, className = '' }: DarkCardProps) {
  return (
    <div className={`bg-[var(--surface-1)] rounded-[30px] p-10 ${className}`}>
      {children}
    </div>
  );
}
