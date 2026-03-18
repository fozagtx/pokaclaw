'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import type { ChatMessage } from '@/lib/polkadot-agent/types';

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')           // headings
    .replace(/\*\*(.+?)\*\*/g, '$1')       // bold
    .replace(/\*(.+?)\*/g, '$1')           // italic
    .replace(/__(.+?)__/g, '$1')           // bold alt
    .replace(/_(.+?)_/g, '$1')             // italic alt
    .replace(/~~(.+?)~~/g, '$1')           // strikethrough
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1') // inline code
    .replace(/^\s*[-*+]\s+/gm, '  - ')     // list items (keep readable)
    .replace(/^\s*\d+\.\s+/gm, (m) => m)   // numbered lists (keep as-is)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^>\s?/gm, '')                // blockquotes
    .replace(/\n{3,}/g, '\n\n');           // excessive newlines
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatPanel({ messages, onSend, isLoading = false }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="bg-[var(--surface-1)] rounded-[30px] p-10 flex flex-col h-[600px]">
      <h3 className="text-[28px] font-bold uppercase leading-[36px] mb-6">
        Chat
      </h3>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-thin">
        {messages.length === 0 && (
          <p className="text-[var(--muted)] text-center mt-20">
            Ask anything about Polkadot, Substrate, or ink! development.
          </p>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`max-w-[85%] rounded-[16px] p-4 ${
              msg.role === 'user'
                ? 'bg-[var(--surface-2)] ml-auto'
                : 'bg-[var(--surface-1)] border-l-2 border-[var(--card-mint)]'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] mb-1">
              {msg.role === 'user' ? 'You' : 'Agent'}
            </p>
            <p className="text-base font-normal leading-6 whitespace-pre-wrap">
              {msg.role === 'assistant' ? stripMarkdown(msg.content) : msg.content}
            </p>
          </motion.div>
        ))}
        {isLoading && (
          <div className="bg-[var(--surface-1)] border-l-2 border-[var(--card-mint)] rounded-[16px] p-4 max-w-[85%]">
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--muted)] mb-1">
              Agent
            </p>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[var(--card-mint)]"
            >
              Thinking...
            </motion.div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Polkadot, Substrate, ink!..."
          className="flex-1 bg-[var(--surface-2)] rounded-full px-5 py-3 text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--yo-yellow)]/50 placeholder:text-[var(--muted)]"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-[var(--yo-yellow)] text-black rounded-full w-12 h-12 flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
