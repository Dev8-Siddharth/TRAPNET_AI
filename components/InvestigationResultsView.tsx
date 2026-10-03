import React, { useState } from 'react';
import { InvestigationRecord, ExtractedEntity, TimelineStep } from '../types';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Cpu, Layers, FileText, 
  ExternalLink, Download, Share2, CornerDownRight, CheckCircle2, 
  HelpCircle, AlertCircle, ArrowRight, UserCheck, Lock, Activity, 
  Network, MessageSquare, Flame, Check, Info, FileSpreadsheet
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ResultsProps {
  investigation: InvestigationRecord;
  onOpenInvestigator?: () => void;
  onPrepareReport?: () => void;
}

const generatePDF = (investigation: InvestigationRecord) => {
  const doc = new jsPDF();
  const margin = 15;
  let y = margin;

  // Header Banner
  doc.setFillColor(15, 23, 42); // dark navy
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(59, 130, 246);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text("TRAPNET AI - EVIDENCE PACK REPORT", margin, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Investigation ID: ${investigation.id}`, margin, 30);
  doc.text(`Generated: ${new Date(investigation.timestamp).toLocaleString()}`, 130, 30);

  y = 48;

  // Overview Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("1. INCIDENT & RISK CLASSIFICATION", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fraud Category: ${investigation.fraud_type}`, margin, y);
  y += 6;
  doc.text(`Fraud Risk Score: ${investigation.risk_score} / 100 (${investigation.risk_level.toUpperCase()})`, margin, y);
  y += 6;
  doc.text(`AI Forensic Confidence: ${(investigation.confidence * 100).toFixed(1)}%`, margin, y);
  y += 10;

  // Victim Summary
  doc.setFont('helvetica', 'bold');
  doc.text("2. VICTIM STATEMENT & CONTEXT", margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  const victimText = doc.splitTextToSize(investigation.victim_description || 'None provided', 180);
  doc.text(victimText, margin, y);
  y += victimText.length * 5 + 8;

  // Extracted Entities
  doc.setFont('helvetica', 'bold');
  doc.text("3. EXTRACTED FORENSIC ENTITIES", margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  investigation.entities.slice(0, 8).forEach((ent) => {
    doc.text(`• [${ent.type.toUpperCase()}] ${ent.value} — Role: ${ent.role}`, margin + 5, y);
    y += 5;
  });
  y += 6;

  // Why Risky
  doc.setFont('helvetica', 'bold');
  doc.text("4. THREAT ANALYSIS & WHY THIS CASE IS RISKY", margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  investigation.why_risky.forEach((reason) => {
    const reasonText = doc.splitTextToSize(`• ${reason}`, 180);
    doc.text(reasonText, margin + 2, y);
    y += reasonText.length * 5 + 2;
  });
  y += 8;

  // Attack Timeline
  doc.setFont('helvetica', 'bold');
  doc.text("5. RECONSTRUCTED ATTACK TIMELINE", margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  investigation.timeline.forEach((step) => {
    const stepStr = `[${step.status}] ${step.timestamp} - ${step.stage}: ${step.description}`;
    const stepText = doc.splitTextToSize(stepStr, 180);
    doc.text(stepText, margin + 2, y);
    y += stepText.length * 5 + 2;
  });
  y += 8;

  // Recommended Actions
  doc.setFont('helvetica', 'bold');
  doc.text("6. RECOMMENDED IMMEDIATE ACTIONS", margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  investigation.recommended_actions.immediate.forEach((act) => {
    const actText = doc.splitTextToSize(`• ${act}`, 180);
    doc.text(actText, margin + 2, y);
    y += actText.length * 5 + 2;
  });

  doc.save(`TRAPNET_Evidence_Pack_${investigation.id}.pdf`);
};

export const InvestigationResultsView: React.FC<ResultsProps> = ({
  investigation,
  onOpenInvestigator,
  onPrepareReport
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'entities' | 'ml' | 'timeline' | 'actions'>('overview');
  const [copied, setCopied] = useState(false);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Moderate': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getStatusBadge = (status: 'CONFIRMED' | 'INFERRED' | 'UNKNOWN') => {
    if (status === 'CONFIRMED') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 size={10} /> CONFIRMED FACT</span>;
    }
    if (status === 'INFERRED') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1"><Cpu size={10} /> AI INFERRED</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30 flex items-center gap-1"><HelpCircle size={10} /> UNKNOWN STEP</span>;
  };

  const copyReportSummary = () => {
    const text = `TRAPNET AI Investigation Summary (${investigation.id})
Fraud Type: ${investigation.fraud_type}
Risk Score: ${investigation.risk_score}/100 (${investigation.risk_level})
Extracted Entities: ${investigation.entities.map(e => e.value).join(', ')}
Key Risk: ${investigation.why_risky.join('; ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Investigation Top Banner */}
      <div className="charcoal-bg p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20">
                INVESTIGATION #{investigation.id}
              </span>
              {investigation.isDemoCase && (
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  SYNTHETIC DEMO CASE
                </span>
              )}
              {investigation.campaign_name && (
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  CAMPAIGN: {investigation.campaign_name}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{investigation.title}</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              {investigation.victim_description}
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-black/40 p-4 rounded-xl border border-white/10 shrink-0">
            <div className="text-center pr-4 border-r border-white/10">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Fraud Risk</div>
              <div className="text-3xl font-black text-white flex items-center justify-center">
                {investigation.risk_score}
                <span className="text-xs text-gray-500 font-normal ml-0.5">/100</span>
              </div>
            </div>

            <div className="text-center pl-2">
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getRiskColor(investigation.risk_level)}`}>
                {investigation.risk_level} RISK
              </div>
              <div className="text-[10px] text-gray-400 mt-1 font-mono">
                Confidence: {(investigation.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Quick Nav Sub-tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            Overview & Attack Stage
          </button>
          <button
            onClick={() => setActiveTab('entities')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'entities' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            Extracted Entities ({investigation.entities.length})
          </button>
          <button
            onClick={() => setActiveTab('ml')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'ml' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            ML Risk Engine Breakdown
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'timeline' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            Attack Reconstruction ({investigation.timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'actions' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            Recommended Actions
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & STAGES */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Why Is This Risky */}
            <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-4 flex items-center">
                <AlertTriangle className="mr-2" size={18} />
                Why Is This Risky? (Forensic Analysis)
              </h3>
              <div className="space-y-3">
                {investigation.why_risky.map((reason, idx) => (
                  <div key={idx} className="bg-red-950/20 border border-red-500/20 p-3.5 rounded-xl text-xs text-gray-200 flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">!</span>
                    <span className="leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attack Stage Progression Stepper */}
            <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-4 flex items-center">
                <Activity className="mr-2" size={18} />
                Attack Stage Classification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative">
                {investigation.attack_stages.map((stg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      stg.status === 'completed'
                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                        : stg.status === 'active'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-2 ring-amber-500/30'
                        : 'bg-white/5 border-white/5 text-gray-500'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1">
                      Stage {i + 1}
                    </div>
                    <div className="text-xs font-extrabold line-clamp-1 mb-1">{stg.stage}</div>
                    <div className="text-[9px] text-gray-400 line-clamp-2 leading-tight">{stg.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Inventory */}
            <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4 flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="mr-2 text-blue-400" size={18} />
                  Multimodal Evidence Inventory
                </span>
                <span className="text-xs font-mono text-gray-500">{investigation.evidences.length} Item(s) Attached</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {investigation.evidences.map((ev) => (
                  <div key={ev.id} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                          {ev.type}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">
                          {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-200 mb-2 truncate">{ev.name}</h4>
                      {ev.type === 'image' && ev.content.startsWith('http') ? (
                        <div className="w-full h-32 rounded-lg bg-black/40 overflow-hidden mb-2 border border-white/10">
                          <img src={ev.content} alt={ev.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 font-mono line-clamp-3 bg-black/30 p-2.5 rounded-lg border border-white/5">
                          {ev.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Connected Graph Snippet */}
          <div className="space-y-6">
            {/* Quick Action Hub */}
            <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                Investigation Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => generatePDF(investigation)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-900/30"
                >
                  <Download size={16} />
                  <span>Generate Evidence Report (PDF)</span>
                </button>

                <button
                  onClick={onPrepareReport}
                  className="w-full py-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all"
                >
                  <FileSpreadsheet size={16} />
                  <span>Prepare Cybercrime Report</span>
                </button>

                <button
                  onClick={onOpenInvestigator}
                  className="w-full py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all"
                >
                  <MessageSquare size={16} />
                  <span>Ask AI Investigator</span>
                </button>

                <button
                  onClick={copyReportSummary}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 border border-white/10 transition-all"
                >
                  <Share2 size={14} />
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Case Summary'}</span>
                </button>
              </div>
            </div>

            {/* Connected Entities Graph Preview */}
            <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center justify-between">
                <span className="flex items-center"><Network className="mr-2" size={16} /> Fraud Intelligence Graph</span>
                <span className="text-[10px] font-mono text-gray-500">{investigation.connected_entities.length} Nodes</span>
              </h3>

              <div className="space-y-2 mb-4">
                {investigation.connected_entities.slice(0, 4).map((node) => (
                  <div key={node.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-200">{node.label}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{node.note}</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 shrink-0 ml-2">
                      {node.incidentCount} incidents
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center text-[10px] text-gray-500 italic">
                Safety Notice: Entities marked as potential connection based on observed incident overlap.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENTITIES */}
      {activeTab === 'entities' && (
        <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
            Extracted Intelligence Entities
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {investigation.entities.map((ent) => (
              <div key={ent.id} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                    {ent.type}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    Confidence: {(ent.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-sm font-extrabold text-white font-mono break-all mb-1">{ent.value}</div>
                <div className="text-xs text-gray-400">{ent.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ML BREAKDOWN */}
      {activeTab === 'ml' && (
        <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-xl space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-1 flex items-center">
              <Cpu className="mr-2" size={18} />
              Feature-Based ML Fraud Risk Architecture
            </h3>
            <p className="text-xs text-gray-400">
              Transparent, deterministic feature weight calculation across domain heuristics, language patterns, and behavioral flags.
            </p>
          </div>

          <div className="space-y-3">
            {investigation.ml_features.map((feat, idx) => (
              <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-200">{feat.featureName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      feat.impact === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {feat.impact} Impact
                    </span>
                  </div>
                  <div className="text-xs font-mono text-gray-400 mt-1">{feat.detectedValue}</div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-xs font-mono text-gray-500">Weight:</span>
                  <span className="text-sm font-bold text-blue-400 font-mono">+{feat.weight} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-6 flex items-center">
            <Layers className="mr-2" size={18} />
            Reconstructed Attack Sequence
          </h3>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-white/10">
            {investigation.timeline.map((step, idx) => (
              <div key={step.id || idx} className="relative pl-10">
                <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-black" />

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-blue-400">{step.timestamp}</span>
                      <span className="text-xs font-bold text-gray-200">• {step.stage}</span>
                    </div>
                    {getStatusBadge(step.status)}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{step.description}</p>
                  {step.sourceEvidenceName && (
                    <div className="mt-2 text-[10px] text-gray-500 font-mono">
                      Source Evidence: {step.sourceEvidenceName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ACTIONS */}
      {activeTab === 'actions' && (
        <div className="grid md:grid-cols-2 gap-6">
          <ActionCard
            title="1. Immediate Containment"
            icon={<AlertCircle className="text-red-400" size={18} />}
            items={investigation.recommended_actions.immediate}
            accent="border-red-500/20 bg-red-950/10"
          />
          <ActionCard
            title="2. Account & Financial Protection"
            icon={<Lock className="text-amber-400" size={18} />}
            items={investigation.recommended_actions.accountProtection}
            accent="border-amber-500/20 bg-amber-950/10"
          />
          <ActionCard
            title="3. Evidence Preservation"
            icon={<FileText className="text-blue-400" size={18} />}
            items={investigation.recommended_actions.evidencePreservation}
            accent="border-blue-500/20 bg-blue-950/10"
          />
          <ActionCard
            title="4. Official Reporting Procedures"
            icon={<ShieldCheck className="text-emerald-400" size={18} />}
            items={investigation.recommended_actions.reporting}
            accent="border-emerald-500/20 bg-emerald-950/10"
          />
        </div>
      )}
    </div>
  );
};

const ActionCard = ({ title, icon, items, accent }: { title: string; icon: any; items: string[]; accent: string }) => (
  <div className={`p-6 rounded-2xl border ${accent} shadow-xl`}>
    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center">
      <span className="mr-2">{icon}</span>
      {title}
    </h4>
    <div className="space-y-2.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start space-x-2.5 text-xs text-gray-300">
          <span className="text-blue-400 font-bold shrink-0 mt-0.5">•</span>
          <span className="leading-relaxed">{item}</span>
        </div>
      ))}
    </div>
  </div>
);

export default InvestigationResultsView;
