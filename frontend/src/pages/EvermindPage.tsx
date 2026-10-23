import React, { useState } from 'react';
import {
  Brain,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Watch,
  Sparkles,
  AlertCircle,
  FileText,
  Tag
} from 'lucide-react';
import { MemoryItem, MemoryQueryResult, BeeStatus } from '../types';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';

interface EvermindPageProps {
  memories: MemoryItem[];
  beeStatus: BeeStatus | null;
  onRefresh: () => void;
}

export const EvermindPage: React.FC<EvermindPageProps> = ({
  memories,
  beeStatus,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'search'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<MemoryQueryResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importSpeaker, setImportSpeaker] = useState('Bee User');
  const [isImporting, setIsImporting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  const pendingMemories = memories.filter((m) => m.approval_status === 'pending');
  const approvedMemories = memories.filter((m) => m.approval_status === 'approved');

  const filteredApproved = selectedTypeFilter === 'all'
    ? approvedMemories
    : approvedMemories.filter((m) => m.type === selectedTypeFilter);

  const showMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleApprove = async (item: MemoryItem, customContent?: string) => {
    try {
      await api.reviewMemory(item.id, 'approved', customContent || item.content);
      showMessage(`Approved memory: "${customContent || item.content}"`);
      setEditingId(null);
      onRefresh();
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleReject = async (item: MemoryItem) => {
    try {
      await api.reviewMemory(item.id, 'rejected');
      showMessage(`Rejected candidate memory.`);
      onRefresh();
    } catch (err: any) {
      alert(`Rejection failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    try {
      await api.deleteMemory(id);
      showMessage('Memory deleted.');
      onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.queryMemories(searchQuery.trim(), 4, true);
      setSearchResult(res);
    } catch (err: any) {
      alert(`Search failed: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFetchLiveBee = async () => {
    try {
      showMessage('Contacting Bee Wearable API (bee now)...');
      const data = await api.getBeeNow();
      const res = await api.importBeeRecord(data);
      showMessage(`Successfully ingested live Bee record! Extracted ${res.candidates_extracted} candidates.`);
      onRefresh();
    } catch (err: any) {
      alert(`Live Bee fetch: ${err.message}`);
    }
  };

  const handleImportCustom = async () => {
    if (!importText.trim()) return;
    setIsImporting(true);
    try {
      let payload: any;
      try {
        // If user pasted raw JSON
        payload = JSON.parse(importText);
      } catch {
        // Raw transcript format
        payload = {
          id: `manual-bee-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Imported Wearable Audio Session',
          utterances: [
            { speaker: importSpeaker, text: importText.trim() }
          ]
        };
      }
      const res = await api.importBeeRecord(payload);
      showMessage(`Extracted ${res.candidates_extracted} candidate memories from input context.`);
      setImportModalOpen(false);
      setImportText('');
      onRefresh();
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `everlife_export_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showMessage('Exported all memories and commitments.');
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Evermind Memory Engine</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              Persistent & Evidence-Grounded
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingests authorized Bee Wearable recordings, preserves source citations & timestamps, and requires human review before persistence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleFetchLiveBee}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
            title="Poll bee now from CLI"
          >
            <Watch className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fetch Live Bee (`bee now`)</span>
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Wearable Context</span>
          </button>
          <button
            onClick={handleExportData}
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 text-xs transition-colors"
            title="Export Records (JSON)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-navy-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'pending' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>Pending Review</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {pendingMemories.length}
            </span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'approved' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>Approved Memories</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {approvedMemories.length}
            </span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'search' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            <span>Evidence Query (RAG)</span>
          </span>
        </button>
      </div>

      {/* TAB 1: Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-slate-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Zero-Fabrication Privacy Rule:</span> Candidate memories extracted from Bee audio transcripts remain in pending status until you approve them. Approving a commitment automatically pushes it into the LooseEnds ledger.
            </div>
          </div>

          {pendingMemories.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-navy-900/40 border border-dashed border-navy-700 space-y-3">
              <Brain className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No Pending Extractions</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All wearable context has been reviewed. Use the "Fetch Live Bee" or "Import Wearable Context" buttons to ingest more records.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {pendingMemories.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <div key={item.id} className="glass-card p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {item.type}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Source: {item.source_type} ({item.source_id})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Recorded: {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full p-2.5 bg-navy-950 border border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleApprove(item, editedContent)}
                            className="px-3 py-1 bg-cyan-500 text-navy-950 font-bold text-xs rounded-lg"
                          >
                            Save & Approve
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-100">{item.content}</p>
                    )}

                    {item.evidence && (
                      <div className="p-2.5 rounded-lg bg-navy-950/80 border border-navy-800 text-xs text-slate-400">
                        <span className="font-semibold text-slate-500 text-[10px] uppercase font-mono block">Exact Evidence Quote:</span>
                        <span className="italic text-cyan-200/90">{item.evidence}</span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="pt-1 flex items-center justify-between border-t border-navy-800">
                        <span className="text-[11px] text-slate-500 font-mono">
                          Confidence: {(item.confidence * 100).toFixed(0)}%
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditedContent(item.content);
                            }}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-navy-800 rounded-lg border border-navy-700 flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg border border-rose-500/20 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleApprove(item)}
                            className="px-3 py-1 text-xs text-navy-950 font-bold bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Approve & Persist</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Approved Memories */}
      {activeTab === 'approved' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {['all', 'fact', 'decision', 'commitment', 'task'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTypeFilter(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    selectedTypeFilter === type
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-navy-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-400">
              Showing {filteredApproved.length} verified memories
            </div>
          </div>

          {filteredApproved.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-navy-900/40 border border-dashed border-navy-700 space-y-2">
              <Brain className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No Approved Memories Yet</div>
              <p className="text-xs text-slate-500">
                Switch to the "Pending Review" tab to evaluate candidate memories extracted from your Bee wearable.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApproved.map((item) => (
                <div key={item.id} className="glass-card p-4 rounded-xl space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.type}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Approved: {item.approved_at ? new Date(item.approved_at).toLocaleDateString() : 'Yes'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white leading-relaxed">{item.content}</p>
                    {item.evidence && (
                      <p className="text-[11px] text-slate-400 italic bg-navy-950 p-2 rounded border border-navy-800">
                        "{item.evidence.replace(/^"|"$/g, '')}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Source: {item.source_id || item.source_type}</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 hover:text-rose-400 transition-colors"
                      title="Delete Memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Evidence Search / RAG */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query Evermind with natural language (e.g., 'What was agreed regarding delivery dates?')..."
              className="w-full pl-12 pr-28 py-3.5 bg-navy-900 border border-navy-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Run RAG'}
            </button>
          </form>

          {searchResult && (
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400">
                  Confidence Score: {(searchResult.confidence * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-slate-400">
                  Matched {searchResult.evidence_items.length} verified citation(s)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-navy-950/90 border border-navy-800 whitespace-pre-wrap text-xs text-slate-200 leading-relaxed font-mono">
                {searchResult.answer}
              </div>

              {searchResult.missing_context && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                  <span className="font-semibold">Context Gap: </span>
                  {searchResult.missing_context}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Wearable Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xl p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Watch className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Import Bee Wearable Transcript</h3>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste actual conversational context from your Bee device or Apple Watch (JSON record or plaintext transcript). Evermind will analyze utterances, extract candidate facts/decisions/commitments, and present them for your approval.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Speaker Tag / Device ID</label>
                <input
                  type="text"
                  value={importSpeaker}
                  onChange={(e) => setImportSpeaker(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-xs text-white focus:outline-none"
                  placeholder="e.g. Aryan Kumar (Bee Wearable #1)"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Transcript or JSON Payload</label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={6}
                  className="w-full p-3 rounded-lg bg-navy-950 border border-navy-700 text-xs text-white focus:outline-none font-mono"
                  placeholder="e.g. 'We decided to prioritize the Bee Wearable AI integration. I will finish the complete test suite by tomorrow 6 PM.'"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-navy-800"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCustom}
                disabled={isImporting || !importText.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-navy-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-colors"
              >
                {isImporting ? 'Ingesting...' : 'Ingest & Extract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
