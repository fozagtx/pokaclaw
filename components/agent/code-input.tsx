'use client';

import { useState } from 'react';

interface CodeInputProps {
  onSubmit: (code: string) => void;
  isLoading?: boolean;
}

export function CodeInput({ onSubmit, isLoading = false }: CodeInputProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isLoading) return;
    onSubmit(code.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] block mb-2">
          ink! / Substrate Code
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`// Paste your ink! contract or Substrate pallet code here\n#[ink::contract]\nmod my_contract {\n    // ...\n}`}
          className="w-full h-64 bg-[var(--surface-2)] rounded-[16px] px-5 py-4 text-[var(--text)] font-mono text-sm outline-none focus:ring-2 focus:ring-[var(--yo-yellow)]/50 placeholder:text-[var(--muted)] resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !code.trim()}
        className="w-full bg-[var(--yo-yellow)] text-black rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.96px] hover:opacity-80 transition-opacity disabled:opacity-50"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Code'}
      </button>
    </form>
  );
}
