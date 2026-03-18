'use client';

import { useState } from 'react';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { SubstrateExtrinsic } from '@/lib/polkadot-agent/types';

interface SimulationPanelProps {
  onRun?: (extrinsics: SubstrateExtrinsic[], parallel: boolean) => void;
  isRunning?: boolean;
  progress?: number;
}

interface ExtrinsicEntry {
  id: string;
  pallet: string;
  method: string;
  args: string;
}

function createEntry(): ExtrinsicEntry {
  return { id: crypto.randomUUID(), pallet: '', method: '', args: '' };
}

export function SimulationPanel({ onRun, isRunning = false, progress = 0 }: SimulationPanelProps) {
  const [parallel, setParallel] = useState(false);
  const [entries, setEntries] = useState<ExtrinsicEntry[]>([createEntry()]);
  const [parseError, setParseError] = useState<string | null>(null);

  const updateEntry = (id: string, field: keyof ExtrinsicEntry, value: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    setParseError(null);
  };

  const addEntry = () => setEntries((prev) => [...prev, createEntry()]);

  const removeEntry = (id: string) => {
    if (entries.length > 1) setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleRun = () => {
    const extrinsics: SubstrateExtrinsic[] = [];

    for (const entry of entries) {
      if (!entry.pallet.trim() || !entry.method.trim()) {
        setParseError('Each extrinsic needs a pallet and method.');
        return;
      }

      let args: unknown[] = [];
      if (entry.args.trim()) {
        try {
          const parsed = JSON.parse(entry.args.trim());
          args = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          setParseError(`Invalid JSON args for ${entry.pallet}.${entry.method}`);
          return;
        }
      }

      extrinsics.push({ pallet: entry.pallet.trim(), method: entry.method.trim(), args });
    }

    setParseError(null);
    onRun?.(extrinsics, parallel);
  };

  return (
    <div className="bg-[var(--surface-1)] rounded-[30px] p-10">
      <h3 className="text-[28px] font-bold uppercase leading-[36px] mb-6">
        Simulation
      </h3>

      <div className="space-y-4">
        {entries.map((entry, i) => (
          <div key={entry.id} className="bg-[var(--surface-2)] rounded-[16px] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
                Extrinsic #{i + 1}
              </span>
              {entries.length > 1 && (
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--muted)] block mb-1">
                  Pallet
                </label>
                <input
                  type="text"
                  placeholder="balances"
                  value={entry.pallet}
                  onChange={(e) => updateEntry(entry.id, 'pallet', e.target.value)}
                  className="w-full bg-[var(--surface-1)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--yo-yellow)]/50 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--muted)] block mb-1">
                  Method
                </label>
                <input
                  type="text"
                  placeholder="transferKeepAlive"
                  value={entry.method}
                  onChange={(e) => updateEntry(entry.id, 'method', e.target.value)}
                  className="w-full bg-[var(--surface-1)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--yo-yellow)]/50 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--muted)] block mb-1">
                Args (JSON array)
              </label>
              <input
                type="text"
                placeholder='["5Grw...", "1000000000"]'
                value={entry.args}
                onChange={(e) => updateEntry(entry.id, 'args', e.target.value)}
                className="w-full bg-[var(--surface-1)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--yo-yellow)]/50 font-mono"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addEntry}
          className="w-full bg-[var(--surface-2)] rounded-[12px] px-3.5 py-2.5 text-xs font-bold uppercase text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          + Add Extrinsic
        </button>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] block mb-2">
            Execution Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setParallel(false)}
              className={`rounded-[12px] px-3.5 py-2 text-xs font-bold uppercase ${
                !parallel
                  ? 'bg-[var(--yo-yellow)] text-black'
                  : 'bg-[var(--surface-2)] text-[var(--text)]'
              }`}
            >
              Sequential
            </button>
            <button
              onClick={() => setParallel(true)}
              className={`rounded-[12px] px-3.5 py-2 text-xs font-bold uppercase ${
                parallel
                  ? 'bg-[var(--yo-yellow)] text-black'
                  : 'bg-[var(--surface-2)] text-[var(--text)]'
              }`}
            >
              Parallel
            </button>
          </div>
        </div>

        {parseError && (
          <p className="text-xs text-red-400">{parseError}</p>
        )}

        {isRunning && (
          <div>
            <ProgressBar percent={progress} />
            <p className="text-xs text-[var(--muted)] mt-2">
              Running simulation... {Math.round(progress)}%
            </p>
          </div>
        )}

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="w-full bg-[var(--yo-yellow)] text-black rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.96px] hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Simulation'}
        </button>
      </div>
    </div>
  );
}
