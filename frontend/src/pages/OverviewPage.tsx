import React, { useState } from 'react';
import {
  Brain,
  CheckSquare,
  ShieldAlert,
  Dumbbell,
  Search,
  ArrowRight,
  Sparkles,
  Watch,
  ExternalLink,
  Flame,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { MemoryItem, CommitmentItem, IncidentItem, WorkoutItem, BeeStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PageId } from '../components/Sidebar';

interface OverviewPageProps {
  onNavigate: (page: PageId) => void;
  memories: MemoryItem[];
  commitments: CommitmentItem[];
  incidents: IncidentItem[];
  activeWorkout: WorkoutItem | null;
  beeStatus: BeeStatus | null;
  onSearch: (q: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigate,
  memories,
  commitments,
  incidents,
  activeWorkout,
  beeStatus,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const approvedMemories = memories.filter((m) => m.approval_status === 'approved');
  const pendingMemories = memories.filter((m) => m.approval_status === 'pending');
  const openCommitments = commitments.filter((c) => c.resolution_status === 'open');
  const overdueCommitments = openCommitments.filter((c) => c.is_overdue);
  const openIncidents = incidents.filter((i) => i.resolution_status === 'open');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      onNavigate('assistant');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-cyan-500/20 p-6 glow-subtle">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TEAM ORYVAN • Amazon Developer Hackathon 2026</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Everlife AI <span className="text-slate-400 font-normal">| Unified Intelligence</span>
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your life, connected. Your context, remembered. Capturing authorized Bee Wearable context into persistent Evermind memories, actionable LooseEnds commitments, and adaptive experiences.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => onNavigate('memory')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-navy-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Watch className="w-4 h-4" />
              <span>Bee Ingestion Stream</span>
            </button>
            <button
              onClick={() => onNavigate('assistant')}
              className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-600 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Ask Evermind</span>
            </button>
          </div>
        </div>
      </div>

      {/* Evidence-grounded natural language search input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ask a question grounded in your Bee memories (e.g., 'What did we decide about the hackathon budget?')..."
          className="w-full pl-12 pr-28 py-3.5 bg-navy-900 border border-navy-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
        >
          <span>Query</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Evermind Memory Card */}
        <div
          onClick={() => onNavigate('memory')}
          className="glass-card p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evermind Engine</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{approvedMemories.length}</span>
            <span className="text-xs text-slate-400">verified memories</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1.5 text-cyan-300">
            {pendingMemories.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[11px] font-bold">
                {pendingMemories.length} pending review
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                All context approved
              </span>
            )}
          </div>
        </div>

        {/* LooseEnds Commitments Card */}
        <div
          onClick={() => onNavigate('commitments')}
          className="glass-card p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LooseEnds AI</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{openCommitments.length}</span>
            <span className="text-xs text-slate-400">open commitments</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1.5">
            {overdueCommitments.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> {overdueCommitments.length} overdue
              </span>
            ) : (
              <span className="text-slate-500">Zero overdue items</span>
            )}
          </div>
        </div>

        {/* DoorstepOps Incidents Card */}
        <div
          onClick={() => onNavigate('incidents')}
          className="glass-card p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DoorstepOps (Ring)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{openIncidents.length}</span>
            <span className="text-xs text-slate-400">active security cases</span>
          </div>
          <div className="mt-2 text-xs">
            <span className="text-slate-400">Operational incident tracking</span>
          </div>
        </div>

        {/* FormShift Workout Card */}
        <div
          onClick={() => onNavigate('workouts')}
          className="glass-card p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">FormShift (Fire TV)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {activeWorkout ? 'Active' : 'Ready'}
            </span>
            <span className="text-xs text-slate-400">Adaptive Leanback</span>
          </div>
          <div className="mt-2 text-xs text-purple-300 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Remote-friendly workouts</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Approvals & Live Context */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Ingestions Requiring Review */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Candidate Context for Approval
              </h2>
            </div>
            <button
              onClick={() => onNavigate('memory')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {pendingMemories.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No pending candidates awaiting review. All ingested records have been evaluated.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMemories.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-navy-850 border border-navy-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.type}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Conf: {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">{item.content}</p>
                  {item.evidence && (
                    <p className="text-[11px] text-slate-400 italic bg-navy-900/60 p-2 rounded border border-navy-800">
                      Evidence: {item.evidence}
                    </p>
                  )}
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => onNavigate('memory')}
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs rounded-lg transition-colors"
                    >
                      Review in Evermind
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Bee Wearable Connection Guide */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Watch className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Bee Wearable Connection Status
              </h2>
            </div>
            <StatusBadge status={beeStatus?.logged_in ? 'Connected' : 'Authentication Required'} />
          </div>

          <div className="p-4 rounded-xl bg-navy-850/70 border border-navy-700/80 space-y-3">
            <div className="text-xs text-slate-300 leading-relaxed">
              {beeStatus?.instructions}
            </div>

            <div className="pt-2 border-t border-navy-700 text-xs font-mono text-slate-400 space-y-1">
              <div>CLI Command: <span className="text-cyan-300">bee</span> (v0.9.0)</div>
              <div>Endpoint: <span className="text-slate-300">{beeStatus?.api_endpoint}</span></div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => onNavigate('integrations')}
                className="px-3.5 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-650 text-slate-200 text-xs font-semibold border border-navy-600 transition-colors flex items-center gap-1.5"
              >
                <span>Enter Developer Token</span>
              </button>
              <button
                onClick={() => onNavigate('memory')}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors flex items-center gap-1.5"
              >
                <span>Import Device Recording</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
