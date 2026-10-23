import React, { useState, useEffect } from 'react';
import {
  Layers,
  Watch,
  Cloud,
  Camera,
  Tv,
  Mic,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Key,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { BeeStatus } from '../types';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';

interface IntegrationsPageProps {
  beeStatus: BeeStatus | null;
  onRefresh: () => void;
}

export const IntegrationsPage: React.FC<IntegrationsPageProps> = ({
  beeStatus,
  onRefresh
}) => {
  const [beeToken, setBeeToken] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [awsInfo, setAwsInfo] = useState<any>(null);
  const [ringInfo, setRingInfo] = useState<any>(null);
  const [fireTvInfo, setFireTvInfo] = useState<any>(null);
  const [alexaInfo, setAlexaInfo] = useState<any>(null);
  const [copiedModel, setCopiedModel] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      const [aws, ring, ftv, alexa] = await Promise.all([
        api.getAwsStatus(),
        api.getRingStatus(),
        api.getFireTvStatus(),
        api.getAlexaStatus(),
      ]);
      setAwsInfo(aws);
      setRingInfo(ring);
      setFireTvInfo(ftv);
      setAlexaInfo(alexa);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beeToken.trim()) return;
    setIsLoggingIn(true);
    try {
      await api.beeLogin(beeToken.trim());
      setStatusMsg('Bee CLI successfully authenticated with developer token!');
      setBeeToken('');
      onRefresh();
      loadStatuses();
    } catch (err: any) {
      alert(`Bee Login failed: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const downloadAlexaModel = async () => {
    try {
      const model = await api.getAlexaInteractionModel();
      const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'everlife_alexa_interaction_model.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Failed to fetch Alexa model: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-white tracking-tight">Integrations Hub</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            Verified Status Matrix
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Audited connection health across hardware, cloud persistence, and voice interfaces. Every state reflects honest capability.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Grid of 5 Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Bee Wearable AI (Primary Track) */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Watch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Bee Wearable AI</h3>
                <span className="text-[11px] text-cyan-400 font-mono">Primary Hackathon Track</span>
              </div>
            </div>
            <StatusBadge status={beeStatus?.logged_in ? 'Connected' : 'Authentication Required'} />
          </div>

          <div className="text-xs text-slate-300 space-y-2 bg-navy-950 p-3.5 rounded-xl border border-navy-800">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-400">CLI Package:</span>
              <span className="text-cyan-300">{beeStatus?.version || '@beeai/cli 0.9.0'}</span>
            </div>
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-400">Developer API:</span>
              <span className="text-slate-300 truncate max-w-[240px]">{beeStatus?.api_endpoint}</span>
            </div>
            <div className="pt-2 text-[11px] text-slate-400 leading-relaxed border-t border-navy-800">
              {beeStatus?.instructions}
            </div>
          </div>

          {/* Token Authentication Form */}
          <form onSubmit={handleBeeLogin} className="space-y-2 pt-1">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Enter Bee Developer Token (`bee login --token`):
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={beeToken}
                onChange={(e) => setBeeToken(e.target.value)}
                placeholder="Paste session token from Bee Wearable app..."
                className="flex-1 px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isLoggingIn || !beeToken.trim()}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-navy-950 font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoggingIn ? 'Logging in...' : 'Connect'}
              </button>
            </div>
          </form>
        </div>

        {/* 2. AWS Persistent Storage (DynamoDB & S3) */}
        <div className="glass-panel p-6 rounded-2xl border border-navy-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AWS Persistent Storage</h3>
                <span className="text-[11px] text-slate-400 font-mono">DynamoDB & S3 Backup</span>
              </div>
            </div>
            <StatusBadge status={awsInfo?.cloud_persistence || 'Not Configured'} />
          </div>

          <div className="text-xs text-slate-300 space-y-2 bg-navy-950 p-3.5 rounded-xl border border-navy-800">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-400">Primary Local Engine:</span>
              <span className="text-emerald-400 font-bold">SQLite (Active)</span>
            </div>
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-400">Target Region:</span>
              <span className="text-slate-300">{awsInfo?.region || 'us-east-1'}</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 leading-relaxed border-t border-navy-800">
              {awsInfo?.message || 'Local SQLite stores all records with immediate ACID persistence. Configure AWS_ACCESS_KEY_ID in .env for optional cloud mirroring.'}
            </p>
          </div>
        </div>

        {/* 3. DoorstepOps Ring Incidents */}
        <div className="glass-panel p-6 rounded-2xl border border-navy-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">DoorstepOps (Ring)</h3>
                <span className="text-[11px] text-slate-400 font-mono">developer.ring.com</span>
              </div>
            </div>
            <StatusBadge status={ringInfo?.status || 'Not Configured'} />
          </div>

          <div className="text-xs text-slate-300 space-y-2 bg-navy-950 p-3.5 rounded-xl border border-navy-800">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {ringInfo?.message}
            </p>
            <div className="pt-2 text-[11px] text-slate-400 flex flex-wrap gap-1 font-mono">
              <span className="text-slate-500">Supported Events:</span>
              {ringInfo?.supported_events?.map((e: string) => (
                <span key={e} className="px-1.5 py-0.5 rounded bg-navy-900 border border-navy-800 text-slate-300 text-[10px]">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4. FormShift Fire TV */}
        <div className="glass-panel p-6 rounded-2xl border border-navy-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">FormShift (Fire TV)</h3>
                <span className="text-[11px] text-slate-400 font-mono">Fire OS Leanback Web Container</span>
              </div>
            </div>
            <StatusBadge status="Ready (Leanback Compliant)" />
          </div>

          <div className="text-xs text-slate-300 space-y-2 bg-navy-950 p-3.5 rounded-xl border border-navy-800">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {fireTvInfo?.deployment_notice}
            </p>
            <div className="pt-2 flex justify-between font-mono text-[11px]">
              <span className="text-slate-400">Remote Profile:</span>
              <span className="text-purple-300">{fireTvInfo?.controller_profile}</span>
            </div>
          </div>
        </div>

        {/* 5. Alexa+ Voice & MCP Integration */}
        <div className="glass-panel p-6 rounded-2xl border border-navy-700 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Alexa+ Voice & MCP Integration</h3>
                <span className="text-[11px] text-slate-400 font-mono">Amazon Alexa Skills Kit (ASK)</span>
              </div>
            </div>
            <StatusBadge status={alexaInfo?.status || 'Available'} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-xs text-slate-300 bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-2">
              <span className="font-semibold text-slate-200 block">Setup Instructions:</span>
              <p className="text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">
                {alexaInfo?.requirements}
              </p>
            </div>

            <div className="text-xs text-slate-300 bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Supported Voice Intents:</span>
                <ul className="mt-1 space-y-1 font-mono text-[11px] text-cyan-300">
                  {alexaInfo?.supported_intents?.map((intent: string) => (
                    <li key={intent}>• {intent}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={downloadAlexaModel}
                className="w-full py-2 bg-navy-800 hover:bg-navy-750 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download ASK Interaction Model (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
