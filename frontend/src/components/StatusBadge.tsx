import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status.toLowerCase();

  let bg = 'bg-slate-800 text-slate-300 border-slate-700';
  let icon = <HelpCircle className="w-3.5 h-3.5" />;
  let label = status;

  if (norm.includes('connected') || norm.includes('operational') || norm.includes('ready') || norm.includes('approved') || norm.includes('completed')) {
    bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    icon = <CheckCircle2 className="w-3.5 h-3.5" />;
  } else if (norm.includes('auth') || norm.includes('required') || norm.includes('pending') || norm.includes('investigating')) {
    bg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    icon = <AlertCircle className="w-3.5 h-3.5" />;
  } else if (norm.includes('not configured')) {
    bg = 'bg-slate-800/80 text-slate-400 border-slate-700';
    icon = <Clock className="w-3.5 h-3.5" />;
  } else if (norm.includes('unavailable') || norm.includes('error') || norm.includes('rejected') || norm.includes('critical')) {
    bg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    icon = <XCircle className="w-3.5 h-3.5" />;
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${bg} ${px}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};
