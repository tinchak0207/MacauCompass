import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, Mic, Video, MicOff } from 'lucide-react';
import GlassCard from './GlassCard';
import { streamBoardroomInsights } from '../services/geminiService';
import { ChatMessage } from '../types';
import { fetchMarketData } from '../services/dataService';

const Boardroom: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: '您好，歡迎進入董事會會議室。我是您的戰略顧問。您可以直接提問，例如：「皇朝區租金3萬做外賣能回本嗎？」或「這個店面的動線有什麼問題？」',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataContext, setDataContext] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initData = async () => {
      try {
        const stats = await fetchMarketData();
        const context = `
          Current Market Context (Real-time Data):
          - Latest Reporting Month: ${stats.latestMonthStr}
          - New Company Registrations: ${stats.newCompaniesCurrent} (Growth: ${stats.newCompaniesGrowth.toFixed(1)}%)
          - Recent Trademark Applications Trend: ${stats.trademarkHistory.slice(-3).map((t) => `${t.month}: ${t.applications}`).join(', ')}
        `;
        setDataContext(context);
      } catch (e) {
        console.log('Could not load live context for AI, continuing without it.');
      }
    };
    initData();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      setMessages((prev) => [...prev, { role: 'model', text: '', isStreaming: true }]);

      let filteredMessages = messages
        .filter((m) => m.text.trim() !== '' && !m.isStreaming)
        .map((m) => ({ role: m.role, text: m.text }));

      while (filteredMessages.length > 0 && filteredMessages[0].role === 'model') {
        filteredMessages = filteredMessages.slice(1);
      }

      const apiHistory = filteredMessages;

      const finalPrompt = dataContext
        ? `[System Context: ${dataContext}]\n\nUser Question: ${userMessage.text}`
        : userMessage.text;

      let stream;
      try {
        stream = await streamBoardroomInsights(finalPrompt, apiHistory);
      } catch (streamInitError) {
        console.error('Error initiating stream:', streamInitError);
        throw streamInitError;
      }

      let fullText = '';

      try {
        for await (const chunk of stream) {
          try {
            const chunkText = chunk?.text;
            if (chunkText) {
              fullText += chunkText;

              setMessages((prev) => {
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
            console.error('Error processing chunk:', chunkError);
          }
        }
      } catch (iterationError) {
        console.error('Error iterating stream:', iterationError);
        throw iterationError;
      }

      setMessages((prev) => {
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
      setError('抱歉，連線不穩定，請檢查您的網絡或稍後再試。');
      setMessages((prev) => {
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

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      alert('語音功能需要瀏覽器支援 Web Speech API，目前僅提供文字輸入版本。');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-3xl font-serif font-bold text-white mb-2">董事會會議室</h2>
        <p className="text-gray-400 text-sm">
          全新 AI 戰略顧問 - 未來支援即時語音通話與視覺輸入
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <GlassCard className="flex flex-col h-full p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[85%] rounded-2xl p-4 shadow-lg
                      ${
                        msg.role === 'user'
                          ? 'bg-emerald-600/30 border border-emerald-500/30 text-emerald-50'
                          : 'bg-white/5 border border-white/10 text-gray-200'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] uppercase tracking-wider font-bold">
                      {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                      {msg.role === 'user' ? '您' : 'Strategy Partner'}
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

            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex gap-2 relative">
                <button
                  onClick={toggleVoiceInput}
                  className={`p-3 rounded-xl transition-colors ${
                    isListening
                      ? 'bg-red-600 text-white'
                      : 'bg-black/30 text-gray-400 hover:text-white'
                  }`}
                  title="語音輸入（實驗）"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="在此輸入問題（例如：這裏租金3萬，做外賣能不能回本？）"
                  className="flex-1 bg-black/30 text-white placeholder-gray-500 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="p-3 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="text-center mt-2">
                <p className="text-[10px] text-gray-500">
                  AI 可能會產生錯誤。重要商業決定請務必查核政府官方來源。
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Side Panel - Quick Actions */}
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Video className="w-4 h-4" />
              即時輸入（即將推出）
            </h3>
            <div className="space-y-3">
              <button
                disabled
                className="w-full py-3 px-4 rounded-xl border border-white/10 text-gray-500 text-sm text-left opacity-50 cursor-not-allowed"
              >
                📷 開啟攝像頭（視覺分析）
              </button>
              <button
                disabled
                className="w-full py-3 px-4 rounded-xl border border-white/10 text-gray-500 text-sm text-left opacity-50 cursor-not-allowed"
              >
                📍 分享當前位置
              </button>
              <button
                disabled
                className="w-full py-3 px-4 rounded-xl border border-white/10 text-gray-500 text-sm text-left opacity-50 cursor-not-allowed"
              >
                📂 上傳圖片（店舖評估）
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4">快速諮詢模板</h3>
            <div className="space-y-2 text-xs">
              {[
                '這個地段適合開咖啡店嗎？',
                '租金佔營收多少算健康？',
                '澳門餐飲牌照如何申請？',
                '中小企政府資助有哪些？',
              ].map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(template)}
                  className="w-full text-left py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>
          </GlassCard>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <p className="text-xs text-amber-200/80 leading-relaxed">
              <strong className="text-amber-300">V2 正式版預告</strong>：下一版將支援
              Gemini Live API 全雙工語音通話、WebRTC 視訊輸入及可打斷的自然對話。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Boardroom;
