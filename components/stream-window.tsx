'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { RadioTower, Terminal, TriangleAlert } from 'lucide-react';

interface StreamWindowProps {
  isLoading: boolean;
  content: string;
  error?: string | null;
}

export function StreamWindow({ isLoading, content, error }: StreamWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <motion.div
      className="relative flex h-full min-h-[360px] flex-col overflow-hidden rounded-lg border border-cyan-400/30 bg-zinc-950/80 shadow-[0_0_34px_rgba(8,145,178,0.08)]"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/10 to-transparent"
        animate={{ opacity: isLoading ? [0.35, 0.8, 0.35] : 0.35 }}
        transition={{ duration: 2.4, repeat: Infinity }}
      />

      <div className="relative border-b border-cyan-400/15 bg-black/70 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <motion.div
              className="flex h-8 w-8 items-center justify-center rounded border border-cyan-400/30 bg-cyan-400/5 text-cyan-300"
              animate={{
                boxShadow: isLoading
                  ? [
                      '0 0 0 rgba(34, 211, 238, 0)',
                      '0 0 18px rgba(34, 211, 238, 0.24)',
                      '0 0 0 rgba(34, 211, 238, 0)',
                    ]
                  : '0 0 0 rgba(34, 211, 238, 0)',
              }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <RadioTower size={16} />
            </motion.div>
            <div>
              <p className="font-terminal text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Live Deposition Stream
              </p>
              <p className="font-terminal text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                RAG token relay
              </p>
            </div>
          </div>
          <span className="font-terminal text-[10px] uppercase tracking-[0.16em] text-cyan-500/80">
            {isLoading ? 'receiving' : content ? 'complete' : 'standby'}
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent"
      >
        <div className="min-h-full bg-[linear-gradient(rgba(34,211,238,0.035)_1px,transparent_1px)] bg-[length:100%_32px] px-5 py-6 font-terminal text-sm leading-7 text-zinc-100">
          {error ? (
            <motion.div
              className="flex items-start gap-3 rounded border border-red-500/30 bg-red-500/10 p-4 text-red-200"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TriangleAlert className="mt-0.5 shrink-0 text-red-400" size={18} />
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-red-400">
                  Backend Error
                </p>
                <p className="text-xs text-red-100/80">{error}</p>
              </div>
            </motion.div>
          ) : content ? (
            <motion.div
              className="whitespace-pre-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {content}
              {isLoading && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block text-cyan-400"
                >
                  ▌
                </motion.span>
              )}
            </motion.div>
          ) : isLoading ? (
            <motion.div
              className="space-y-3 text-amber-300"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div>[OPENING COURT RECORD INDEX]</div>
              <div className="text-zinc-500">&gt; Matching docket fragments</div>
              <div className="text-zinc-500">&gt; Checking retrieval cache</div>
              <div className="text-zinc-500">&gt; Streaming answer tokens</div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-3 text-zinc-600">
              <Terminal size={16} />
              <span>&gt; Awaiting records query...</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-cyan-400/15 bg-black/70 px-5 py-3 font-terminal text-xs text-zinc-500">
        <div className="flex items-center justify-between gap-3">
        <span>{content.length} chars</span>
        <span className="text-cyan-600">
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ▓▓▓▓▓▓▓▓▓▓
          </motion.span>
        </span>
        </div>
      </div>
    </motion.div>
  );
}
