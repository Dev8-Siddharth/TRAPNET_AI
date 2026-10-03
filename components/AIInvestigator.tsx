import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, InvestigationRecord } from '../types';
import { askAIInvestigator } from '../services/geminiService';
import { 
  Bot, User, Send, BookOpen, Sparkles, Zap, Shield, RefreshCw, 
  Mic, MicOff, Volume2, VolumeX, Globe, ShieldAlert, Radio 
} from 'lucide-react';
import { VoiceAssistantModal } from './VoiceAssistantModal';

interface AIInvestigatorProps {
  activeInvestigation?: InvestigationRecord | null;
}

const SAMPLE_QUESTIONS = [
  "Why did you classify this as high risk?",
  "What evidence supports this risk score?",
  "What should I do immediately to stop loss?",
  "Is the extracted URL/domain suspicious?",
  "What information should I include in the 1930 cybercrime report?",
  "What happened step-by-step in this attack?"
];

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'Hindi (हिंदी)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
];

const formatInlineBold = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/20">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="font-mono text-[11px] text-amber-300 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

const MarkdownText: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="font-extrabold text-sm text-blue-300 mt-3 mb-1 tracking-tight">
              {formatInlineBold(trimmed.replace('### ', ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="font-extrabold text-base text-white mt-4 mb-2 tracking-tight border-b border-white/10 pb-1">
              {formatInlineBold(trimmed.replace('## ', ''))}
            </h2>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start space-x-2 ml-2 my-0.5">
              <span className="text-blue-400 font-bold shrink-0 text-[10px] mt-0.5">•</span>
              <span className="text-gray-200">{formatInlineBold(bulletText)}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start space-x-2 ml-2 my-1">
              <span className="font-mono text-[10px] font-bold text-blue-400 shrink-0 mt-0.5 bg-blue-500/20 px-1.5 rounded">
                {numMatch[1]}
              </span>
              <span className="text-gray-200">{formatInlineBold(numMatch[2])}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-gray-200">
            {formatInlineBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const AIInvestigator: React.FC<AIInvestigatorProps> = ({ activeInvestigation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: activeInvestigation 
        ? `I am the TRAPNET AI Lead Fraud Investigator. I am fully loaded with active investigation context **#${activeInvestigation.id}** (${activeInvestigation.fraud_type}, Risk Score: **${activeInvestigation.risk_score}/100**).\n\nHow can I assist your forensic review?`
        : `I am the TRAPNET AI Lead Fraud Investigator. Ask me about psychological manipulation tactics, RBI/CERT-In security guidelines, or cybercrime reporting protocols.`
    }
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'general' | 'deep' | 'fast'>('general');
  const [loading, setLoading] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const res = await askAIInvestigator(messages, textToSend, activeInvestigation || undefined, mode);
      const botMsg: ChatMessage = {
        role: 'model',
        text: res.text,
        citations: res.citations
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: "Communication with AI Investigator node failed. Please verify your connection."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceMessageGenerated = (userText: string, botText: string) => {
    setMessages(prev => [
      ...prev,
      { role: 'user', text: userText },
      { role: 'model', text: botText }
    ]);
  };

  const handleClearThread = () => {
    setMessages([
      {
        role: 'model',
        text: activeInvestigation 
          ? `Conversation thread reset. Active context **#${activeInvestigation.id}** retained.`
          : `Conversation thread reset.`
      }
    ]);
  };

  return (
    <div className="h-[84vh] flex flex-col charcoal-bg rounded-2xl border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 relative">
      
      {/* Voice Assistant Vibrating Modal Overlay */}
      <VoiceAssistantModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        activeInvestigation={activeInvestigation}
        onMessageGenerated={handleVoiceMessageGenerated}
      />

      {/* Header */}
      <header className="p-4 bg-white/5 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 shadow-lg shrink-0">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-base text-white">AI Fraud Investigator</h2>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center space-x-1">
                <ShieldAlert size={10} />
                <span>Strict Guardrails Active</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {activeInvestigation 
                ? `Active Context: #${activeInvestigation.id} (${activeInvestigation.fraud_type})`
                : 'Cybersecurity & Scam Defense Advisory Mode'}
            </p>
          </div>
        </div>

        {/* Controls: Voice Trigger Button, Reset */}
        <div className="flex items-center space-x-2 shrink-0 text-xs">
          {/* Pop-Up Vibrating Voice Button */}
          <button
            onClick={() => setVoiceModalOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 text-white font-mono font-bold text-[11px] rounded-xl border border-red-400 flex items-center space-x-1.5 shadow-lg shadow-red-900/40 animate-pulse transition-all"
          >
            <Radio size={14} className="animate-spin text-red-200" />
            <span>VOICE CONVERSATION</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setMode('general')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                mode === 'general' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setMode('deep')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                mode === 'deep' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Deep Analysis
            </button>
            <button
              onClick={() => setMode('fast')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                mode === 'fast' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Fast Advisory
            </button>
          </div>

          <button
            onClick={handleClearThread}
            title="Reset Chat Thread"
            className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* Suggested Quick Prompts */}
      <div className="p-2.5 bg-black/30 border-b border-white/5 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="text-[10px] font-bold text-gray-500 uppercase shrink-0">Quick Prompt:</span>
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1 bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white rounded-lg whitespace-nowrap border border-white/10 transition-all text-[11px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Scrollable Chat Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                msg.role === 'user' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/10 text-blue-400'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                  : 'bg-black/50 border border-white/10 text-gray-200 rounded-tl-none space-y-3'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <MarkdownText content={msg.text} />
                )}

                {/* Citations Box */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center">
                      <BookOpen size={10} className="mr-1" /> Verified Knowledge Sources
                    </div>
                    {msg.citations.map((cite, cIdx) => (
                      <a
                        key={cIdx}
                        href={cite.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-white/5 p-2 rounded-lg border border-white/10 hover:border-purple-500/40 text-[10px] text-gray-300 transition-all"
                      >
                        <div className="font-bold text-purple-300">{cite.source}</div>
                        <div className="text-gray-400 truncate">{cite.title}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex space-x-3">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Bot size={16} className="animate-spin text-blue-400" />
              </div>
              <div className="p-4 rounded-2xl bg-black/40 text-gray-400 italic text-xs animate-pulse border border-white/5">
                Analyzing evidence under strict scope guardrails...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Footer with Vibrating Pop-Up Voice Trigger Button */}
      <footer className="p-4 bg-white/5 border-t border-white/10">
        <div className="flex items-center space-x-2 bg-black/50 p-2 rounded-xl border border-white/10 focus-within:ring-2 focus-within:ring-blue-500/50">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Investigator about cyber fraud, phishing, or reporting..."
            className="flex-1 bg-transparent border-none focus:outline-none text-xs text-white py-1.5 px-3 placeholder:text-gray-600"
          />

          {/* Vibrating Pop-Up Voice Assistant Button */}
          <button
            onClick={() => setVoiceModalOpen(true)}
            title="Open Vibrating Voice Assistant Modal"
            className="p-2.5 rounded-lg border transition-all shrink-0 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border-red-500/40 shadow-lg shadow-red-900/30 animate-pulse flex items-center space-x-1"
          >
            <Mic size={16} className="animate-bounce" />
            <span className="text-[10px] font-mono font-bold hidden sm:inline">VOICE</span>
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-40 shadow-lg shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AIInvestigator;
