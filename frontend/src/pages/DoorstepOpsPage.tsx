import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Camera,
  AlertCircle,
  Clock,
  User,
  Plus,
  CheckCircle2,
  ChevronRight,
  Shield,
  Layers,
  Activity,
  X
} from 'lucide-react';
import { IncidentItem } from '../types';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';

interface DoorstepOpsPageProps {
  incidents: IncidentItem[];
  onRefresh: () => void;
}

export const DoorstepOpsPage: React.FC<DoorstepOpsPageProps> = ({
  incidents,
  onRefresh
}) => {
  const [ringStatus, setRingStatus] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [newActionText, setNewActionText] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [eventType, setEventType] = useState('motion');
  const [sourceDevice, setSourceDevice] = useState('Ring Video Doorbell Pro (Front Entrance)');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedOwner, setAssignedOwner] = useState('Aryan Kumar (Ops Lead)');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');

  useEffect(() => {
    api.getRingStatus().then(setRingStatus).catch(() => {});
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== 'all' && inc.resolution_status !== statusFilter) return false;
    if (priorityFilter !== 'all' && inc.priority !== priorityFilter) return false;
    return true;
  });

  const handleAddAction = async (id: string) => {
    if (!newActionText.trim()) return;
    try {
      await api.updateIncident(id, { add_action: newActionText.trim() });
      setNewActionText('');
      onRefresh();
      // Update local selected item
      const updated = await api.listIncidents();
      const curr = updated.find((i) => i.id === id);
      if (curr) setSelectedIncident(curr);
    } catch (err: any) {
      alert(`Action logging failed: ${err.message}`);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.updateIncident(id, { resolution_status: status });
      onRefresh();
      const updated = await api.listIncidents();
      const curr = updated.find((i) => i.id === id);
      if (curr) setSelectedIncident(curr);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    try {
      await api.createIncident({
        event_type: eventType,
        source_device: sourceDevice,
        description: description.trim(),
        priority,
        assigned_owner: assignedOwner,
        source_references: {
          developer_portal: 'https://developer.ring.com',
          telemetry_stream: 'Live Webhook Event'
        }
      });
      setCreateModalOpen(false);
      setDescription('');
      onRefresh();
    } catch (err: any) {
      alert(`Create incident failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">DoorstepOps</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
              Ring Business Incidents
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational case management for Ring camera telemetry, package tracking, and perimeter access events.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-rose-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Incident Case</span>
        </button>
      </div>

      {/* Ring Developer Status Banner */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>developer.ring.com Integration State</span>
          </div>
          <StatusBadge status={ringStatus?.status || 'Not Configured'} />
        </div>
        <p className="text-xs text-slate-400">
          {ringStatus?.message || 'Ring Developer telemetry interface requires configured OAuth token.'}
        </p>
      </div>

      {/* Main Layout: List + Detail Case Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incidents List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-700 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Status:</span>
              {(['open', 'investigating', 'remediated', 'all'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 text-xs rounded-lg capitalize font-semibold ${
                    statusFilter === s
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Priority:</span>
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2 py-0.5 text-xs rounded uppercase font-mono font-bold ${
                    priorityFilter === p ? 'bg-navy-700 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-navy-900/40 border border-dashed border-navy-700 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No Incidents Matching Filter</div>
              <p className="text-xs text-slate-500">
                All perimeter and doorbell events are currently resolved or unflagged.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`glass-card p-4 rounded-xl cursor-pointer transition-all space-y-2.5 ${
                    selectedIncident?.id === inc.id ? 'border-rose-500/60 bg-navy-850' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                        inc.priority === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        inc.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {inc.priority}
                      </span>
                      <span className="text-slate-300 font-medium">{inc.source_device}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white leading-relaxed">{inc.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-navy-800">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{inc.assigned_owner || 'Unassigned'}</span>
                    </div>
                    <StatusBadge status={inc.resolution_status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Selected Case Workspace */}
        <div className="space-y-4">
          {selectedIncident ? (
            <div className="glass-panel p-5 rounded-2xl space-y-4 border border-navy-700">
              <div className="flex items-center justify-between border-b border-navy-700 pb-3">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">CASE FILE #{selectedIncident.id}</span>
                  <h3 className="text-sm font-bold text-white capitalize">{selectedIncident.event_type.replace('_', ' ')}</h3>
                </div>
                <StatusBadge status={selectedIncident.resolution_status} />
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div><strong className="text-slate-400">Device:</strong> {selectedIncident.source_device}</div>
                <div><strong className="text-slate-400">Reported:</strong> {new Date(selectedIncident.timestamp).toLocaleString()}</div>
                <div><strong className="text-slate-400">Owner:</strong> {selectedIncident.assigned_owner}</div>
              </div>

              {/* Status Change Controls */}
              <div className="space-y-1.5 pt-2 border-t border-navy-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Transition Status</span>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    onClick={() => handleStatusChange(selectedIncident.id, 'investigating')}
                    className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-amber-300 border border-navy-700 text-center font-semibold"
                  >
                    Investigate
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedIncident.id, 'remediated')}
                    className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-emerald-300 border border-navy-700 text-center font-semibold"
                  >
                    Remediate
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedIncident.id, 'closed')}
                    className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 border border-navy-700 text-center font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Actions Taken Audit */}
              <div className="space-y-2 pt-2 border-t border-navy-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Logged Actions ({selectedIncident.actions_taken.length})</span>
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {selectedIncident.actions_taken.map((act, idx) => (
                    <div key={idx} className="p-2 rounded bg-navy-950 text-xs text-slate-200 border border-navy-800 space-y-0.5">
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>{act.by}</span>
                        <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p>{act.action}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    placeholder="Log operational action taken..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddAction(selectedIncident.id)}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-lg"
                  >
                    Log
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-navy-900/30 border border-dashed border-navy-800 text-xs text-slate-500">
              Select an incident from the list to view telemetry details and log remediation actions.
            </div>
          )}
        </div>
      </div>

      {/* Create Incident Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <form onSubmit={handleCreateIncident} className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-rose-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Simulate / Log Ring Incident Case</span>
              </h3>
              <button type="button" onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white focus:outline-none"
                  >
                    <option value="motion">Motion Detected</option>
                    <option value="doorbell_ring">Doorbell Ring</option>
                    <option value="package_delivery">Package Delivery</option>
                    <option value="access_attempt">Access Attempt</option>
                    <option value="unauthorized_entry">Unauthorized Entry</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Source Device</label>
                <input
                  type="text"
                  value={sourceDevice}
                  onChange={(e) => setSourceDevice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Incident Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Courier left high-value shipment at front dock without digital signature verification."
                  className="w-full p-2.5 rounded-lg bg-navy-950 border border-navy-700 text-white focus:outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Assigned Owner</label>
                <input
                  type="text"
                  value={assignedOwner}
                  onChange={(e) => setAssignedOwner(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-navy-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-400 transition-colors"
              >
                Submit Incident Case
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
