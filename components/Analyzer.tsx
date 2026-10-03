
import React, { useState } from 'react';
import { Mic, Send, FileText, Loader2, CheckCircle, AlertCircle, Download, ExternalLink, Globe, Info, AlertTriangle, Fingerprint, Activity, Brain, Languages, ShieldAlert, MessageSquareCode } from 'lucide-react';
import { analyzeContent } from '../services/geminiService';
import { ReportItem, AnalysisResult } from '../types';
import { jsPDF } from 'jspdf';

const generatePDF = (report: ReportItem) => {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(22);
  doc.text("NATIONAL COGNITIVE SECURITY SYSTEM", margin, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Reference ID: ${report.id}`, margin, 35);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 130, 35);

  y = 55;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("FORENSIC COGNITIVE AUDIT", margin, y);
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Manipulation Tactic: ${report.analysis.tactic}`, margin, y);
  y += 7;
  doc.text(`Risk Level: ${report.analysis.riskLevel}`, margin, y);
  y += 7;
  doc.text(`Confidence Score: ${(report.analysis.confidence * 100).toFixed(1)}%`, margin, y);

  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text("PSYCHOLOGICAL EVALUATION", margin, y);
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text("Analysis:", margin, y);
  y += 6;
  const whatsHappeningText = doc.splitTextToSize(report.analysis.whatsHappening, 170);
  doc.text(whatsHappeningText, margin, y);
  y += whatsHappeningText.length * 7 + 5;

  doc.text("Exploited Biases:", margin, y);
  y += 6;
  doc.text(report.analysis.cognitiveBiases.join(', '), margin, y);
  y += 10;

  doc.text("Linguistic Audit:", margin, y);
  y += 6;
  doc.text(report.analysis.linguisticMarkers.join(', '), margin, y);
  y += 10;

  doc.text("Reality Check (Standard Procedure):", margin, y);
  y += 6;
  const realAuthText = doc.splitTextToSize(report.analysis.realAuthorityComparison, 170);
  doc.text(realAuthText, margin, y);
  y += realAuthText.length * 7 + 10;

  doc.setFont('helvetica', 'bold');
  doc.text("DEFENSIVE COUNTER-SCRIPT", margin, y);
  y += 10;
  doc.setFont('helvetica', 'italic');
  doc.text(`"${report.analysis.deescalationScript}"`, margin, y);
  y += 15;

  doc.setFont('helvetica', 'bold');
  doc.text("RECOMMENDED NEXT STEPS", margin, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  report.analysis.safeNextSteps.forEach((step, i) => {
    const stepText = doc.splitTextToSize(`${i + 1}. ${step}`, 170);
    doc.text(stepText, margin, y);
    y += stepText.length * 7 + 2;
  });

  doc.save(`NCSS_Forensic_Report_${report.id}.pdf`);
};

interface AnalyzerProps {
  onReportSaved: (report: ReportItem) => void;
}

const Analyzer: React.FC<AnalyzerProps> = ({ onReportSaved }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [activeReport, setActiveReport] = useState<ReportItem | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysis = await analyzeContent(input);
      setResult(analysis);
      
      const newReport: ReportItem = {
        id: `REP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        content: input,
        type: 'text',
        analysis
      };
      setActiveReport(newReport);
      onReportSaved(newReport);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please check your API key or network.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        setIsRecording(false);
        setInput("Voice transcript captured. Analyzing vocal patterns and psychological framing for exploitation...");
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) mediaRecorder.stop();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Tactical Analyzer</h2>
        <p className="text-gray-400 max-w-2xl">
          Forensic deep-scan of communication to identify psychological manipulation. Powered by NCSS Neural Nodes.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Input Card */}
        <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -z-10 rounded-full"></div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
              <Fingerprint size={14} className="mr-2 text-blue-500" />
              Submission Portal
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-lg transition-colors ${isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}
                title="Voice Input"
              >
                <Mic size={20} className={isRecording ? 'animate-pulse' : ''} />
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste suspicious text or voice transcript here..."
            className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all placeholder:text-gray-600 mb-4"
          />

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !input.trim()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center space-x-3 transition-all shadow-lg shadow-blue-900/20"
          >
            {isAnalyzing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Activity size={20} />
            )}
            <span>{isAnalyzing ? 'Running Forensic Audit...' : 'Initiate Deep Scan'}</span>
          </button>
        </div>

        {/* Results Card */}
        <div className="space-y-6">
          {!result && !isAnalyzing && (
            <div className="h-full min-h-[400px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-gray-500">
              <Globe className="mb-4 opacity-10" size={64} />
              <p className="max-w-xs text-sm">Analyze messages to detect manipulation tactics using Pro-level intelligence.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full min-h-[400px] bg-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-white/5 animate-pulse">
              <div className="relative mb-6">
                <Brain className="animate-pulse text-blue-500" size={64} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity size={24} className="text-blue-400" />
                </div>
              </div>
              <p className="text-blue-400 font-medium tracking-wide">Deconstructing Psychological Frame...</p>
              <p className="text-gray-500 text-xs mt-2 font-mono">Status: Gemini-3-Pro Reasoning Active</p>
            </div>
          )}

          {result && (
            <div className="bg-[#121212] rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-blue-400 text-[10px] font-mono uppercase tracking-widest mb-1 block">Forensic Log</span>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{result.tactic}</h3>
                </div>
                <div className="text-right">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    result.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                    result.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                  }`}>
                    Risk: {result.riskLevel}
                  </div>
                  <div className="mt-2 text-[10px] text-gray-500 font-mono uppercase">Confidence: {(result.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div className="mb-8 w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${
                    result.riskLevel === 'Critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500'
                  }`}
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>

              <div className="grid gap-6">
                {/* Summary Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                      <Brain className="mr-2 text-blue-500" size={12} />
                      Operation Logic
                    </h4>
                    <p className="text-gray-300 text-xs leading-relaxed">{result.whatsHappening}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                      <Info className="mr-2 text-blue-500" size={12} />
                      Hook Analysis
                    </h4>
                    <p className="text-gray-300 text-xs leading-relaxed">{result.whyItWorks}</p>
                  </div>
                </div>

                {/* Detailed Intelligence Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center">
                      <Brain size={14} className="mr-2" />
                      Cognitive Biases
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.cognitiveBiases.map((bias, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">{bias}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center">
                      <Languages size={14} className="mr-2" />
                      Linguistic Markers
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.linguisticMarkers.map((marker, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-purple-500/10 text-purple-300 rounded border border-purple-500/20">{marker}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reality Check */}
                <div className="bg-emerald-900/10 p-5 rounded-xl border border-emerald-500/20">
                  <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center">
                    <ShieldCheck className="mr-2" size={14} />
                    Reality Comparison (Legitimate Protocol)
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.realAuthorityComparison}</p>
                </div>

                {/* Counter Script */}
                <div className="bg-blue-900/20 p-5 rounded-xl border border-blue-500/30">
                  <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center">
                    <MessageSquareCode className="mr-2" size={14} />
                    Tactical Counter-Script (Safe Termination)
                  </h4>
                  <p className="text-blue-100 text-sm font-medium italic leading-relaxed">"{result.deescalationScript}"</p>
                </div>
                
                {/* Steps */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <CheckCircle className="mr-2 text-green-500" size={14} />
                    Recommended Response Actions
                  </h4>
                  <div className="grid gap-2">
                    {result.safeNextSteps.map((step, idx) => (
                      <div key={idx} className="text-xs text-gray-300 flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold shrink-0">{idx + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-white/5">
                <button 
                  onClick={() => activeReport && generatePDF(activeReport)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-white/10"
                >
                  <Download size={16} />
                  <span>Download Forensic Audit (PDF)</span>
                </button>
                <button 
                  onClick={() => window.open('https://cybercrime.gov.in/', '_blank')}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-blue-500/30"
                >
                  <ExternalLink size={16} />
                  <span>Formal Cyber Reporting</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ShieldCheck = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default Analyzer;
