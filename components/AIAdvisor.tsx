import React, { useState, useRef, useEffect } from 'react';
import { Transaction } from '../types';
import { analyzeFinances } from '../services/geminiService';
import { Sparkles, Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getSettings } from '../services/storage';

interface AIAdvisorProps {
  transactions: Transaction[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions }) => {
  const settings = getSettings();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `Hello! I am your BeigeLedger financial assistant. I see your preferred currency is ${settings.currency}. Ask me about your spending habits!` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Append context about default currency to the prompt invisibly
      const promptWithContext = `${userMsg} (Note: My preferred base currency is ${settings.currency}. Please provide analysis in this currency where possible.)`;
      const response = await analyzeFinances(transactions, promptWithContext);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error analyzing your data." }]);
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
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-beige-100 overflow-hidden">
      <div className="p-4 border-b border-beige-100 bg-beige-50 flex items-center">
        <Sparkles className="text-beige-600 mr-2" size={20} />
        <h2 className="text-lg font-bold text-beige-800">Financial Advisor <span className="text-xs font-normal text-beige-500 ml-2">Powered by Gemini</span></h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-beige-500 text-white rounded-tr-none' 
                  : 'bg-beige-50 text-gray-800 rounded-tl-none border border-beige-100'
              }`}
            >
              {msg.role === 'ai' ? (
                <div className="markdown-prose">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-beige-50 p-4 rounded-2xl rounded-tl-none border border-beige-100 flex items-center space-x-2">
                <Bot className="animate-bounce text-beige-400" size={16} />
                <span className="text-xs text-beige-400">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-beige-100 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances..."
            className="w-full pl-4 pr-12 py-3 bg-beige-50 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-beige-400 text-gray-700 placeholder-beige-300"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-beige-500 text-white rounded-lg hover:bg-beige-600 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;