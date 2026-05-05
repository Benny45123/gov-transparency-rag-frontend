'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Search, Send, ShieldCheck } from 'lucide-react';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
  isLoadingSources?: boolean;
}

export function QueryInput({
  onSubmit,
  isLoading,
  placeholder = 'Ask about the case files...',
  isLoadingSources = false,
}: QueryInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input);
      setInput('');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-4xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <div 
        className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
          isLoadingSources 
            ? 'border border-cyan-400/50 bg-cyan-950/10 shadow-[0_0_26px_rgba(6,182,212,0.12)]' 
            : 'border border-amber-400/30 bg-zinc-950/80 shadow-[0_0_26px_rgba(251,191,36,0.08)] hover:border-amber-400/55'
        }`}
      >
        <motion.div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/80 to-transparent"
          animate={{ x: isLoading ? ['-100%', '100%'] : '0%' }}
          transition={{ duration: 1.4, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
        />

        <div className="pointer-events-none absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2">
          <Search className={isLoadingSources ? 'text-cyan-300' : 'text-amber-300'} size={18} />
          {!input && (
            <motion.span 
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="mt-1 font-terminal text-lg leading-none text-amber-300"
            >
              _
            </motion.span>
          )}
        </div>
  
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={input ? '' : placeholder}
          disabled={isLoading}
          className="w-full bg-black/30 py-5 pl-14 pr-32 font-terminal text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none disabled:cursor-wait disabled:opacity-70"
        />
  
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-3">
          {isLoading && (
            <motion.div
              className="w-4 h-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-full h-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400 rounded-full" />
            </motion.div>
          )}
          
          <motion.button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send query"
            className={`inline-flex h-9 items-center gap-2 rounded border px-3 font-terminal text-xs font-bold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              isLoadingSources 
                ? 'border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10' 
                : 'border-amber-400/30 text-amber-300 hover:bg-amber-400/10'
            }`}
            whileHover={!isLoading ? { scale: 1.05 } : {}}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
          >
            {isLoading ? <ShieldCheck size={14} /> : <Send size={14} />}
            <span className="hidden sm:inline">{isLoading ? 'Processing' : 'Search'}</span>
          </motion.button>
        </div>
      </div>
  
      <motion.p
        className="mt-3 text-center font-terminal text-[10px] uppercase tracking-[0.2em] text-zinc-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Epstein court records <span className="mx-2 text-zinc-800">/</span> cached retrieval <span className="mx-2 text-zinc-800">/</span> cited source trail
      </motion.p>
    </motion.form>
  );
}
