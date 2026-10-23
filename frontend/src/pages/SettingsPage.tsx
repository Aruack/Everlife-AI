import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Key,
  HardDrive,
  FileCheck
} from 'lucide-react';
import { SystemStatus } from '../types';
import { api } from '../api/client';

interface SettingsPageProps {
  systemStatus: SystemStatus | null;
  onRefresh: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  systemStatus,
  onRefresh
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeConfirmOpen, setWipeConfirmOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `everlife_data_export_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotice('Full data package exported successfully.');
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleWipe = async () => {
    setIsWiping(true);
    try {
      const res = await api.wipeData();
      setWipeConfirmOpen(false);
      showNotice(`Successfully wiped ${res.deleted_memories} memories and ${res.deleted_commitments} commitments.`);
      onRefresh();
    } catch (err: any) {
      alert(`Wipe error: ${err.message}`);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-white tracking-tight">Privacy & Settings</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            Zero-Leak Compliance
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage identity configurations, persistent storage safeguards, and GDPR data export/deletion rights.
        </p>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Official Project Identity Card */}
      <div className="glass-panel p-6 rounded-2xl border border-navy-700 space-y-4">
        <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Official Project Identity</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-mono text-[11px]">Team Name</span>
            <span className="font-bold text-white text-sm">{systemStatus?.team_name || 'TEAM ORYVAN'}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-mono text-[11px]">Product Name</span>
            <span className="font-bold text-white text-sm">{systemStatus?.app_name || 'Everlife AI'}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-mono text-[11px]">AI Memory Engine</span>
            <span className="font-bold text-cyan-300 text-sm">{systemStatus?.engine_name || 'Evermind'}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-mono text-[11px]">Hackathon Track</span>
            <span className="font-bold text-cyan-300 text-sm">{systemStatus?.primary_track || 'Bee Wearable AI'}</span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-slate-400 block font-mono text-[11px]">Official Tagline</span>
            <span className="font-medium text-slate-200 italic">"{systemStatus?.tagline}"</span>
          </div>
        </div>
      </div>

      {/* Storage Architecture */}
      <div className="glass-panel p-6 rounded-2xl border border-navy-700 space-y-4">
        <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Storage & Encryption Engine</h2>
        </div>

        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            Everlife AI uses <strong>SQLite in WAL mode</strong> as its local primary store. All recorded context is strictly contained on your local filesystem under <code className="text-cyan-300">backend/data/everlife.db</code>.
          </p>
          <p className="text-slate-400 text-[11px]">
            Cloud synchronization to Amazon DynamoDB and backup archiving to Amazon S3 only take place when valid AWS credentials are configured in your environment. Raw unapproved conversations are never uploaded without consent.
          </p>
        </div>
      </div>

      {/* Data Export & Deletion Rights */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 space-y-4">
        <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Data Sovereignty & Deletion</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-xs">
            <span className="font-bold text-white block">Full Archive Export (JSON)</span>
            <p className="text-slate-400">Download a complete structured copy of all memories, commitments, and audit records.</p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-navy-800 hover:bg-navy-750 text-cyan-300 border border-cyan-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export JSON'}</span>
          </button>
        </div>

        <div className="pt-4 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-xs">
            <span className="font-bold text-rose-400 block">Permanent Data Wipe</span>
            <p className="text-slate-400">Irreversibly delete all memories, commitments, and incident files from local and cloud stores.</p>
          </div>

          <button
            onClick={() => setWipeConfirmOpen(true)}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe All Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Permanent Wipe */}
      {wipeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-rose-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Confirm Permanent Wipe</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently erase all stored memories, commitments, incidents, and activity logs? This operation cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setWipeConfirmOpen(false)}
                className="px-4 py-2 bg-navy-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleWipe}
                disabled={isWiping}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
              >
                {isWiping ? 'Erasing...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
