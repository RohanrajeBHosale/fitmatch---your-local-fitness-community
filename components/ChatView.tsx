
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, ChevronLeft, Info, Sparkles } from 'lucide-react';
import { User, ChatMessage } from '../types';
import { storageService } from '../services/storage';
import { geminiService } from '../services/gemini';
import { firebaseService, isFirebaseEnabled } from '../services/firebase';

interface ChatViewProps {
  buddy: User;
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ buddy, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const me = storageService.getSessionUser();
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatId = useMemo(() => {
    if (!me) return '';
    return [me.id, buddy.id].sort().join('_');
  }, [me, buddy]);

  useEffect(() => {
    if (!me || !chatId) return;

    // Local messages init
    const saved = storageService.getChats(me.id, buddy.id);
    setMessages(saved);

    // Firebase realtime sync
    if (isFirebaseEnabled) {
      const unsubscribe = firebaseService.listenToChat(chatId, (cloudMessages) => {
        setMessages(cloudMessages);
        // Persist to local for offline
        localStorage.setItem(`fitmatch_chats_${me.id}_${buddy.id}`, JSON.stringify(cloudMessages));
      });
      return () => unsubscribe();
    }
  }, [buddy, me, chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const fetchIcebreaker = async () => {
      const res = await geminiService.getIcebreaker(buddy);
      setSuggestion(res);
    };
    fetchIcebreaker();
  }, [buddy]);

  const handleSend = async (text: string = input) => {
    if (!me) return;
    const val = text || input;
    if (!val.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: me.id,
      text: val,
      timestamp: new Date()
    };
    
    // Optimistic update
    setMessages(prev => [...prev, newMessage]);
    await storageService.saveChat(me.id, buddy.id, newMessage);
    
    setInput('');
    setSuggestion(null);
  };

  return (
    <div className="flex flex-col h-full bg-white fixed inset-0 z-[160] max-w-md mx-auto animate-in slide-in-from-right duration-300">
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full">
            <ChevronLeft className="w-6 h-6 text-slate-900" />
          </button>
          <div className="flex items-center gap-3">
            <img src={buddy.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
            <div>
              <h3 className="font-black text-slate-900 leading-none">{buddy.name}</h3>
              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1 block">Active Partner</span>
            </div>
          </div>
        </div>
        <Info className="w-5 h-5 text-slate-300" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 hide-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No messages yet</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderId === me?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3 rounded-[24px] text-sm font-medium shadow-sm ${
              m.senderId === me?.id ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border-t border-slate-100 space-y-4 shrink-0">
        {suggestion && (
          <button 
            onClick={() => handleSend(suggestion)}
            className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-start gap-3 text-left group animate-in slide-in-from-bottom-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">AI Icebreaker</span>
              <p className="text-xs text-slate-700 font-semibold italic">"{suggestion}"</p>
            </div>
          </button>
        )}
        
        <div className="flex gap-3 items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write a message..."
            className="flex-1 bg-slate-100 border-none rounded-[20px] px-6 py-4 text-sm font-bold outline-none"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className={`p-4 rounded-[20px] transition-all ${input.trim() ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-300'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
