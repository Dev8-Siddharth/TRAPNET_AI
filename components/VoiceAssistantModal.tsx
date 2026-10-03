import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Radio, Globe } from 'lucide-react';
import { askAIInvestigator } from '../services/geminiService';
import { InvestigationRecord, ChatMessage } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeInvestigation?: InvestigationRecord | null;
  onMessageGenerated?: (userText: string, botText: string) => void;
}

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

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  activeInvestigation,
  onMessageGenerated
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [selectedLang, setSelectedLang] = useState('en-US');
  
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');

  // Keep transcript ref in sync
  useEffect(() => {
    latestTranscriptRef.current = transcript;
  }, [transcript]);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        latestTranscriptRef.current = '';
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        latestTranscriptRef.current = currentTranscript;

        // Reset silence timer on every new speech fragment (fast 350ms pause detection)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (currentTranscript.trim()) {
            handleAutoSubmit(currentTranscript);
          }
        }, 350);
      };

      recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If transcript exists when speech ends, auto process
        if (latestTranscriptRef.current.trim()) {
          handleAutoSubmit(latestTranscriptRef.current);
        }
      };

      recognitionRef.current = recognition;
      startListening();
    }

    return () => {
      stopListening();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [isOpen, selectedLang]);

  const startListening = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setTranscript('');
    latestTranscriptRef.current = '';

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = selectedLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    // Strip markdown formatting for natural TTS pronunciation
    const cleanText = text.replace(/[*#`_\-\[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedLang;
    utterance.rate = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto restart listening after AI finishes speaking for continuous hands-free dialogue!
      setTimeout(() => {
        if (isOpen) {
          startListening();
        }
      }, 500);
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleAutoSubmit = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    latestTranscriptRef.current = '';
    stopListening();
    setLoading(true);

    try {
      const history: ChatMessage[] = [];
      const res = await askAIInvestigator(history, queryText, activeInvestigation || undefined, 'fast');
      setAiResponse(res.text);

      if (onMessageGenerated) {
        onMessageGenerated(queryText, res.text);
      }

      speakText(res.text);
    } catch (err: any) {
      setAiResponse("Failed to query voice assistant. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg charcoal-bg border border-blue-500/30 rounded-3xl p-8 shadow-2xl overflow-hidden flex flex-col items-center text-center space-y-6">
        
        {/* Background Glowing Ambient Orbs */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
            <Radio size={16} className="animate-pulse text-red-500" />
            <span>Real-Time Auto Voice Assistant</span>
          </div>

          <button
            onClick={() => {
              stopListening();
              window.speechSynthesis?.cancel();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Central Vibrating Pulsing Audio Wave Visualizer */}
        <div className="relative flex items-center justify-center my-6 z-10">
          {/* Animated Vibrating Outer Rings */}
          {(isListening || isSpeaking || loading) && (
            <>
              <div className="absolute w-48 h-48 rounded-full bg-blue-500/10 border border-blue-500/30 animate-ping" />
              <div className="absolute w-36 h-36 rounded-full bg-purple-500/20 border border-purple-500/40 animate-pulse" />
            </>
          )}

          {/* Central Mic Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all border-2 ${
              isListening
                ? 'bg-gradient-to-tr from-red-600 to-pink-600 border-red-400 text-white animate-bounce scale-110 shadow-red-900/50'
                : isSpeaking
                ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-blue-400 text-white scale-105 shadow-blue-900/50'
                : 'bg-white/10 border-white/20 text-gray-300 hover:scale-105'
            }`}
          >
            {isListening ? (
              <MicOff size={40} className="animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 size={40} className="animate-pulse text-blue-200" />
            ) : (
              <Mic size={40} />
            )}
          </button>
        </div>

        {/* Status Indicator */}
        <div className="z-10">
          {isListening && (
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest animate-pulse flex items-center justify-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block mr-1"></span>
              Listening... Auto-processing on silence
            </span>
          )}
          {isSpeaking && (
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest animate-pulse flex items-center justify-center space-x-1">
              <Volume2 size={14} className="mr-1" />
              AI Responding...
            </span>
          )}
          {loading && (
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest animate-pulse">
              Generating Answer...
            </span>
          )}
          {!isListening && !isSpeaking && !loading && (
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              Tap mic to resume continuous voice chat
            </span>
          )}
        </div>

        {/* Live Speech Transcript Box */}
        <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 min-h-[95px] flex flex-col justify-center text-xs leading-relaxed z-10 text-left space-y-2">
          {transcript ? (
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-400 block mb-0.5">Your Voice Input:</span>
              <p className="text-white font-medium italic">"{transcript}"</p>
            </div>
          ) : (
            <p className="text-gray-500 text-center italic">
              Speak now... The AI will respond automatically as soon as you finish.
            </p>
          )}

          {aiResponse && (
            <div className="pt-2 border-t border-white/10 mt-2">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-0.5">AI Response:</span>
              <p className="text-gray-200 line-clamp-3">{aiResponse}</p>
            </div>
          )}
        </div>

        {/* Language Picker & Hands-free indicator */}
        <div className="w-full flex items-center justify-between gap-3 pt-2 border-t border-white/10 z-10">
          <div className="flex items-center space-x-1.5 bg-black/40 px-3 py-2 rounded-xl border border-white/10 text-xs">
            <Globe size={14} className="text-blue-400" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <Sparkles size={13} />
            <span>Hands-Free Auto Response</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VoiceAssistantModal;
