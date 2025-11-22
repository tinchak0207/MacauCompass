import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import { streamBusinessAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import { fetchMarketData } from '../services/dataService';

const PolicyAdvisor: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '您好！我是您的澳門商業顧問 AI。我已連接 DSEDT (經科局) 與 DSEC 知識庫。請問今天想查詢關於公司註冊、稅務還是政府資助的資訊？' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataContext, setDataContext] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load data context on mount to prepare AI
  useEffect(() => {
    const initData = async () => {
      try {
        const stats = await fetchMarketData();
        const context = `
          Current Market Context (Real-time Data):
          - Latest Reporting Month: ${stats.latestMonthStr}
          - New Company Registrations: ${stats.newCompaniesCurrent} (Growth: ${stats.newCompaniesGrowth.toFixed(1)}%)
          - Recent Trademark Applications Trend: ${stats.trademarkHistory.slice(-3).map(t => `${t.month}: ${t.applications}`).join(', ')}
        `;
        setDataContext(context);
      } catch (e) {
        console.log("Could not load live context for AI, continuing without it.");
      }
    };
    initData();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    // Optimistically update UI with user message
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Add placeholder for model response
      setMessages(prev => [...prev, { role: 'model', text: '', isStreaming: true }]);

      // Prepare history for API (exclude the current message we are about to send)
      // Note: 'messages' here refers to the state at the beginning of handleSend,
      // so it naturally excludes the userMessage we just added via setMessages updater.
      // We also filter out any empty messages or previous streaming errors to keep the context clean.
      // Gemini API requires history to start with a user turn, so skip initial model messages.
      let filteredMessages = messages
        .filter(m => m.text.trim() !== '' && !m.isStreaming)
        .map(m => ({role: m.role, text: m.text}));

      // Skip any leading model messages to ensure history starts with user
      while (filteredMessages.length > 0 && filteredMessages[0].role === 'model') {
        filteredMessages = filteredMessages.slice(1);
      }

      const apiHistory = filteredMessages;

      // Inject data context into the prompt if available
      const finalPrompt = dataContext
        ? `[System Context: ${dataContext}] \n\n User Question: ${userMessage.text}`
        : userMessage.text;

      // Call Gemini API
      let stream;
      try {
        stream = await streamBusinessAdvice(finalPrompt, apiHistory);
      } catch (streamInitError) {
        console.error("Error initiating stream:", streamInitError);
        throw streamInitError;
      }
      
      let fullText = '';
      
      try {
        for await (const chunk of stream) {
          try {
            const chunkText = chunk?.text;
            if (chunkText) {
                fullText += chunkText;
                
                setMessages(prev => {
                  const newArr = [...prev];
                  const lastIndex = newArr.length - 1;
                  if (lastIndex >= 0) {
                    const lastMsg = { ...newArr[lastIndex] };
                    if (lastMsg.role === 'model' && lastMsg.isStreaming) {
                        lastMsg.text = fullText;
                        newArr[lastIndex] = lastMsg;
                    }
                  }
                  return newArr;
                });
            }
          } catch (chunkError) {
            console.error("Error processing chunk:", chunkError);
            // Continue processing remaining chunks
          }
        }
      } catch (iterationError) {
        console.error("Error iterating stream:", iterationError);
        throw iterationError;
      }

      // Finalize message state
      setMessages(prev => {
        const newArr = [...prev];
        const lastIndex = newArr.length - 1;
        if (lastIndex >= 0) {
            const lastMsg = { ...newArr[lastIndex] };
            lastMsg.isStreaming = false;
            newArr[lastIndex] = lastMsg;
        }
        return newArr;
      });

    } catch (err) {
      console.error(err);
      setError("抱歉，連線不穩定，請檢查您的網絡或稍後再試。");
      // Remove the loading placeholder if error occurred
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.isStreaming) {
            return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-serif font-bold text-white mb-2">AI 政策顧問</h2>
        <p className="text-gray-400 text-sm">查詢關於澳門商法典、牌照申請或稅務優惠。</p>
      </div>

      <GlassCard className="flex-1 flex flex-col min-h-0 p-0">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] rounded-2xl p-4 shadow-lg
                ${msg.role === 'user' 
                  ? 'bg-emerald-600/30 border border-emerald-500/30 text-emerald-50' 
                  : 'bg-white/5 border border-white/10 text-gray-200'}
              `}>
                <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] uppercase tracking-wider font-bold">
                  {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                  {msg.role === 'user' ? '您' : 'Macau Compass AI'}
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'model' && (
             <div className="flex justify-start">
               <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-2">
                 <Loader2 className="animate-spin w-4 h-4 text-emerald-400" />
                 <span className="text-sm text-gray-400">思考中...</span>
               </div>
             </div>
          )}
          {error && (
             <div className="flex justify-center mt-4">
               <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2">
                 <AlertCircle size={16} />
                 {error}
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="在此輸入問題（例如：如何在澳門註冊商標？）"
              className="w-full bg-black/30 text-white placeholder-gray-500 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-gray-500">AI 可能會產生錯誤。重要商業決定請務必查核政府官方來源。</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default PolicyAdvisor;