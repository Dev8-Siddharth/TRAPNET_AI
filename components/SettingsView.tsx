import React, { useState } from 'react';
import { AUTHORITATIVE_KNOWLEDGE_SOURCES } from '../demoData';
import { Cpu, BookOpen, ShieldCheck, CheckCircle2, ToggleLeft, ToggleRight, Info } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [demoMode, setDemoMode] = useState(true);
  const [useXGBoostBaseline, setUseXGBoostBaseline] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16 max-w-4xl">
      {/* Header */}
      <header>
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">
          <Cpu size={14} />
          <span>System & Architecture Configuration</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">TRAPNET AI Settings</h2>
        <p className="text-xs text-gray-400 mt-1">
          Configure ML Risk Scoring Baseline engine, RAG knowledge integration, and synthetic Hackathon Demo Mode presets.
        </p>
      </header>

      {/* ML Engine Card */}
      <div className="charcoal-bg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center">
          <Cpu className="mr-2" size={18} />
          ML Risk Engine Interface & Baseline Model
        </h3>

        <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
          <div>
            <div className="text-xs font-bold text-white">Transparent Feature-Based Baseline Model</div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Evaluates non-standard TLDs, brand typosquatting, urgency framing, and VPA mule matches. Easy plug-in interface for trained XGBoost / LightGBM models.
            </div>
          </div>
          <button onClick={() => setUseXGBoostBaseline(!useXGBoostBaseline)} className="text-blue-400">
            {useXGBoostBaseline ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-600" />}
          </button>
        </div>
      </div>

      {/* Demo Mode Toggle */}
      <div className="charcoal-bg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center">
          <ShieldCheck className="mr-2" size={18} />
          Demo Mode Presets & Synthetic Data
        </h3>

        <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
          <div>
            <div className="text-xs font-bold text-white">Enable Synthetic Demo Cases (#TRP-2026-00124 to #00588)</div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Provides pre-populated multimodal Bank KYC, Crypto Investment, FedEx Customs, and CEO BEC cases for instant demonstration.
            </div>
          </div>
          <button onClick={() => setDemoMode(!demoMode)} className="text-amber-400">
            {demoMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-600" />}
          </button>
        </div>
      </div>

      {/* RAG Knowledge System Status */}
      <div className="charcoal-bg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center">
          <BookOpen className="mr-2" size={18} />
          RAG Authoritative Knowledge Sources
        </h3>

        <div className="space-y-2">
          {AUTHORITATIVE_KNOWLEDGE_SOURCES.map((source, idx) => (
            <div key={idx} className="bg-black/40 p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-200">{source.source}</div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">{source.title}</div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30 flex items-center shrink-0">
                <CheckCircle2 size={10} className="mr-1" /> Active Vector Node
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
