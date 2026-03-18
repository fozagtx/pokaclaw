'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useBalance } from '@luno-kit/react';
import { Header } from '@/components/layout/header';
import { MetricsDisplay } from '@/components/dashboard/metrics-display';
import { SimulationPanel } from '@/components/dashboard/simulation-panel';
import { TransactionList } from '@/components/dashboard/transaction-list';
import { ChainStatus } from '@/components/dashboard/chain-status';
import type { SimulationResult, BatchSimulationResult } from '@/lib/polkadot-agent/types';

export default function DashboardPage() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address: address ?? '' });

  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleRun = useCallback(async (count: number, parallel: boolean) => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    setError(null);

    // Build real extrinsics, use connected address as both sender/receiver for dry-run
    const dest = address ?? '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const extrinsics = Array.from({ length: count }, () => ({
      pallet: 'balances',
      method: 'transferKeepAlive',
      args: [dest, '1000000000'],
    }));

    setProgress(10);

    try {
      const res = await fetch('/api/chain/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extrinsics, parallel }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed with status ${res.status}`);
      }

      const batch = data as BatchSimulationResult;
      setResults(batch.results);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setIsRunning(false);
    }
  }, [address]);

  const totalExtrinsics = results.length;
  const successRate = totalExtrinsics > 0
    ? (results.filter((r) => r.success).length / totalExtrinsics) * 100
    : 0;
  const avgWeight = totalExtrinsics > 0
    ? Math.round(results.reduce((s, r) => s + r.weight.refTime, 0) / totalExtrinsics)
    : 0;

  return (
    <div className="min-h-screen">
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[1700px] mx-auto px-6 py-12"
      >
        <p className="text-[13px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] mb-4">
          Dashboard
        </p>
        <h1 className="text-[56px] font-bold uppercase leading-[64px] mb-10">
          PokaClaw Dashboard
        </h1>

        <div className="space-y-6">
          {/* Wallet info from LunoKit */}
          {address && (
            <div className="bg-[var(--surface-1)] rounded-[30px] p-10 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] mb-1">
                  Connected Wallet
                </p>
                <p className="text-sm font-mono text-[var(--text)] break-all">{address}</p>
              </div>
              {balance && (
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] mb-1">
                    Transferable
                  </p>
                  <p className="text-[28px] font-bold text-[var(--yo-yellow)]">
                    {balance.formattedTransferable}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Simulation metrics */}
          <MetricsDisplay
            totalExtrinsics={totalExtrinsics}
            successRate={successRate}
            avgWeight={avgWeight}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[16px] p-5 text-red-400">
              {error}
            </div>
          )}

          {/* Simulation panel + results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimulationPanel
              onRun={handleRun}
              isRunning={isRunning}
              progress={progress}
            />
            <TransactionList results={results} />
          </div>

          {/* Chain status */}
          <ChainStatus />
        </div>
      </motion.div>
    </div>
  );
}
