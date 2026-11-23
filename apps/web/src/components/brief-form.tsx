'use client';

import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { SERVICES, SERVICE_LABEL, type Service } from '@/lib/types';

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

export function BriefForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [state, setState] = useState<State>({ kind: 'idle' });

  const toggle = (s: Service) =>
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const opt = (k: string) => (f.get(k) as string).trim() || undefined;
    if (services.length === 0) {
      setState({ kind: 'error', message: 'Pick at least one service' });
      return;
    }
    setState({ kind: 'sending' });
    try {
      await api.sendBrief({
        clientName: f.get('clientName') as string,
        company: opt('company'),
        email: f.get('email') as string,
        services,
        budget: opt('budget'),
        deadline: opt('deadline'),
        description: f.get('description') as string,
      });
      form.reset();
      setServices([]);
      setState({ kind: 'sent' });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof ApiError ? err.message : 'Network error, try again' });
    }
  }

  if (state.kind === 'sent') {
    return (
      <div className="flex flex-col justify-center rounded-3xl bg-ink p-10 text-paper">
        <p className="text-4xl font-semibold">Brief received.</p>
        <p className="mt-3 text-paper/70">It&apos;s already on the studio board. We&apos;ll reply by email.</p>
        <button className="btn mt-8 self-start bg-paper text-ink" onClick={() => setState({ kind: 'idle' })}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl bg-white p-8 shadow-[0_1px_0_var(--line)] md:p-10">
      <p className="text-xs tracking-widest text-muted uppercase">New brief</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <input name="clientName" required minLength={2} placeholder="Your name *" className="field" />
        <input name="company" placeholder="Company" className="field" />
        <input name="email" required type="email" placeholder="Email *" className="field sm:col-span-2" />
      </div>

      <fieldset className="mt-7">
        <legend className="text-sm text-muted">What do you need? *</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {SERVICES.map((s) => {
            const on = services.includes(s);
            return (
              <button
                type="button"
                key={s}
                onClick={() => toggle(s)}
                aria-pressed={on}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  on ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'
                }`}
              >
                {SERVICE_LABEL[s]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <input name="budget" placeholder="Budget, e.g. 1–3M ₸" className="field" />
        <input name="deadline" type="date" className="field" aria-label="Deadline" />
      </div>
      <textarea
        name="description"
        required
        minLength={20}
        rows={4}
        placeholder="Tell us about the project (at least 20 characters) *"
        className="field mt-5 resize-none"
      />

      {state.kind === 'error' && <p className="mt-4 text-sm text-red-600">{state.message}</p>}
      <button className="btn mt-8 w-full" disabled={state.kind === 'sending'}>
        {state.kind === 'sending' ? 'Sending…' : 'Send brief →'}
      </button>
    </form>
  );
}
