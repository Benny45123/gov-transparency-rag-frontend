'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/header';
import { QueryInput } from '@/components/query-input';
import { StreamWindow } from '@/components/stream-window';
import { CitationsPane } from '@/components/citations-pane';
import { HistorySidebar } from '@/components/history-sidebar';
import { useTerminalQuery } from '@/hooks/use-terminal-query';
import { FileSearch, RadioTower } from 'lucide-react';
import { authHeaders, clearAuthToken, getApiBaseUrl, getAuthToken, startGoogleOAuth } from '@/lib/auth';

export default function TerminalPage() {
  const [apiUrl] = useState(getApiBaseUrl());
  const [searchMode, setSearchMode] = useState<'stream' | 'deep'>('stream');
  const [authReady, setAuthReady] = useState(false);

  const { isLoading, streamContent, sources, error, history, streamQuery, fetchHistory, clearHistory } =
    useTerminalQuery(apiUrl);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      if (!getAuthToken()) {
        await startGoogleOAuth(apiUrl);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: authHeaders(),
        });

        if (response.status === 401 || response.status === 403) {
          clearAuthToken();
          await startGoogleOAuth(apiUrl);
          return;
        }

        if (!response.ok) {
          throw new Error(`Session check failed (${response.status})`);
        }

        if (!cancelled) {
          setAuthReady(true);
          fetchHistory();
        }
      } catch {
        if (!cancelled) {
          clearAuthToken();
          await startGoogleOAuth(apiUrl);
        }
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, fetchHistory]);

  const handleQuerySubmit = async (query: string) => {
    await streamQuery(query, searchMode === 'deep');
  };

  if (!authReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="w-full max-w-md border border-cyan-400/20 bg-zinc-950 px-6 py-8 text-center">
          <div className="font-terminal text-[10px] uppercase tracking-[0.28em] text-cyan-300">
            Session Check
          </div>
          <p className="mt-4 font-terminal text-xs leading-6 text-zinc-500">
            Verifying Google authorization...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(245,158,11,0.13),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(6,182,212,0.12),transparent_28%),linear-gradient(180deg,#030303_0%,#080808_46%,#020202_100%)]" />
        <motion.div
          className="absolute left-[-10%] top-24 h-14 w-[120%] rotate-[-8deg] border-y border-amber-300/20 bg-amber-400/[0.035]"
          animate={{ x: ['-2%', '2%', '-2%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-28 right-[-15%] h-px w-[70%] rotate-[-18deg] bg-cyan-300/25"
          animate={{ opacity: [0.1, 0.55, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[length:48px_48px]" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.035]">
        <div
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.75) 1px, rgba(255,255,255,0.75) 2px)',
          }}
        />
      </div>

      <Header />

      <div className="relative z-10 flex min-h-[calc(100vh-89px)] flex-col lg:flex-row">
        <HistorySidebar
          history={history}
          onSelectQuery={(q) => streamQuery(q, searchMode === 'deep')}
          onClearHistory={clearHistory}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-shrink-0 space-y-6 border-b border-cyan-400/15 bg-gradient-to-b from-black/80 to-black/35 p-4 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex w-full max-w-md rounded-md border border-zinc-800 bg-zinc-950/75 p-1">
                <button
                  onClick={() => setSearchMode('stream')}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded px-3 py-2 font-terminal text-[10px] uppercase tracking-[0.14em] transition-all ${
                    searchMode === 'stream'
                      ? 'border border-cyan-400/50 bg-cyan-400/15 text-cyan-300'
                      : 'border border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <RadioTower size={13} />
                  Stream
                </button>
                <button
                  onClick={() => setSearchMode('deep')}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded px-3 py-2 font-terminal text-[10px] uppercase tracking-[0.14em] transition-all ${
                    searchMode === 'deep'
                      ? 'border border-amber-400/50 bg-amber-400/15 text-amber-300'
                      : 'border border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <FileSearch size={13} />
                  Deep Study
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 animate-pulse rounded-full ${searchMode === 'deep' ? 'bg-amber-400' : 'bg-green-500'}`} />
                <span className="font-terminal text-xs uppercase tracking-[0.16em] text-zinc-500">
                  Mode: {searchMode === 'deep' ? 'answer + citations' : 'streaming answer'}
                </span>
              </div>
            </div>

            <QueryInput
              onSubmit={handleQuerySubmit}
              isLoading={isLoading}
              isLoadingSources={isLoading && searchMode === 'deep'}
              placeholder={searchMode === 'deep' ? 'Ask for a cited analysis of Epstein court records...' : 'Ask a quick records question...'}
            />
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 lg:grid-cols-2 lg:overflow-hidden sm:p-6">
            <div className={`min-h-[420px] transition-all duration-500 lg:min-h-0 ${searchMode === 'deep' ? 'opacity-85' : 'opacity-100'}`}>
              <StreamWindow isLoading={isLoading} content={streamContent} error={error} />
            </div>

            <div className={`min-h-[420px] transition-all duration-500 lg:min-h-0 ${searchMode === 'stream' ? 'opacity-70' : 'opacity-100'}`}>
              <CitationsPane sources={sources} isLoading={isLoading && searchMode === 'deep'} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
