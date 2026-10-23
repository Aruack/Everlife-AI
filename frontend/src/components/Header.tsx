import React from 'react';
import { Cpu, Zap, Activity, RefreshCw, Shield, Sparkles } from 'lucide-react';
import { SystemStatus, BeeStatus } from '../types';

interface HeaderProps {
  systemStatus: SystemStatus | null;
  beeStatus: BeeStatus | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  systemStatus,
  beeStatus,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="h-16 border-b border-navy-700 bg-navy-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu className="w-5 h-5 text-navy-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">Everlife AI</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-medium">
                Evermind Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              TEAM ORYVAN <span className="text-slate-600">•</span> Amazon Developer Hackathon 2026
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Bee Status Indicator */}
        <div className="flex items-center gap-2 bg-navy-850 px-3 py-1.5 rounded-lg border border-navy-700 text-xs">
          <div className={`w-2 h-2 rounded-full ${beeStatus?.logged_in ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-pulse'}`} />
          <span className="text-slate-300 font-medium">Bee Wearable:</span>
          <span className={beeStatus?.logged_in ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
            {beeStatus?.logged_in ? 'Connected' : 'Auth Required'}
          </span>
        </div>

        {/* Database Status Indicator */}
        <div className="hidden md:flex items-center gap-2 bg-navy-850 px-3 py-1.5 rounded-lg border border-navy-700 text-xs">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-medium">Storage:</span>
          <span className="text-cyan-400 font-semibold">SQLite (Encrypted)</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-navy-800 hover:bg-navy-700 border border-navy-600 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh live context"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>
    </header>
  );
};
