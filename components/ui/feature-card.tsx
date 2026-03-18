'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const COLOR_PAIRS = [
  { bg: 'var(--card-blue)', text: 'var(--card-blue-text)' },
  { bg: 'var(--card-mint)', text: 'var(--card-mint-text)' },
  { bg: 'var(--card-cyan)', text: 'var(--card-cyan-text)' },
  { bg: 'var(--card-lavender)', text: 'var(--card-lavender-text)' },
] as const;

interface FeatureCardProps {
  category: string;
  title: string;
  description: string;
  colorIndex: number;
  icon?: ReactNode;
  index?: number;
}

export function FeatureCard({ category, title, description, colorIndex, icon, index = 0 }: FeatureCardProps) {
  const colors = COLOR_PAIRS[colorIndex % 4];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-[30px] p-10"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {icon && <div className="mb-4 opacity-60">{icon}</div>}
      <p className="text-xs font-bold uppercase opacity-60 mb-3">{category}</p>
      <h3 className="text-[40px] font-bold uppercase leading-[48px]">{title}</h3>
      <p className="text-base font-normal leading-6 mt-3">{description}</p>
    </motion.div>
  );
}
