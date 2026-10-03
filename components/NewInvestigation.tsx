import React, { useState } from 'react';
import { EvidenceItem, InvestigationRecord } from '../types';
import { runMultimodalInvestigation } from '../services/geminiService';
import { DEMO_INVESTIGATIONS } from '../demoData';
import InvestigationResultsView from './InvestigationResultsView';
import { 
  ShieldAlert, Upload, Link, FileText, Image as ImageIcon, 
  Trash2, Play, Sparkles, Loader2, Zap, AlertCircle
} from 'lucide-react';

interface NewInvestigationProps {
  onInvestigationCreated: (record: InvestigationRecord) => void;
  onOpenInvestigator: () => void;
  onPrepareReport: () => void;
}

const PRESET_SCENARIOS = [
  {
    label: "SBI Bank KYC SMS Scam",
    title: "Unauthorised Bank Account Suspension SMS Scam",
    description: "Received an urgent SMS claiming my SBI bank account was blocked due to pending PAN updates. Clicked the link http://sbi-kyc-verify-portal-99.xyz/login and entered my net banking credentials before realizing it was fake.",
    evidence: [
      {
        id: "EVD-PRESET-1",
        type: "text" as const,
        name: "SMS Message Transcript",
        content: "URGENT: Your SBI Account #XXXX2910 has been blocked today due to pending PAN updates. Update now to avoid permanent block: http://sbi-kyc-verify-portal-99.xyz/login",
        timestamp: new Date().toISOString()
      },
      {
        id: "EVD-PRESET-2",
        type: "url" as const,
        name: "Phishing Portal URL",
        content: "http://sbi-kyc-verify-portal-99.xyz/login",
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    label: "Customs Package Delivery Scam",
    title: "FedEx International Courier Customs Fee Demand",
    description: "Received a WhatsApp message claiming my overseas courier package is held at Mumbai Customs due to unpaid duty charges of Rs. 4,850. Demanded payment to UPI ID customs.duty.pay@ybl.",
    evidence: [
      {
        id: "EVD-PRESET-3",
        type: "text" as const,
        name: "WhatsApp Demand Message",
        content: "Dear Customer, Your FedEx shipment #IN982103 is detained at Mumbai Customs Airport. Pay duty charges of Rs 4,850 immediately to UPI ID: customs.duty.pay@ybl or face legal seizure.",
        timestamp: new Date().toISOString()
      },
      {
        id: "EVD-PRESET-4",
        type: "url" as const,
        name: "UPI VPA ID",
        content: "customs.duty.pay@ybl",
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    label: "Part-Time Task Investment Scam",
    title: "Telegram Like & Rate YouTube Videos Investment Fraud",
    description: "Recruited via WhatsApp for a part-time job liking YouTube videos. Paid initial Rs 150 reward, then tricked into transferring Rs 25,000 into a prepaid 'crypto trading task pool' which was frozen.",
    evidence: [
      {
        id: "EVD-PRESET-5",
        type: "text" as const,
        name: "Telegram Task Recruitment Log",
        content: "Earn Rs 3000-5000/day rating videos! Task 1 completed. Transfer Rs 25,000 to VIP Task Pool account 918273641203 to unlock Rs 45,000 bonus payout immediately.",
        timestamp: new Date().toISOString()
      }
    ]
  }
];

export const NewInvestigation: React.FC<NewInvestigationProps> = ({
  onInvestigationCreated,
  onOpenInvestigator,
  onPrepareReport
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidences, setEvidences] = useState<EvidenceItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<InvestigationRecord | null>(null);

  // Input states for adding new evidence
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const loadPreset = (scenario: typeof PRESET_SCENARIOS[0]) => {
    setTitle(scenario.title);
    setDescription(scenario.description);
    setEvidences(scenario.evidence);
  };

  const addTextEvidence = () => {
    if (!textInput.trim()) return;
    const newEv: EvidenceItem = {
      id: `EVD-${Date.now()}`,
      type: 'text',
      name: `Message Transcript #${evidences.length + 1}`,
      content: textInput,
      timestamp: new Date().toISOString()
    };
    setEvidences(prev => [...prev, newEv]);
    setTextInput('');
  };

  const addUrlEvidence = () => {
    if (!urlInput.trim()) return;
    const newEv: EvidenceItem = {
      id: `EVD-${Date.now()}`,
      type: 'url',
      name: `Suspicious URL / VPA #${evidences.length + 1}`,
      content: urlInput,
      timestamp: new Date().toISOString()
    };
    setEvidences(prev => [...prev, newEv]);
    setUrlInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');

      reader.onload = () => {
        const content = reader.result as string;
        const newEv: EvidenceItem = {
          id: `EVD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: isImage ? 'image' : 'document',
          name: file.name,
          content: content,
          mimeType: file.type,
          timestamp: new Date().toISOString()
        };
        setEvidences(prev => [...prev, newEv]);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const removeEvidence = (id: string) => {
    setEvidences(prev => prev.filter(e => e.id !== id));
  };

  const handleRunInvestigation = async () => {
    if (evidences.length === 0) return;

    setIsAnalyzing(true);
    setCurrentResult(null);

    try {
      const record = await runMultimodalInvestigation(
        title || 'Multimodal Evidence Scan',
        description || 'User submitted evidence for analysis',
        evidences
      );
      setCurrentResult(record);
      onInvestigationCreated(record);
    } catch (err: any) {
      console.error(err);
      alert("Investigation failed: " + (err.message || 'Error executing server multimodal analysis.'));
    } fontally: {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">
            <Sparkles size={14} />
            <span>Multimodal AI Investigation Portal</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Initiate New Investigation</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Upload multiple evidence formats (screenshots, SMS transcripts, URLs, documents). TRAPNET AI connects all evidence collectively to reconstruct the full attack.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-blue-500/10 px-3.5 py-2 rounded-xl border border-blue-500/30 text-xs font-mono text-blue-300 shrink-0">
          <ShieldAlert size={16} />
          <span>Multimodal Engine Ready</span>
        </div>
      </header>

      {/* Quick Sample Presets Bar */}
      <div className="charcoal-bg p-4 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-gray-400 shrink-0">
          <Zap size={15} className="text-amber-400" />
          <span className="font-bold uppercase tracking-wider text-[11px]">Load Sample Scam Scenario:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_SCENARIOS.map((scenario, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(scenario)}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-blue-600/30 text-gray-200 hover:text-white rounded-xl font-bold border border-white/10 transition-all text-xs flex items-center space-x-1"
            >
              <span>{scenario.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Upload Form vs Live Results */}
      {!currentResult ? (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Context Inputs */}
            <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                1. Case Metadata & Victim Statement
              </h3>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Investigation Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bank KYC SMS & Unauthorised UPI Payment Request"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Victim Statement / Incident Context</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, how you were contacted, and if any funds/credentials were shared..."
                  className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>
            </div>

            {/* Evidence Addition Hub */}
            <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-2xl space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                2. Attach Evidence Items (Multimodal)
              </h3>

              {/* Sub-inputs */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Text Evidence Input */}
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="text-xs font-bold text-gray-300 flex items-center">
                    <FileText size={14} className="mr-1.5 text-blue-400" />
                    SMS / Chat Message Text
                  </div>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste SMS, WhatsApp, Email or chat message text..."
                    className="w-full h-20 bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none"
                  />
                  <button
                    onClick={addTextEvidence}
                    disabled={!textInput.trim()}
                    className="w-full py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-blue-500/30 disabled:opacity-40"
                  >
                    + Add Text Evidence
                  </button>
                </div>

                {/* URL Evidence Input */}
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="text-xs font-bold text-gray-300 flex items-center">
                    <Link size={14} className="mr-1.5 text-purple-400" />
                    Suspicious Link / Domain URL
                  </div>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="e.g. http://sbi-kyc-update-portal-882.xyz/login"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={addUrlEvidence}
                    disabled={!urlInput.trim()}
                    className="w-full py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-purple-500/30 disabled:opacity-40"
                  >
                    + Add URL Evidence
                  </button>
                </div>
              </div>

              {/* Drag and Drop File Upload */}
              <div className="border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-2xl p-6 text-center transition-all bg-black/20">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt"
                  onChange={handleFileUpload}
                  id="evidence-file-upload"
                  className="hidden"
                />
                <label htmlFor="evidence-file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload size={32} className="text-blue-400 mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-gray-200">Upload Screenshots, Payment Receipts or Documents</span>
                  <span className="text-[10px] text-gray-500 mt-1">Supports PNG, JPG, WEBP, TXT, PDF</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Attached Evidence List & Run Button */}
          <div className="space-y-6">
            <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Attached Evidence ({evidences.length})
                </h3>
                {evidences.length > 0 && (
                  <button
                    onClick={() => setEvidences([])}
                    className="text-[10px] text-red-400 hover:underline font-bold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {evidences.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">
                  No evidence items attached yet. Select a sample scenario above or paste evidence items.
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {evidences.map((ev) => (
                    <div key={ev.id} className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-2.5 truncate">
                        <span className="text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded shrink-0">
                          {ev.type}
                        </span>
                        <span className="text-xs text-gray-200 truncate font-mono">{ev.name}</span>
                      </div>
                      <button
                        onClick={() => removeEvidence(ev.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Primary Run Action */}
              <button
                onClick={handleRunInvestigation}
                disabled={isAnalyzing || evidences.length === 0}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-900/40"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Executing Multimodal Analysis...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>RUN INVESTIGATION ({evidences.length} EVIDENCE ITEMS)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-xs text-gray-400">Viewing Active Investigation Output</span>
            <button
              onClick={() => setCurrentResult(null)}
              className="text-xs font-bold text-blue-400 hover:underline flex items-center"
            >
              + Start Another Investigation
            </button>
          </div>

          <InvestigationResultsView
            investigation={currentResult}
            onOpenInvestigator={onOpenInvestigator}
            onPrepareReport={onPrepareReport}
          />
        </div>
      )}
    </div>
  );
};

export default NewInvestigation;
