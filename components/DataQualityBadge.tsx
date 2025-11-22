import React from 'react';
import { DataStatus } from '../types';

interface DataQualityBadgeProps {
  status?: DataStatus;
  title?: string;
  compact?: boolean;
}

const STATUS_CONFIG: Record<DataStatus, { label: string; chipClass: string; dotClass: string }> = {
  REALTIME: {
    label: '真實數據',
    chipClass: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200',
    dotClass: 'bg-emerald-400'
  },
  FALLBACK: {
    label: '備援數據',
    chipClass: 'border-amber-300/40 bg-amber-500/10 text-amber-200',
    dotClass: 'bg-amber-300'
  },
  PLACEHOLDER: {
    label: '占位數據',
    chipClass: 'border-rose-300/40 bg-rose-500/10 text-rose-200',
    dotClass: 'bg-rose-300'
  }
};

const DataQualityBadge: React.FC<DataQualityBadgeProps> = ({ status = 'PLACEHOLDER', title, compact = false }) => {
  const config = STATUS_CONFIG[status];
  const sizeClass = compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-mono uppercase tracking-wide ${config.chipClass} ${sizeClass}`}
      title={title}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
};

export default DataQualityBadge;
