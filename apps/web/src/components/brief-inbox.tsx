'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { SERVICE_LABEL, type Brief } from '@/lib/types';

interface Props {
  briefs: Brief[];
  onChange: () => Promise<void>;
  onError: (msg: string) => void;
}

export function BriefInbox({ briefs, onChange, onError }: Props) {
  const [busy, setBusy] = useState<string | null>(null);

  async function act(id: string, action: 'accept' | 'reject') {
    setBusy(id);
    try {
      await (action === 'accept' ? api.acceptBrief(id) : api.rejectBrief(id));
      await onChange();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold tracking-tight">
        Inbox <span className="text-muted">({briefs.length})</span>
      </h2>
      {briefs.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No new briefs. Send one from the public page to see it here.</p>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {briefs.map((b) => (
            <li key={b.id} className="rounded-2xl bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{b.company ?? b.clientName}</p>
                  <p className="text-sm text-muted">
                    {b.clientName} · {b.email}
                  </p>
                </div>
                <span className="text-xs text-muted">{new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm">{b.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {b.services.map((s) => (
                  <span key={s} className="chip">
                    {SERVICE_LABEL[s]}
                  </span>
                ))}
                {b.budget && <span className="chip">{b.budget}</span>}
                {b.deadline && <span className="chip">due {b.deadline}</span>}
              </div>
              <div className="mt-4 flex gap-2">
                <button className="btn px-4 py-2" disabled={busy === b.id} onClick={() => act(b.id, 'accept')}>
                  Accept → project
                </button>
                <button className="btn-ghost" disabled={busy === b.id} onClick={() => act(b.id, 'reject')}>
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
