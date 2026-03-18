'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Loader2, Check, X } from 'lucide-react';
import type { OnchainAction } from '@/lib/polkadot-agent/actions';

interface ActionProposalProps {
  action: OnchainAction;
  onApprove: (action: OnchainAction) => void;
  onReject: (action: OnchainAction) => void;
}

const STATUS_DISPLAY: Record<OnchainAction['status'], { label: string; color: string }> = {
  proposed: { label: 'Awaiting Approval', color: 'text-[var(--yo-yellow)]' },
  approved: { label: 'Approved', color: 'text-[var(--card-mint)]' },
  signing: { label: 'Signing...', color: 'text-[var(--card-cyan)]' },
  broadcasting: { label: 'Broadcasting...', color: 'text-[var(--card-cyan)]' },
  confirmed: { label: 'Confirmed', color: 'text-[var(--card-mint)]' },
  failed: { label: 'Failed', color: 'text-red-400' },
};

export function ActionProposal({ action, onApprove, onReject }: ActionProposalProps) {
  const status = STATUS_DISPLAY[action.status];
  const isPending = action.status === 'signing' || action.status === 'broadcasting';
  const isProposed = action.status === 'proposed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-[var(--yo-yellow)]/30 bg-[var(--surface-2)] rounded-[16px] p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[var(--yo-yellow)]" />
          <span className="text-[13px] font-bold uppercase tracking-[1.2px]">
            {action.title}
          </span>
        </div>
        <span className={`text-xs font-semibold ${status.color}`}>
          {isPending && <Loader2 size={12} className="inline animate-spin mr-1" />}
          {action.status === 'confirmed' && <Check size={12} className="inline mr-1" />}
          {action.status === 'failed' && <X size={12} className="inline mr-1" />}
          {status.label}
        </span>
      </div>

      <p className="text-sm text-[var(--muted)] mb-3">{action.description}</p>

      <div className="bg-[var(--surface-1)] rounded-[8px] p-3 mb-3 font-mono text-xs">
        <p className="text-[var(--muted)]">
          {action.pallet}.{action.method}
        </p>
        {Object.entries(action.args).map(([key, val]) => (
          <p key={key} className="mt-1">
            <span className="text-[var(--card-cyan)]">{key}:</span>{' '}
            <span className="text-[var(--text)] break-all">{val}</span>
          </p>
        ))}
      </div>

      {action.estimatedFee && (
        <p className="text-xs text-[var(--muted)] mb-3">
          Estimated fee: <span className="text-[var(--yo-yellow)]">{action.estimatedFee}</span>
        </p>
      )}

      {action.txHash && (
        <p className="text-xs text-[var(--card-mint)] mb-3 break-all">
          Tx: {action.txHash}
        </p>
      )}

      {action.error && (
        <p className="text-xs text-red-400 mb-3 flex items-center gap-1">
          <AlertTriangle size={12} /> {action.error}
        </p>
      )}

      {isProposed && (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(action)}
            className="flex-1 bg-[var(--yo-yellow)] text-black rounded-full px-5 py-2.5 text-xs font-bold uppercase hover:opacity-80 transition-opacity"
          >
            Approve & Sign
          </button>
          <button
            onClick={() => onReject(action)}
            className="flex-1 bg-[var(--surface-1)] text-[var(--text)] rounded-full px-5 py-2.5 text-xs font-bold uppercase hover:opacity-80 transition-opacity"
          >
            Reject
          </button>
        </div>
      )}
    </motion.div>
  );
}
