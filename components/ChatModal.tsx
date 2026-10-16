import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './chat.css';
import { sendChatMessage, ChatMessage, FinancialContext } from '../services/chatService';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: FinancialContext;
}

const WELCOME_CONTENT =
  "Bonjour ! Je suis votre conseiller IA ComptaExpert. Je peux vous aider sur la comptabilité, les charges sociales, la fiscalité ou l'utilisation de l'application. Comment puis-je vous aider ?";

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, context }) => {
  const [displayMessages, setDisplayMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: WELCOME_CONTENT },
  ]);
  const [apiMessages, setApiMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, isLoading]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    setDisplayMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const nextApiMessages = [...apiMessages, userMsg];
    setApiMessages(nextApiMessages);

    try {
      const reply = await sendChatMessage(nextApiMessages, context);
      const assistantMsg: ChatMessage = { role: 'assistant', content: reply };
      setDisplayMessages(prev => [...prev, assistantMsg]);
      setApiMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setDisplayMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Désolé, une erreur est survenue. Veuillez réessayer.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, apiMessages, context]);

  if (!isOpen) return null;

  return (
    <>
      <div
        role="presentation"
        className="chat-backdrop fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Conseiller IA ComptaExpert"
          className="chat-modal-card bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col h-[75vh] max-h-[640px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <i className="fas fa-robot text-white text-sm" aria-hidden="true"></i>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Conseiller IA</h2>
                <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                  En ligne · Propulsé par Claude
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer le chat"
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" aria-live="polite">
            {displayMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-robot text-indigo-600 text-xs" aria-hidden="true"></i>
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm text-sm leading-relaxed'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div className="chat-md">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-indigo-600 text-xs" aria-hidden="true"></i>
                </div>
                <div className="bg-slate-100 px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full block"></span>
                  <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full block"></span>
                  <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full block"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
            <form
              onSubmit={e => { e.preventDefault(); void handleSend(); }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Posez votre question..."
                maxLength={1000}
                aria-label="Message au conseiller IA"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Envoyer le message"
                className="bg-indigo-600 text-white rounded-xl px-4 py-2.5 hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <i className="fas fa-paper-plane text-sm" aria-hidden="true"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatModal;
