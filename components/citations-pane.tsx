'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, FileSearch, Fingerprint, Scale } from 'lucide-react';

export interface Source {
  source_file: string;
  source_url: string;
  chunk_index: number;
  score: number;
  preview: string;
}

interface CitationsPaneProps {
  sources: Source[];
  isLoading: boolean;
}

export function CitationsPane({ sources, isLoading }: CitationsPaneProps) {
  return (
    <motion.div
      className="relative flex h-full min-h-[360px] flex-col overflow-hidden rounded-lg border border-amber-400/30 bg-zinc-950/80 shadow-[0_0_34px_rgba(217,119,6,0.08)]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="pointer-events-none absolute left-0 top-0 h-full w-px bg-amber-300/50"
        animate={{ opacity: isLoading ? [0.2, 1, 0.2] : 0.35 }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative border-b border-amber-400/15 bg-black/70 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-amber-400/30 bg-amber-400/5 text-amber-300">
              <Scale size={16} />
            </div>
            <div>
              <p className="font-terminal text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                Evidence Citations
              </p>
              <p className="font-terminal text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                Source-backed court record trace
              </p>
            </div>
          </div>
          <span className="font-terminal text-[10px] uppercase tracking-[0.16em] text-amber-500/80">
            {sources.length} linked
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
        <div className="space-y-4 px-5 py-6">
          <AnimatePresence mode="popLayout">
            {sources.length > 0 ? (
              sources.map((source, index) => (
                <motion.div
                  key={`${source.source_file}-${source.chunk_index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.08 }}
                  className="group relative"
                >
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0"
                    animate={{
                      opacity: [0, 0.5, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: index * 0.1,
                      repeat: Infinity,
                    }}
                  />

                  <motion.div
                    className="rounded-lg border border-amber-400/25 bg-black/45 p-4 transition group-hover:border-amber-300/60 group-hover:bg-amber-400/[0.04]"
                    whileHover={{ y: -2 }}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-terminal text-xs font-bold uppercase tracking-[0.12em] text-amber-300">
                          {source.source_file.replace('.pdf', '')}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Fingerprint className="text-amber-500/80" size={12} />
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
                            <motion.div
                              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-cyan-300"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round(source.score * 100)}%` }}
                              transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                            />
                          </div>
                          <span className="font-terminal text-xs text-zinc-500">
                            {Math.round(source.score * 100)}%
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded border border-zinc-800 px-2 py-1 font-terminal text-[10px] uppercase text-zinc-500">
                        Chunk {source.chunk_index}
                      </span>
                    </div>

                    <p className="mb-4 line-clamp-5 border-l border-amber-400/30 pl-3 font-terminal text-xs leading-relaxed text-zinc-300">
                      {source.preview.replace(/\[CONTEXT:[^\]]*\]/g, '').trim()}
                    </p>

                    {source.source_url ? (
                      <motion.a
                        href={source.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-terminal text-xs font-bold uppercase tracking-[0.14em] text-amber-300 transition hover:text-cyan-200"
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Document
                        <ExternalLink size={12} />
                      </motion.a>
                    ) : (
                      <span className="inline-flex items-center gap-2 font-terminal text-xs uppercase tracking-[0.14em] text-zinc-600">
                        <FileSearch size={12} />
                        No public URL
                      </span>
                    )}
                  </motion.div>
                </motion.div>
              ))
            ) : isLoading ? (
              <motion.div
                className="space-y-4"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 rounded-lg border border-amber-400/10 bg-gradient-to-r from-amber-500/10 via-transparent to-cyan-500/5"
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="py-12 text-center font-terminal text-xs text-zinc-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FileSearch className="mx-auto mb-3 text-zinc-700" size={22} />
                <div className="mb-2 uppercase tracking-[0.18em]">No Sources Linked</div>
                <div className="text-zinc-700">Deep Study returns cited records</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-amber-400/15 bg-black/70 px-5 py-3 font-terminal text-xs text-zinc-500">
        <span>
          {isLoading ? 'Indexing citations...' : 'Citation pane ready'}
        </span>
      </div>
    </motion.div>
  );
}
