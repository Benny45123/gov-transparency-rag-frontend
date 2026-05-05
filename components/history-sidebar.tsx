'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface HistorySidebarProps {
  history: string[];
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
  isCollapsed?: boolean;
}

export function HistorySidebar({
  history,
  onSelectQuery,
  onClearHistory,
  isCollapsed = false,
}: HistorySidebarProps) {
  const [collapsed, setCollapsed] = useState(isCollapsed);

  return (
    <motion.aside
      className="hidden h-full flex-col border-r border-cyan-400/20 bg-black/80 lg:flex"
      animate={{ width: collapsed ? 60 : 280 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div className="flex items-center justify-between border-b border-cyan-400/15 px-4 py-4">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-terminal text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
              Case History
            </h3>
            <p className="mt-1 font-terminal text-xs text-zinc-600">
              {history.length} queries
            </p>
          </motion.div>
        )}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand history' : 'Collapse history'}
          className="text-cyan-300 transition hover:text-cyan-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </motion.button>
      </motion.div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {!collapsed && history.length > 0 ? (
            history.map((query, index) => (
              <motion.button
                key={`${query}-${index}`}
                onClick={() => onSelectQuery(query)}
                className="group relative w-full overflow-hidden border-b border-cyan-400/10 px-4 py-3 text-left transition hover:bg-cyan-400/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-cyan-400/5"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />

                <motion.div
                  className="pointer-events-none absolute inset-0 border border-cyan-400/0"
                  whileHover={{ borderColor: 'rgba(6, 182, 212, 0.5)' }}
                  transition={{ duration: 0.2 }}
                />

                <p className="relative z-10 line-clamp-2 font-terminal text-xs leading-tight text-zinc-300 transition group-hover:text-cyan-200">
                  {query}
                </p>
              </motion.button>
            ))
          ) : !collapsed ? (
            <motion.div
              className="px-4 py-8 text-center font-terminal text-xs text-zinc-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No query history
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {!collapsed && (
        <motion.div
          className="space-y-2 border-t border-cyan-400/15 px-4 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded border border-red-500/25 bg-red-500/10 px-3 py-2 font-terminal text-xs font-bold uppercase tracking-[0.14em] text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            whileHover={{ scale: history.length > 0 ? 1.02 : 1 }}
            whileTap={{ scale: history.length > 0 ? 0.98 : 1 }}
          >
            <Trash2 size={13} />
            Clear Logs
          </motion.button>
          <div className="flex items-center gap-2 px-2">
            <motion.div
              className="h-2 w-2 rounded-full bg-green-500"
              animate={{
                opacity: [1, 0.5, 1],
                boxShadow: [
                  '0 0 4px rgba(34, 197, 94, 0.5)',
                  '0 0 8px rgba(34, 197, 94, 0.8)',
                  '0 0 4px rgba(34, 197, 94, 0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-terminal text-xs uppercase tracking-[0.12em] text-zinc-500">
              System ready
            </span>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}
