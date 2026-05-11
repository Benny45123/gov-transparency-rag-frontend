'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthToken } from '@/lib/auth';

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const oauthError = searchParams.get('error_description') || searchParams.get('error');

  useEffect(() => {
    if (!token) {
      return;
    }

    setAuthToken(token);
    router.replace('/terminal');
  }, [router, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="w-full max-w-md border border-amber-400/25 bg-zinc-950 px-6 py-8 text-center">
        <div className="font-terminal text-[10px] uppercase tracking-[0.28em] text-amber-400">
          OAuth Handshake
        </div>
        <h1 className="mt-4 font-terminal text-lg font-bold uppercase tracking-[0.18em] text-zinc-100">
          Google Session
        </h1>
        <p className="mt-4 font-terminal text-xs leading-6 text-zinc-500">
          {token ? 'Authorizing terminal session...' : oauthError || 'Authorization token missing. Return to launch and try again.'}
        </p>
      </div>
    </main>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black font-terminal text-xs uppercase tracking-[0.18em] text-zinc-500">
          Authorizing terminal session...
        </main>
      }
    >
      <AuthSuccessContent />
    </Suspense>
  );
}
