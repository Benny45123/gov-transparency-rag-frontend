'use client';

import { useState, useCallback } from 'react';
import { authHeaders, clearAuthToken, startGoogleOAuth } from '@/lib/auth';

export interface Source {
  source_file: string;
  source_url: string;
  chunk_index: number;
  score: number;
  preview: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QueryResponse {
  answer: string;
  sources: Source[];
  cached: boolean;
  query: string;
  error: string | null;
}

type BackendSource = Partial<Source> & {
  file?: string;
  filename?: string;
  title?: string;
  name?: string;
  url?: string;
  link?: string;
  source?: string;
  text?: string;
  content?: string;
  snippet?: string;
  page?: number;
  chunk?: number;
  relevance?: number;
};

function normalizeSource(source: BackendSource, index: number): Source {
  const rawScore = Number(source.score ?? source.relevance ?? 0);
  const score = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(1, rawScore > 1 ? rawScore / 100 : rawScore))
    : 0;

  return {
    source_file:
      source.source_file ||
      source.file ||
      source.filename ||
      source.title ||
      source.name ||
      `Court record ${index + 1}`,
    source_url: source.source_url || source.url || source.link || '',
    chunk_index: Number(source.chunk_index ?? source.chunk ?? source.page ?? index),
    score,
    preview:
      source.preview ||
      source.text ||
      source.content ||
      source.snippet ||
      source.source ||
      'No preview text returned by the API.',
  };
}

function extractHistory(data: unknown): string[] {
  if (Array.isArray(data)) {
    return data
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object') {
          const row = entry as Record<string, unknown>;
          return row.query || row.question || row.q;
        }
        return null;
      })
      .filter((query): query is string => typeof query === 'string' && query.length > 0);
  }

  if (data && typeof data === 'object') {
    const objectData = data as Record<string, unknown>;
    return extractHistory(objectData.history || objectData.rows || objectData.data || []);
  }

  return [];
}

function getStreamLineText(line: string): { text: string; replace?: boolean } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed === '[DONE]') return null;

  const payload = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
  if (!payload || payload === '[DONE]') return null;

  try {
    const parsed = JSON.parse(payload);
    if (typeof parsed === 'string') return { text: parsed };
    if (!parsed || typeof parsed !== 'object') return null;

    const event = parsed as Record<string, unknown>;
    const token = event.token ?? event.delta ?? event.content ?? event.text;
    if (typeof token === 'string') return { text: token };

    const answer = event.answer ?? event.response;
    if (typeof answer === 'string') return { text: answer, replace: true };

    return null;
  } catch {
    return { text: payload };
  }
}

export function useTerminalQuery(baseUrl: string = 'http://127.0.0.1:8000') {
  const [isLoading, setIsLoading] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const streamQuery = useCallback(
    async (question: string, isDeep: boolean = false) => {
      const trimmedQuestion = question.trim();
      if (!trimmedQuestion) return;

      setIsLoading(true);
      setError(null);
      setStreamContent('');
      setSources([]);

      setHistory((prev) => {
        if (prev.includes(trimmedQuestion)) return prev;
        return [trimmedQuestion, ...prev].slice(0, 20);
      });

      const conversationId =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('gov-rag-conversation-id') ||
            crypto.randomUUID()
          : undefined;

      if (conversationId && typeof window !== 'undefined') {
        window.localStorage.setItem('gov-rag-conversation-id', conversationId);
      }

      const requestBody = {
        question: trimmedQuestion,
        conversation_id: conversationId,
        messages,
        skip_cache: false,
      };

      let finalAnswer = '';

      try {
        const headers = {
          'Content-Type': 'application/json',
          ...authHeaders(),
        };

        const streamPromise = (async () => {
          const response = await fetch(`${baseUrl}/query/stream`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
          });
          
          if (response.status === 401 || response.status === 403) {
            clearAuthToken();
            await startGoogleOAuth(baseUrl);
            return;
          }

          if (!response.ok) {
            const detail = await response.text();
            throw new Error(detail || `Stream path failed (${response.status})`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let accumulated = '';
          let buffered = '';

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffered += decoder.decode(value, { stream: true });

              const lines = buffered.split(/\r?\n/);
              buffered = lines.pop() || '';

              for (const line of lines) {
                const event = getStreamLineText(line);
                if (!event) continue;
                accumulated = event.replace ? event.text : accumulated + event.text;
              }

              if (buffered && !buffered.trim().startsWith('{') && !buffered.trim().startsWith('data:')) {
                accumulated += buffered;
                buffered = '';
              }

              finalAnswer = accumulated;
              setStreamContent(accumulated);
            }

            const leftover = getStreamLineText(buffered);
            if (leftover) {
              accumulated = leftover.replace ? leftover.text : accumulated + leftover.text;
              finalAnswer = accumulated;
              setStreamContent(accumulated);
            }
          }
        })();

        let deepPromise = Promise.resolve();
        if (isDeep) {
          deepPromise = fetch(`${baseUrl}/query`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
          })
          .then(async (res) => {
            if (res.status === 401 || res.status === 403) {
              clearAuthToken();
              await startGoogleOAuth(baseUrl);
              return;
            }

            if (!res.ok) {
              const detail = await res.text();
              throw new Error(detail || `Deep Study path failed (${res.status})`);
            }
            const data: QueryResponse = await res.json();
            const normalizedSources = (data.sources || []).map(normalizeSource);
            setSources(normalizedSources);
            if (data.answer) {
              finalAnswer = data.answer;
              setStreamContent(data.answer);
            }
          });
        }

        await Promise.all([streamPromise, deepPromise]);
        setMessages((prev) => {
          const nextMessages: ChatMessage[] = [
            ...prev,
            { role: 'user', content: trimmedQuestion },
            { role: 'assistant', content: finalAnswer || streamContent },
          ];

          return nextMessages.slice(-12);
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection interrupted');
      } finally {
        setIsLoading(false);
      }
    },
    [baseUrl, messages, streamContent]
  );

  const fetchHistory = useCallback(async (limit: number = 20) => {
    try {
      const response = await fetch(`${baseUrl}/history?limit=${limit}`, {
        headers: authHeaders(),
      });
      if (response.status === 401 || response.status === 403) {
        clearAuthToken();
        await startGoogleOAuth(baseUrl);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setHistory(extractHistory(data).slice(0, limit));
      }
    } catch (err) {
      console.error('History fetch failed', err);
    }
  }, [baseUrl]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setMessages([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('gov-rag-conversation-id');
    }
  }, []);

  return {
    isLoading,
    streamContent,
    sources,
    error,
    history,
    streamQuery,
    fetchHistory,
    clearHistory,
  };
}
