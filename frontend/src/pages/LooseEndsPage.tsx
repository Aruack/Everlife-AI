import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Send,
  AlertTriangle,
  User,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  Plus,
  X,
  FileCheck,
  Folder
} from 'lucide-react';
import { CommitmentItem } from '../types';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';

interface LooseEndsPageProps {
  commitments: CommitmentItem[];
  onRefresh: () => void;
}

export const LooseEndsPage: React.FC<LooseEndsPageProps> = ({
  commitments,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'overdue' | 'completed'>('open');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newTopic, setNewTopic] = useState('General');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editPerson, setEditPerson] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(null), 4000);
  };

  const filteredCommitments = commitments.filter((item) => {
    if (filter === 'open') return item.resolution_status === 'open' || item.resolution_status === 'in_progress';
    if (filter === 'completed') return item.resolution_status === 'completed';
    if (filter === 'overdue') return item.is_overdue;
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    try {
      await api.createCommitment({
        description: newDesc.trim(),
        responsible_person: newPerson.trim() || undefined,
        deadline: newDeadline || undefined,
        project_topic: newTopic.trim() || 'General'
      });
      showAlert('New commitment registered in LooseEnds ledger.');
      setCreateModalOpen(false);
      setNewDesc('');
      setNewPerson('');
      setNewDeadline('');
      onRefresh();
    } catch (err: any) {
      alert(`Create failed: ${err.message}`);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateCommitment(id, { resolution_status: newStatus });
      showAlert(`Commitment marked as ${newStatus}.`);
      onRefresh();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleDraftFollowup = async (id: string) => {
    try {
      await api.draftFollowup(id);
      showAlert('Follow-up drafted. User confirmation required before dispatch.');
      onRefresh();
    } catch (err: any) {
      alert(`Draft failed: ${err.message}`);
    }
  };

  const handleConfirmSend = async (id: string) => {
    try {
      await api.confirmSendFollowup(id);
      showAlert('Follow-up dispatch confirmed and logged in audit history.');
      onRefresh();
    } catch (err: any) {
      alert(`Dispatch confirmation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this commitment from ledger?')) return;
    try {
      await api.deleteCommitment(id);
      showAlert('Commitment removed.');
      onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const startEditing = (c: CommitmentItem) => {
    setEditingId(c.id);
    setEditDesc(c.description);
    setEditPerson(c.responsible_person || '');
    setEditDeadline(c.deadline || '');
  };

  const saveEdit = async (id: string) => {
    try {
      await api.updateCommitment(id, {
        description: editDesc,
        responsible_person: editPerson || null,
        deadline: editDeadline || null
      });
      setEditingId(null);
      showAlert('Commitment updated.');
      onRefresh();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">LooseEnds AI</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              Commitment Intelligence Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tracks unresolved promises and action items extracted from wearable context. Requires human confirmation before any consequential follow-up is dispatched.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Commitment</span>
        </button>
      </div>

      {actionAlert && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-navy-700">
        {(['open', 'overdue', 'completed', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 px-3 text-xs font-bold capitalize transition-all relative ${
              filter === tab ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Commitments List */}
      {filteredCommitments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-navy-900/40 border border-dashed border-navy-700 space-y-2">
          <CheckSquare className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">No Commitments in View</div>
          <p className="text-xs text-slate-500">
            No items match filter '{filter}'. Approve extracted commitments in Evermind or add one manually.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCommitments.map((item) => {
            const isEditing = editingId === item.id;
            return (
              <div key={item.id} className="glass-card p-5 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.resolution_status} size="sm" />
                    {item.is_overdue && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 bg-navy-900 px-2 py-0.5 rounded border border-navy-800 flex items-center gap-1">
                      <Folder className="w-3 h-3 text-cyan-400" />
                      {item.project_topic || 'General'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    ID: {item.id.slice(0, 8)} • Source: {item.source_record_id ? 'Evermind Extraction' : 'Manual'}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3 p-3 bg-navy-950 rounded-xl border border-amber-500/40">
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-xs text-white"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editPerson}
                        onChange={(e) => setEditPerson(e.target.value)}
                        placeholder="Responsible person"
                        className="px-2 py-1.5 bg-navy-900 border border-navy-700 rounded text-xs text-white"
                      />
                      <input
                        type="date"
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        className="px-2 py-1.5 bg-navy-900 border border-navy-700 rounded text-xs text-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs text-slate-400">Cancel</button>
                      <button onClick={() => saveEdit(item.id)} className="px-3 py-1 bg-amber-500 text-navy-950 font-bold text-xs rounded">Save</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-snug">{item.description}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      {item.responsible_person && (
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span>Owner: <strong>{item.responsible_person}</strong></span>
                        </span>
                      )}
                      {item.deadline && (
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Deadline: <strong>{item.deadline}</strong></span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Drafted Follow-up Section (Explicit User Confirmation Gate) */}
                {item.draft_followup_message && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Draft Follow-Up ({item.followup_status.toUpperCase()})</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Requires explicit user confirmation</span>
                    </div>

                    <p className="text-xs text-slate-200 font-mono bg-navy-950 p-2.5 rounded border border-navy-800 whitespace-pre-wrap">
                      {item.draft_followup_message}
                    </p>

                    {item.followup_status === 'drafted' && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleConfirmSend(item.id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm"
                        >
                          <Send className="w-3 h-3" />
                          <span>Confirm & Dispatch Follow-Up</span>
                        </button>
                      </div>
                    )}

                    {item.followup_status === 'confirmed' && (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dispatched upon explicit confirmation. Logged in audit trail.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Actions */}
                <div className="pt-2 border-t border-navy-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.resolution_status !== 'completed' ? (
                      <button
                        onClick={() => handleStatusChange(item.id, 'completed')}
                        className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-lg flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(item.id, 'open')}
                        className="px-3 py-1 bg-navy-800 text-slate-300 text-xs rounded-lg border border-navy-700"
                      >
                        Reopen
                      </button>
                    )}

                    {!item.draft_followup_message && item.resolution_status !== 'completed' && (
                      <button
                        onClick={() => handleDraftFollowup(item.id)}
                        className="px-3 py-1 bg-navy-800 hover:bg-navy-750 text-amber-300 text-xs font-medium rounded-lg border border-navy-700 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3 text-amber-400" />
                        <span>Draft Follow-Up</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(item)}
                      className="p-1.5 text-slate-400 hover:text-white"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Commitment Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <form onSubmit={handleCreate} className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                <span>Register Commitment</span>
              </h3>
              <button type="button" onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Commitment Description</label>
                <textarea
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Aryan will finalize the Ring incident operational workflow"
                  className="w-full p-2.5 rounded-lg bg-navy-950 border border-navy-700 text-white focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Responsible Person</label>
                  <input
                    type="text"
                    value={newPerson}
                    onChange={(e) => setNewPerson(e.target.value)}
                    placeholder="e.g. Aryan Kumar"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Project or Topic</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Hackathon Submission"
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-navy-950 bg-amber-400 hover:bg-amber-300 transition-colors"
              >
                Create Commitment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
