'use client';

import { motion } from 'framer-motion';
import type { SimulationResult } from '@/lib/polkadot-agent/types';

interface TransactionListProps {
  results: SimulationResult[];
}

export function TransactionList({ results }: TransactionListProps) {
  if (results.length === 0) {
    return (
      <div className="bg-[var(--surface-1)] rounded-[30px] p-10">
        <h3 className="text-[28px] font-bold uppercase leading-[36px] mb-4">
          Results
        </h3>
        <p className="text-[var(--muted)] text-base">
          Run a simulation to see results here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-1)] rounded-[30px] p-10">
      <h3 className="text-[28px] font-bold uppercase leading-[36px] mb-6">
        Results
      </h3>
      <div className="space-y-3">
        {results.map((result, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-[var(--surface-2)] rounded-[16px] p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-bold uppercase tracking-[1.2px]">
                Extrinsic #{i + 1}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  result.success
                    ? 'bg-[rgba(93,255,192,0.12)] text-[var(--card-mint)]'
                    : 'bg-red-500/12 text-red-400'
                }`}
              >
                {result.success ? 'Success' : 'Failed'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
                  Ref Time
                </p>
                <p className="text-base font-bold text-[var(--yo-yellow)]">
                  {result.weight.refTime.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
                  Proof Size
                </p>
                <p className="text-base font-bold text-[var(--text)]">
                  {result.weight.proofSize.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
                  Time
                </p>
                <p className="text-base font-bold text-[var(--card-mint)]">
                  {result.executionTimeMs.toFixed(1)}ms
                </p>
              </div>
            </div>
            {result.error && (
              <p className="text-xs text-red-400 mt-2">{result.error}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
