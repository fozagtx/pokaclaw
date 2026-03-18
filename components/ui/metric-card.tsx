'use client';

import { motion } from 'framer-motion';

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  index?: number;
}

export function MetricCard({ label, value, change, index = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-[var(--surface-1)] rounded-[20px] p-6 border-t-[3px] border-[var(--yo-yellow)]"
    >
      <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
        {label}
      </p>
      <div className="flex items-end gap-3 mt-2">
        <p className="text-[40px] font-bold text-[var(--yo-yellow)]">{value}</p>
        {change && (
          <span className="bg-[rgba(93,255,192,0.12)] text-[var(--card-mint)] rounded-full px-2 py-0.5 text-xs font-semibold mb-2">
            {change}
          </span>
        )}
      </div>
    </motion.div>
  );
}
