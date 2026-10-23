import React, { useState, useEffect } from 'react';
import {
  History,
  Activity,
  Shield,
  Clock,
  RefreshCw,
  FileText
} from 'lucide-react';
import { AuditLog } from '../types';
import { api } from '../api/client';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs(60);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Activity & Audit History</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              Tamper-Evident Trail
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of memory approvals, commitment state changes, Ring incident transitions, and data operations.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="p-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 border border-navy-700 transition-colors"
          title="Refresh audit log"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Log Feed */}
      {logs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-navy-900/40 border border-dashed border-navy-700 space-y-2">
          <History className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">No Activity Logged Yet</div>
          <p className="text-xs text-slate-500">
            System actions and user confirmations will automatically record here.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-navy-700 divide-y divide-navy-800">
          {logs.map((log) => {
            let detailsObj: any = {};
            try {
              detailsObj = JSON.parse(log.details);
            } catch {
              detailsObj = { raw: log.details };
            }

            return (
              <div key={log.id} className="p-4 space-y-1.5 hover:bg-navy-850/50 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {log.action}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Entity: <strong className="text-slate-200">{log.entity_type}</strong> ({log.entity_id || 'system'})
                    </span>
                  </div>

                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-300 bg-navy-950 p-2.5 rounded-lg border border-navy-850 overflow-x-auto">
                  {JSON.stringify(detailsObj, null, 2)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
