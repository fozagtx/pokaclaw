'use client';

import { useEffect, useState } from 'react';
import { LiveIndicator } from '@/components/ui/live-indicator';
import type { ChainInfo } from '@/lib/polkadot-agent/types';

export function ChainStatus() {
  const [info, setInfo] = useState<ChainInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/chain/info')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        return data;
      })
      .then((data) => setInfo(data))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[var(--surface-1)] rounded-[30px] p-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[28px] font-bold uppercase leading-[36px]">
          Chain Status
        </h3>
        {info?.connected && <LiveIndicator label="Connected" />}
      </div>

      {loading ? (
        <p className="text-[var(--muted)]">Connecting to chain...</p>
      ) : info ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--surface-2)] rounded-[16px] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
              Chain
            </p>
            <p className="text-base font-bold mt-1">{info.chain}</p>
          </div>
          <div className="bg-[var(--surface-2)] rounded-[16px] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
              Block
            </p>
            <p className="text-base font-bold text-[var(--yo-yellow)] mt-1">
              #{info.blockNumber.toLocaleString()}
            </p>
          </div>
          <div className="bg-[var(--surface-2)] rounded-[16px] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
              Era
            </p>
            <p className="text-base font-bold mt-1">{info.era}</p>
          </div>
          <div className="bg-[var(--surface-2)] rounded-[16px] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
              Node
            </p>
            <p className="text-base font-bold mt-1">{info.nodeName} v{info.nodeVersion}</p>
          </div>
        </div>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <p className="text-[var(--muted)]">No chain data available.</p>
      )}
    </div>
  );
}
