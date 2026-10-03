import React, { useState } from 'react';
import { InvestigationRecord } from '../types';
import { DEMO_INVESTIGATIONS } from '../demoData';
import { 
  FileText, Download, FileSpreadsheet, ExternalLink, ShieldCheck, 
  CheckCircle2, Copy, Share2, Printer, AlertTriangle, Info 
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ReportsViewProps {
  investigation?: InvestigationRecord | null;
  allInvestigations?: InvestigationRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  investigation = DEMO_INVESTIGATIONS[0],
  allInvestigations = DEMO_INVESTIGATIONS
}) => {
  const [selectedCase, setSelectedCase] = useState<InvestigationRecord>(
    investigation || DEMO_INVESTIGATIONS[0]
  );
  const [copied, setCopied] = useState(false);

  const generatePDF = (inv: InvestigationRecord) => {
    const doc = new jsPDF();
    const margin = 15;
    let y = margin;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(59, 130, 246);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("TRAPNET AI - EVIDENCE PACK REPORT", margin, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Investigation ID: ${inv.id}`, margin, 30);
    doc.text(`Generated: ${new Date(inv.timestamp).toLocaleString()}`, 130, 30);

    y = 48;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("SUMMARY & RISK ASSESSMENT", margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Fraud Type: ${inv.fraud_type}`, margin, y);
    y += 5;
    doc.text(`Risk Score: ${inv.risk_score} / 100 (${inv.risk_level.toUpperCase()})`, margin, y);
    y += 5;
    doc.text(`Confidence: ${(inv.confidence * 100).toFixed(0)}%`, margin, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text("EXTRACTED ENTITIES", margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    inv.entities.forEach(ent => {
      doc.text(`- [${ent.type.toUpperCase()}] ${ent.value} (${ent.role})`, margin + 2, y);
      y += 5;
    });

    doc.save(`TRAPNET_Report_${inv.id}.pdf`);
  };

  const copyCybercrimePortalText = () => {
    const text = `NATIONAL CYBERCRIME REPORTING PORTAL (1930) PREPARATION FORM
--------------------------------------------------
Incident Reference ID: ${selectedCase.id}
Category: Financial Fraud / Phishing
Fraud Type: ${selectedCase.fraud_type}
Risk Level: ${selectedCase.risk_level} (${selectedCase.risk_score}/100)

SUSPECT DETAILS:
${selectedCase.entities.map(e => `- ${e.type.toUpperCase()}: ${e.value} (${e.role})`).join('\n')}

INCIDENT DESCRIPTION & NARRATIVE:
${selectedCase.victim_description}

KEY RISK FACTORS:
${selectedCase.why_risky.map(r => `- ${r}`).join('\n')}

RECOMMENDED ACTION COMPLETED:
- Freeze request initiated via Helpline 1930
- Evidence screenshots preserved
--------------------------------------------------
Prepared via TRAPNET AI Platform. Review before submission to cybercrime.gov.in.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">
            <FileText size={14} />
            <span>Evidence Pack & Cybercrime Reporting Assistant</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Evidence Pack Generator</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Compile structured, forensic incident packages for official submission to the National Cyber Crime Reporting Portal (cybercrime.gov.in) or financial institutions.
          </p>
        </div>

        {/* Case Selector */}
        <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-xl border border-white/10 shrink-0">
          <span className="text-xs text-gray-400 font-bold ml-2">Select Case:</span>
          <select
            value={selectedCase.id}
            onChange={(e) => {
              const found = allInvestigations.find(i => i.id === e.target.value);
              if (found) setSelectedCase(found);
            }}
            className="bg-black text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none border border-white/10"
          >
            {allInvestigations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.title.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Formal Report Preview */}
        <div className="lg:col-span-2 charcoal-bg p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest">
                OFFICIAL EVIDENCE PACK DRAFT
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">
                TRAPNET_EVIDENCE_PACK_{selectedCase.id}.PDF
              </h3>
            </div>
            <button
              onClick={() => generatePDF(selectedCase)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg"
            >
              <Download size={14} />
              <span>Export PDF</span>
            </button>
          </div>

          {/* Structured Document Form */}
          <div className="space-y-6 text-xs text-gray-300 font-mono bg-black/40 p-6 rounded-xl border border-white/5 leading-relaxed">
            <div>
              <span className="text-gray-500 uppercase block font-bold text-[10px] mb-1">1. Investigation Metadata</span>
              <div className="grid grid-cols-2 gap-2 text-gray-200">
                <div>Case ID: {selectedCase.id}</div>
                <div>Timestamp: {new Date(selectedCase.timestamp).toLocaleString()}</div>
                <div>Fraud Type: {selectedCase.fraud_type}</div>
                <div>Risk Score: {selectedCase.risk_score}/100 ({selectedCase.risk_level})</div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="text-gray-500 uppercase block font-bold text-[10px] mb-1">2. Victim Statement & Context</span>
              <p className="text-gray-300">{selectedCase.victim_description}</p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="text-gray-500 uppercase block font-bold text-[10px] mb-1">3. Extracted Forensic Entities</span>
              <div className="space-y-1">
                {selectedCase.entities.map(e => (
                  <div key={e.id}>• [{e.type.toUpperCase()}] {e.value} — Role: {e.role}</div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="text-gray-500 uppercase block font-bold text-[10px] mb-1">4. Reconstructed Attack Timeline</span>
              <div className="space-y-1">
                {selectedCase.timeline.map((t, idx) => (
                  <div key={idx}>• [{t.status}] {t.timestamp} - {t.stage}: {t.description}</div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="text-gray-500 uppercase block font-bold text-[10px] mb-1">5. Immediate Action & Reporting Checklist</span>
              <div className="space-y-1 text-emerald-300">
                {selectedCase.recommended_actions.immediate.map((act, i) => (
                  <div key={i}>[X] {act}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cybercrime Portal Preparation Tool */}
        <div className="charcoal-bg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-6">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
              REPORT PREPARATION ASSISTANT
            </span>
            <h3 className="text-lg font-bold text-white">Cybercrime Portal Helper</h3>
            <p className="text-xs text-gray-400 mt-1">
              Formatted snippet for copying directly into National Cyber Crime Reporting Portal (cybercrime.gov.in) form.
            </p>
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 leading-relaxed">
            <Info size={12} className="inline mr-1 text-amber-400" />
            Notice: Labelled as "Prepare Cybercrime Report". Please review and confirm all facts before official submission.
          </div>

          <button
            onClick={copyCybercrimePortalText}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-900/30"
          >
            <Copy size={16} />
            <span>{copied ? 'Copied Portal Text!' : 'Copy Portal Ready Format'}</span>
          </button>

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 border border-white/10 transition-all block text-center"
          >
            <ExternalLink size={16} className="inline" />
            <span>Open cybercrime.gov.in Portal</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
