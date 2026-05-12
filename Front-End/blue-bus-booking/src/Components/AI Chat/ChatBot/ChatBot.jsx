import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Minus, Maximize2, Trash2 } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem('chatIsOpen') === 'true';
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [
      {
        role: 'bot',
        content: 'Hello! I am your BlueBus AI assistant. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem('chatSessionId');
    if (saved) return saved;
    const newId = crypto.randomUUID();
    localStorage.setItem('chatSessionId', newId);
    return newId;
  });
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearChat = () => {
    const welcomeMessage = [
      {
        role: 'bot',
        content: 'Hello! I am your BlueBus AI assistant. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setChatHistory(welcomeMessage);
    localStorage.removeItem('chatHistory');
    const newId = crypto.randomUUID();
    setSessionId(newId);
    localStorage.setItem('chatSessionId', newId);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('chatIsOpen', isOpen);
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    setLoading(true);

    try {
      // Correctly fetch userId from localStorage
      const userId = localStorage.getItem('userId');

      const response = await axios.post('http://localhost:8080/api/ai/chat/message', {
        message: currentMessage,
        sessionId: sessionId,
        userId: userId
      });

      if (response.data.success) {
        const botResponse = {
          role: 'bot',
          content: response.data.data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: response.data.data.intent
        };
        setChatHistory(prev => [...prev, botResponse]);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setChatHistory(prev => [...prev, {
        role: 'bot',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-[0_8px_25px_rgba(37,99,235,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        >
          <div className="absolute -top-2 -right-1 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">
            AI
          </div>
          <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 transition-all duration-500 ease-out flex flex-col ${
            isMinimized 
              ? 'w-72 h-14 rounded-2xl' 
              : 'w-[400px] h-[600px] rounded-[2.5rem]'
          }`}
        >
          {/* Header */}
          <div className={`p-5 flex items-center justify-between border-b border-gray-50 bg-white/80 backdrop-blur-md rounded-t-[2.5rem] ${isMinimized ? 'h-full' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Sparkles size={20} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
                  BlueBus Concierge
                </h3>
                {!isMinimized && <p className="text-[9px] font-black text-green-600 uppercase tracking-[0.2em]">Always Online</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <button 
                  onClick={handleClearChat}
                  title="Clear Conversation"
                  className="w-8 h-8 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div 
                className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/30 custom-scrollbar"
                ref={chatContainerRef}
              >
                {chatHistory.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                        msg.role === 'user' ? 'bg-white text-blue-600 border border-blue-50' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                      }`}>
                        {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                      </div>
                      <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium shadow-sm transition-all duration-300 hover:shadow-md ${
                          msg.role === 'user' 
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none' 
                            : msg.isError 
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none ring-1 ring-black/5'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start animate-in fade-in duration-300">
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Loader2 size={14} className="animate-spin" />
                      </div>
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white rounded-b-[2.5rem] border-t border-gray-50">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask about trips, routes or seats..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 pr-12 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-gray-400"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none opacity-50">
                       <Sparkles size={16} />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!message.trim() || loading}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 text-white rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-blue-100"
                  >
                    <Send size={18} />
                  </button>
                </form>
                <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-4">
                  Powered by BlueBus Intelligence
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;
