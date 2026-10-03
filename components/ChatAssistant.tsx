
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Info, ShieldAlert } from 'lucide-react';
import { getAssistantResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello, I am the National Cognitive Security AI Assistant. How can I help you understand digital manipulation today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const reply = await getAssistantResponse(history, input);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[80vh] flex flex-col bg-black/20 rounded-2xl border border-white/5 overflow-hidden animate-in zoom-in-95 duration-500">
      <header className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Cognitive AI Assistant</h2>
            <p className="text-xs text-green-400 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse" />
              Pro Neural Node Active
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <ShieldAlert size={14} className="text-yellow-500" />
          <span>Defensive Advisory Mode</span>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-blue-600 shadow-lg shadow-blue-900/40' : 'bg-white/10'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-blue-400" />}
              </div>
              <div className={`p-4 rounded-2xl shadow-xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'charcoal-bg border border-white/5 text-gray-200 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-blue-400" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 text-gray-400 animate-pulse italic text-sm">
                Reasoning with Gemini 3 Pro...
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="p-6 bg-white/5 border-t border-white/5">
        <div className="flex items-center space-x-3 bg-black/40 p-2 rounded-xl border border-white/10 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all shadow-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about manipulation tactics or digital safety..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 placeholder:text-gray-600"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 shadow-lg shadow-blue-900/40"
          >
            <Send size={18} />
          </button>
        </div>
        
        <div className="mt-4 flex flex-col items-center space-y-3">
           <div className="flex items-center justify-center space-x-4 opacity-30">
             <div className="flex items-center space-x-1">
               <Info size={10} />
               <span className="text-[10px] font-bold uppercase tracking-widest">National Defense Layer</span>
             </div>
             <div className="flex items-center space-x-1">
               <Info size={10} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Neural Privacy</span>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatAssistant;
