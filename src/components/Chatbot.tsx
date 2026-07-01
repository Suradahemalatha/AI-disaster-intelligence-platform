import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { 
  Bot, User, Send, Siren, HelpCircle, Loader2, Sparkles, AlertCircle, 
  Flame, Droplets, ShieldAlert
} from 'lucide-react';

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: `### 🤖 AI Disaster Response Chatbot

Greetings. I am the **Cognitive Emergency Operations Chatbot** integrated with Gemini Intelligence.

I can guide you with:
* **Tactical Escape Routes**: Ask what to do for immediate hazard types.
* **Emergency Kit Preparation**: Ask for essential supply checklists.
* **Emergency Medicine**: Guidance on primary triage under isolation.

*How may I assist your preparedness or emergency response efforts today?*`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-msg-${Date.now()}`,
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10) // Send last 10 messages for context
        })
      });

      if (!response.ok) {
        throw new Error('Chat service unavailable.');
      }

      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: `ai-msg-${Date.now()}`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-msg-${Date.now()}`,
        sender: 'ai',
        text: `### 🚨 Operational Connection Timeout\n\nI could not communicate with the Gemini cognitive servers. Please proceed immediately to high ground or consult local emergency FM channels if under threat.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Simple, elegant parser to render markdown bullets, headings and bold lines beautifully in Tailwind
  const renderMarkdownText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('###')) {
        return <h4 key={idx} className="text-sm font-bold text-slate-100 mt-3 mb-1">{trimmed.replace('###', '').trim()}</h4>;
      }
      if (trimmed.startsWith('##')) {
        return <h3 key={idx} className="text-base font-bold text-slate-100 mt-4 mb-1.5">{trimmed.replace('##', '').trim()}</h3>;
      }
      if (trimmed.startsWith('#')) {
        return <h2 key={idx} className="text-lg font-bold text-slate-100 mt-5 mb-2">{trimmed.replace('#', '').trim()}</h2>;
      }

      // Bullet points
      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const rawContent = trimmed.substring(1).trim();
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 text-xs my-1 leading-relaxed">
            {parseBoldText(rawContent)}
          </li>
        );
      }

      // Numbered lists
      if (/^\d+\./.test(trimmed)) {
        const match = trimmed.match(/^(\d+\.)(.*)/);
        if (match) {
          return (
            <div key={idx} className="ml-4 text-slate-300 text-xs my-1 leading-relaxed flex gap-1.5">
              <span className="font-bold text-red-400 shrink-0">{match[1]}</span>
              <span>{parseBoldText(match[2].trim())}</span>
            </div>
          );
        }
      }

      // Standard text line
      return trimmed === '' ? (
        <div key={idx} className="h-2" />
      ) : (
        <p key={idx} className="text-slate-300 text-xs leading-relaxed my-1">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  const parseBoldText = (raw: string) => {
    const parts = raw.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-red-400 font-bold">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[560px] font-sans">
      
      {/* Left Block: Chat messages */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden">
        
        {/* Chat header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-950/40 border border-red-900/40 rounded-xl text-red-500">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-slate-100 font-bold text-sm flex items-center gap-1.5">
                Gemini Cognitive Assistant
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </h3>
              <p className="text-slate-500 text-[11px]">Authorized Emergency Dispatch Intelligence</p>
            </div>
          </div>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest border border-slate-800 px-2 py-0.5 rounded">
            TLS v1.3 SECURE
          </span>
        </div>

        {/* Message threads */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex gap-3 max-w-[85%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div className={`p-2 rounded-xl border shrink-0 h-9 w-9 flex items-center justify-center ${
                m.sender === 'user' 
                  ? 'bg-red-950/20 border-red-900/30 text-red-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`p-4 rounded-2xl border ${
                m.sender === 'user'
                  ? 'bg-red-600 border-red-500 text-slate-100 shadow-lg shadow-red-900/10'
                  : 'bg-slate-900 border-slate-800 text-slate-300 space-y-1'
              }`}>
                {m.sender === 'user' ? (
                  <p className="text-xs font-semibold leading-relaxed">{m.text}</p>
                ) : (
                  <div>{renderMarkdownText(m.text)}</div>
                )}
                <div className={`text-[9px] mt-2 font-mono text-right opacity-40 ${
                  m.sender === 'user' ? 'text-slate-200' : 'text-slate-500'
                }`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="p-2 rounded-xl border shrink-0 bg-slate-900 border-slate-800 text-slate-300 h-9 w-9 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-2 text-slate-500 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                <span>Gemini is compiling safety drill instructions...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2 shrink-0"
        >
          <input
            type="text"
            required
            placeholder="Type your emergency query (e.g. Flood safety evacuation checklist)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-slate-100 font-bold px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>

      </div>

      {/* Right Block: Sidebar Guidelines */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-full overflow-hidden">
        <div className="space-y-4">
          <h4 className="text-slate-100 font-bold text-sm border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-red-400" />
            Tactical Quick Drills
          </h4>
          <p className="text-slate-500 text-xs">Click any topic to dispatch a direct Gemini preparedness blueprint query:</p>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <button
              onClick={() => handleQuickPrompt("Checklist of essential supplies for a 72-hour family emergency kit")}
              className="w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-3 text-xs text-slate-300 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <span>🎒 Emergency Kit Checklist</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-red-400 group-hover:scale-110 transition-all" />
            </button>

            <button
              onClick={() => handleQuickPrompt("What immediate safety steps should I follow if sudden flash flooding hits my house?")}
              className="w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-3 text-xs text-slate-300 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <span>🌊 Flash Flood Escape Plan</span>
              <Droplets className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 group-hover:scale-110 transition-all" />
            </button>

            <button
              onClick={() => handleQuickPrompt("Wildfire pre-evacuation preparation checklist when a fire front is in the county")}
              className="w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-3 text-xs text-slate-300 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <span>🔥 Wildfire Defense Prep</span>
              <Flame className="w-3.5 h-3.5 text-slate-600 group-hover:text-orange-400 group-hover:scale-110 transition-all" />
            </button>

            <button
              onClick={() => handleQuickPrompt("What are the primary survival guidelines for earthquakes inside a concrete structure?")}
              className="w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-3 text-xs text-slate-300 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <span>🫨 Concrete Building Tremor Plan</span>
              <Siren className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 group-hover:scale-110 transition-all" />
            </button>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex gap-2 text-[10.5px] text-slate-500 leading-normal shrink-0">
          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>
            This cognitive dispatcher operates as a guidance tool. Human authority channels (EOC broadcasts, FM channels) always take priority over AI suggestions.
          </span>
        </div>
      </div>

    </div>
  );
}
