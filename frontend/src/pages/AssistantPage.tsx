import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Brain,
  ShieldCheck,
  HelpCircle,
  Mic,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { MemoryQueryResult } from '../types';
import { api } from '../api/client';

interface AssistantPageProps {
  initialQuery?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: any[];
  confidence?: number;
  missingContext?: string;
  timestamp: string;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({ initialQuery = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your Everlife AI assistant powered by Evermind. I provide evidence-grounded answers based strictly on your authorized Bee Wearable recordings and approved context. What would you like to recall?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      executeSearch(initialQuery.trim());
    }
  }, [initialQuery]);

  const executeSearch = async (query: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res: MemoryQueryResult = await api.queryMemories(query, 3, true);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        citations: res.evidence_items,
        confidence: res.confidence,
        missingContext: res.missing_context,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Query error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    const q = inputQuery.trim();
    setInputQuery('');
    executeSearch(q);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">AI Memory Assistant</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              Evidence Grounded
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evermind RAG engine querying your approved memories with full source transparency and zero hallucinations.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Evidence-Only Mode Active</span>
        </div>
      </div>

      {/* Chat Canvas */}
      <div className="glass-panel rounded-2xl border border-navy-700 p-4 sm:p-6 flex flex-col h-[560px] justify-between">
        <div className="overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-navy-950 font-bold shadow-md shadow-cyan-500/10'
                    : 'bg-navy-900 text-slate-200 border border-navy-700 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-mono mb-1">
                  <span>{m.sender === 'user' ? 'You' : 'Evermind Engine'}</span>
                  <span>{m.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap">{m.text}</div>

                {m.missingContext && (
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                    <strong>Note:</strong> {m.missingContext}
                  </div>
                )}

                {m.confidence !== undefined && (
                  <div className="pt-2 border-t border-navy-800 text-[10px] font-mono text-cyan-400 flex items-center justify-between">
                    <span>Evidence Confidence: {(m.confidence * 100).toFixed(0)}%</span>
                    <span>Zero Fabrication Enforced</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse p-2">
              <Bot className="w-4 h-4" />
              <span>Querying verified Evermind records...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="pt-4 border-t border-navy-800 relative">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about a decision, deadline, project detail, or commitment..."
            className="w-full pl-4 pr-24 py-3 bg-navy-950 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-navy-950 font-bold text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};
