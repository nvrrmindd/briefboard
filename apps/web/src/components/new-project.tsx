'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { SERVICES, SERVICE_LABEL, type Service } from '@/lib/types';

export function NewProject({ onCreated, onError }: { onCreated: () => Promise<void>; onError: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setPending(true);
    try {
      await api.createProject({
        title: f.get('title') as string,
        clientName: f.get('clientName') as string,
        services: f.getAll('services') as Service[],
        dueDate: (f.get('dueDate') as string) || undefined,
      });
      setOpen(false);
      await onCreated();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not create project');
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        + New project
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4">
      <input name="title" required minLength={2} placeholder="Title" className="field w-48" />
      <input name="clientName" required minLength={2} placeholder="Client" className="field w-40" />
      <input name="dueDate" type="date" className="field w-40" aria-label="Due date" />
      <div className="flex flex-wrap gap-2 text-xs">
        {SERVICES.map((s) => (
          <label key={s} className="flex items-center gap-1">
            <input type="checkbox" name="services" value={s} /> {SERVICE_LABEL[s]}
          </label>
        ))}
      </div>
      <button className="btn px-4 py-2" disabled={pending}>
        Create
      </button>
      <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}
