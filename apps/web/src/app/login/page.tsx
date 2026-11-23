'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, ApiError, auth } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    try {
      const { accessToken } = await api.login(f.get('email') as string, f.get('password') as string);
      auth.setToken(accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Network error');
      setPending(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← back
        </Link>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Studio login</h1>
        <input name="email" type="email" required placeholder="Email" className="field mt-8" defaultValue="admin@briefboard.dev" />
        <input name="password" type="password" required placeholder="Password" className="field mt-4" defaultValue="admin12345" />
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <button className="btn mt-8 w-full" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="mt-4 text-xs text-muted">Demo account is prefilled.</p>
      </form>
    </main>
  );
}
