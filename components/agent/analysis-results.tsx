'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Zap, Shield, Info } from 'lucide-react';
import type { AIAnalysisResult } from '@/lib/polkadot-agent/types';

interface AnalysisResultsProps {
  result: AIAnalysisResult | null;
  isLoading?: boolean;
}

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-500/12', text: 'text-red-400', label: 'Critical' },
  high: { bg: 'bg-orange-500/12', text: 'text-orange-400', label: 'High' },
  medium: { bg: 'bg-yellow-500/12', text: 'text-yellow-400', label: 'Medium' },
  low: { bg: 'bg-blue-500/12', text: 'text-blue-400', label: 'Low' },
  info: { bg: 'bg-[rgba(93,255,192,0.12)]', text: 'text-[var(--card-mint)]', label: 'Info' },
};

const IMPACT_COLORS = {
  high: 0,   // blue
  medium: 1, // mint
  low: 2,    // cyan
};

const CARD_BG = [
  { bg: 'var(--card-blue)', text: 'var(--card-blue-text)' },
  { bg: 'var(--card-mint)', text: 'var(--card-mint-text)' },
  { bg: 'var(--card-cyan)', text: 'var(--card-cyan-text)' },
  { bg: 'var(--card-lavender)', text: 'var(--card-lavender-text)' },
];

export function AnalysisResults({ result, isLoading }: AnalysisResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-[var(--surface-1)] rounded-[30px] p-10">
        <h3 className="text-[28px] font-bold uppercase leading-[36px] mb-6">
          Analysis
        </h3>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[var(--muted)]"
        >
          Analyzing code...
        </motion.div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-[var(--surface-1)] rounded-[30px] p-10">
        <h3 className="text-[28px] font-bold uppercase leading-[36px] mb-4">
          Analysis
        </h3>
        <p className="text-[var(--muted)]">
          Submit code to see AI analysis results here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-1)] rounded-[30px] p-10 space-y-8">
      <div>
        <h3 className="text-[28px] font-bold uppercase leading-[36px] mb-4">
          Analysis
        </h3>
        <div className="flex items-center gap-4">
          <div className="bg-[var(--surface-2)] rounded-[16px] p-5 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
              Risk Score
            </p>
            <p className={`text-[40px] font-bold ${
              result.riskScore > 60 ? 'text-red-400' :
              result.riskScore > 30 ? 'text-yellow-400' :
              'text-[var(--card-mint)]'
            }`}>
              {result.riskScore}
            </p>
          </div>
          <div className="bg-[var(--surface-2)] rounded-[16px] p-5 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)]">
              Issues Found
            </p>
            <p className="text-[40px] font-bold text-[var(--yo-yellow)]">
              {result.vulnerabilities.length}
            </p>
          </div>
        </div>
        <p className="text-base mt-4 text-[var(--muted)]">{result.summary}</p>
      </div>

      {result.vulnerabilities.length > 0 && (
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] mb-4 flex items-center gap-2">
            <Shield size={14} /> Vulnerabilities
          </h4>
          <div className="space-y-3">
            {result.vulnerabilities.map((vuln, i) => {
              const style = SEVERITY_STYLES[vuln.severity];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[var(--surface-2)] rounded-[16px] p-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className={style.text} />
                    <span className={`${style.bg} ${style.text} rounded-full px-2 py-0.5 text-xs font-semibold`}>
                      {style.label}
                    </span>
                    <span className="text-[13px] font-bold">{vuln.title}</span>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{vuln.description}</p>
                  {vuln.recommendation && (
                    <p className="text-sm text-[var(--card-mint)] mt-2">
                      <Info size={12} className="inline mr-1" />
                      {vuln.recommendation}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {result.optimizations.length > 0 && (
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] mb-4 flex items-center gap-2">
            <Zap size={14} /> Optimizations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.optimizations.map((opt, i) => {
              const colors = CARD_BG[IMPACT_COLORS[opt.impact] ?? i % 4];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-[30px] p-10"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  <p className="text-xs font-bold uppercase opacity-60 mb-3">{opt.category}</p>
                  <h3 className="text-[24px] font-bold uppercase leading-[32px]">{opt.title}</h3>
                  <p className="text-base font-normal leading-6 mt-3">{opt.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
