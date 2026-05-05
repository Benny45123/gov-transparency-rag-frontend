'use client';

import { motion } from 'framer-motion';
import { DatabaseZap, FileLock2, ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      className="z-30 w-full border-b border-amber-400/20 bg-black/85 backdrop-blur-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <motion.div
              className="relative mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded border-2 border-amber-400 bg-amber-400/5 text-amber-300"
              animate={{
                boxShadow: [
                  'inset 0 0 0px rgba(251, 191, 36, 0)',
                  'inset 0 0 14px rgba(251, 191, 36, 0.24)',
                  'inset 0 0 0px rgba(251, 191, 36, 0)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <FileLock2 size={22} />
              <div className="absolute inset-0 scale-75 animate-pulse border border-amber-400/20" />
            </motion.div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-terminal text-xl font-bold uppercase tracking-[0.15em] text-amber-400 sm:text-2xl">
                  Epstein Records Terminal
                </h1>
                <span className="rounded border border-amber-400/30 px-2 py-0.5 font-terminal text-[9px] uppercase tracking-[0.12em] text-amber-400">
                  API v1 compatible
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 font-terminal text-[11px] uppercase tracking-widest text-zinc-500">
                <span className="font-bold text-amber-400/70">Public records RAG</span>
                <span className="opacity-30">/</span>
                <span>source-cited answers</span>
                <span className="opacity-30">/</span>
                <span>multi-turn case context</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end">
            <div className="flex items-center gap-3 rounded-sm border border-green-500/20 bg-green-500/5 px-3 py-1">
              <div className="relative">
                <div className="absolute h-2 w-2 animate-ping rounded-full bg-green-500 opacity-75" />
                <div className="relative h-2 w-2 rounded-full bg-green-500" />
              </div>
              <span className="font-terminal text-[10px] font-bold uppercase tracking-widest text-green-500">
                Backend Ready
              </span>
            </div>
            
            <div className="flex flex-wrap gap-3 font-terminal text-[9px] uppercase tracking-[0.16em] text-zinc-600">
              <span className="inline-flex items-center gap-1">
                <DatabaseZap size={11} />
                Pinecone
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={11} />
                Cache enabled
              </span>
            </div>
          </div>

        </div>
      </div>
      
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
    </motion.header>
  );
}
