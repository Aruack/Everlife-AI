import React from 'react';
import {
  LayoutDashboard,
  Brain,
  CheckSquare,
  ShieldAlert,
  Dumbbell,
  Bot,
  Layers,
  History,
  Settings,
  Sparkles,
  Watch
} from 'lucide-react';

export type PageId =
  | 'overview'
  | 'memory'
  | 'commitments'
  | 'incidents'
  | 'workouts'
  | 'assistant'
  | 'integrations'
  | 'activity'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  pendingMemoriesCount: number;
  openCommitmentsCount: number;
  activeIncidentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  pendingMemoriesCount,
  openCommitmentsCount,
  activeIncidentsCount
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'memory', label: 'Evermind Memory', icon: Brain, badge: pendingMemoriesCount > 0 ? pendingMemoriesCount : undefined, badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { id: 'commitments', label: 'LooseEnds Commitments', icon: CheckSquare, badge: openCommitmentsCount > 0 ? openCommitmentsCount : undefined, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'incidents', label: 'DoorstepOps Incidents', icon: ShieldAlert, badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { id: 'workouts', label: 'FormShift Workouts', icon: Dumbbell },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'integrations', label: 'Integrations Hub', icon: Layers },
    { id: 'activity', label: 'Activity History', icon: History },
    { id: 'settings', label: 'Privacy & Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-navy-700 bg-navy-900/90 backdrop-blur-md flex flex-col justify-between p-4 flex-shrink-0">
      <div className="space-y-6">
        {/* Track Badge */}
        <div className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-navy-850 border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Watch className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Bee Wearable AI</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Primary Track Submission
          </p>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id as PageId)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-navy-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-navy-800 px-3">
        <div className="text-[11px] text-slate-500 space-y-1 font-mono">
          <div>Everlife AI v1.0.0</div>
          <div>TEAM ORYVAN</div>
          <div className="text-[10px] text-slate-600">Amazon Dev Hackathon 2026</div>
        </div>
      </div>
    </aside>
  );
};
