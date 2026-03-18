'use client';

import { MetricCard } from '@/components/ui/metric-card';

interface MetricsDisplayProps {
  totalExtrinsics: number;
  successRate: number;
  avgWeight: number;
}

export function MetricsDisplay({ totalExtrinsics, successRate, avgWeight }: MetricsDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        label="Total Extrinsics"
        value={totalExtrinsics.toLocaleString()}
        index={0}
      />
      <MetricCard
        label="Success Rate"
        value={`${successRate.toFixed(1)}%`}
        change={successRate >= 90 ? 'Healthy' : undefined}
        index={1}
      />
      <MetricCard
        label="Avg Weight"
        value={avgWeight > 0 ? avgWeight.toLocaleString() : '-'}
        index={2}
      />
    </div>
  );
}
