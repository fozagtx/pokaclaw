'use client';

import { useState } from 'react';
import { ProgressBar } from '@/components/ui/progress-bar';

interface SimulationPanelProps {
  onRun?: (count: number, parallel: boolean) => void;
  isRunning?: boolean;
  progress?: number;
}

export function SimulationPanel({ onRun, isRunning = false, progress = 0 }: SimulationPanelProps) {
  const [count, setCount] = useState(5);
  const [parallel, setParallel] = useState(false);

  return (
    <div className="bg-[var(--surface-1)] rounded-[30px] p-10">
      <h3 className="text-[28px] font-bold uppercase leading-[36px] mb-6">
        Simulation
      </h3>

      <div className="space-y-6">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] block mb-2">
            Extrinsic Count
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full bg-[var(--surface-2)] rounded-[12px] px-4 py-3 text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--yo-yellow)]/50"
          />
        </div>

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

        {isRunning && (
          <div>
            <ProgressBar percent={progress} />
            <p className="text-xs text-[var(--muted)] mt-2">
              Running simulation... {Math.round(progress)}%
            </p>
          </div>
        )}

        <button
          onClick={() => onRun?.(count, parallel)}
          disabled={isRunning}
          className="w-full bg-[var(--yo-yellow)] text-black rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.96px] hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Simulation'}
        </button>
      </div>
    </div>
  );
}
