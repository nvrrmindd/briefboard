'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Board } from '@/components/board';
import { BriefInbox } from '@/components/brief-inbox';
import { NewProject } from '@/components/new-project';
import { api, ApiError, auth } from '@/lib/api';
import { STAGES, STAGE_LABEL, type Brief, type Project, type Stats, type User } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    auth.clear();
    router.replace('/login');
  }, [router]);

  /** Single place that reloads everything from the API. */
  const load = useCallback(async () => {
    try {
      const [me, b, p, s] = await Promise.all([api.me(), api.briefs('NEW'), api.projects(), api.stats()]);
      setUser(me);
      setBriefs(b);
      setProjects(p);
      setStats(s);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return logout();
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
  }, [logout]);

  useEffect(() => {
    if (!auth.getToken()) {
      router.replace('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    void load();
  }, [load, router]);

  if (!user) {
    return <p className="p-10 text-muted">{error ?? 'Loading…'}</p>;
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 pb-16">
      <header className="flex flex-wrap items-center justify-between gap-4 py-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          brief<span className="text-accent">●</span>board
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">
            {user.name} · {user.role.toLowerCase()}
          </span>
          <button onClick={logout} className="btn-ghost">
            Log out
          </button>
        </div>
      </header>

      {stats && (
        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-7">
          <Stat label="New briefs" value={stats.newBriefs} accent />
          <Stat label="Projects" value={stats.total} />
          {STAGES.map((s) => (
            <Stat key={s} label={STAGE_LABEL[s]} value={stats.byStage[s]} />
          ))}
        </section>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <BriefInbox briefs={briefs} onChange={load} onError={setError} />

      <div className="mt-10 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Board</h2>
        <NewProject onCreated={load} onError={setError} />
      </div>
      <Board
        projects={projects}
        setProjects={setProjects}
        isAdmin={user.role === 'ADMIN'}
        onChange={load}
        onError={setError}
      />
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-paper p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${accent && value > 0 ? 'text-accent' : ''}`}>{value}</p>
    </div>
  );
}
