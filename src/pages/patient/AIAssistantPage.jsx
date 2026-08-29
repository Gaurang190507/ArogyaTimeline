import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  Bot, 
  User, 
  RefreshCw, 
  ShieldAlert, 
  HelpCircle,
  Loader2 
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { aiService } from '../../services/aiService';
import { AIMessage } from '../../components/ai/AIMessage';
import { AISuggestion } from '../../components/ai/AISuggestion';
import { VoiceInput } from '../../components/common/VoiceInput';
import { defaultAiGreetings } from '../../data/mockAiResponses';

export const AIAssistantPage = () => {
  const { records } = useHealth();
  const { t } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "msg_init_1",
      sender: "ai",
      text: defaultAiGreetings[0],
    },
    {
      id: "msg_init_2",
      sender: "ai",
      text: defaultAiGreetings[1],
      followUp: {
        question: "Here are some quick topics you can ask me about:",
        options: [
          "How has my blood pressure changed this month?",
          "Prepare me for my next doctor visit.",
          "What medicines have I recorded?",
          "Why has my blood sugar been fluctuating recently?"
        ]
      }
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (queryText) => {
    const query = (queryText || inputQuery).trim();
    if (!query) return;

    // Append user message
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const response = await aiService.askAssistant(query, records);
      
      const aiMsg = {
        id: response.id || `ai_${Date.now()}`,
        sender: 'ai',
        text: response.aiResponse,
        disclaimer: response.disclaimer,
        followUp: response.followUp
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: "I couldn't process that query against your health memory. Please try again or select one of the suggested prompts.",
          disclaimer: "Informational assistant only."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionSelect = (optionText) => {
    handleSend(optionText);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg_${Date.now()}`,
        sender: "ai",
        text: "Health Memory Assistant reset. How can I help you explore your recorded health timeline?",
        followUp: {
          question: "Suggested queries:",
          options: [
            "How has my blood pressure changed this month?",
            "Prepare me for my next doctor visit.",
            "What medicines have I recorded?"
          ]
        }
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[560px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-health-700 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Health Memory Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {t.ai.title}
          </h1>
          <p className="text-xs text-slate-500">
            {t.ai.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearChat}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          title="Reset Conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Questions Carousel / Chips */}
      <div className="py-3 shrink-0 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {t.ai.suggestedQueries.map((query, idx) => (
          <AISuggestion
            key={idx}
            query={query}
            onClick={(q) => handleSend(q)}
          />
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
        {messages.map((msg) => (
          <AIMessage
            key={msg.id}
            message={msg}
            onOptionSelect={handleOptionSelect}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-health-50 text-health-600 flex items-center justify-center border border-health-200">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs text-slate-500 font-medium">
              Searching your personal health records and vitals...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area with Voice Simulation */}
      <div className="pt-3 border-t border-slate-200 shrink-0 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about your vitals, doctor visits, symptoms, or medications..."
              className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-health-500 focus:outline-none shadow-xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <VoiceInput
                compact={true}
                onResult={(speech) => handleSend(speech)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="w-12 h-12 rounded-2xl bg-health-600 hover:bg-health-700 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-health-600/20 transition-all shrink-0 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center truncate px-2">
          {t.ai.disclaimer}
        </p>
      </div>
    </div>
  );
};
