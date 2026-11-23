import Link from 'next/link';
import { BriefForm } from '@/components/brief-form';

const steps = [
  ['01', 'Brief', 'You describe the task, budget and deadline.'],
  ['02', 'Strategy', 'We agree on positioning and the plan.'],
  ['03', 'Design & build', 'Identity, content, website or app.'],
  ['04', 'Delivery', 'Review rounds and hand-off of all files.'],
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24">
      <header className="flex items-center justify-between py-6">
        <span className="text-lg font-semibold tracking-tight">
          brief<span className="text-accent">●</span>board
        </span>
        <Link href="/login" className="btn-ghost">
          Studio login
        </Link>
      </header>

      <section className="grid gap-12 border-t border-ink pt-12 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="font-display text-5xl leading-[0.95] font-semibold tracking-tight md:text-7xl">
            Tell us
            <br />
            what you&apos;re
            <br />
            <span className="text-accent">building.</span>
          </h1>
          <p className="mt-6 max-w-sm text-muted">
            Branding, SMM, web and video. Send a short brief — the team gets it on the board instantly
            and replies within one working day.
          </p>
          <ol className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8">
            {steps.map(([n, title, text]) => (
              <li key={n} className="border-t border-line pt-3">
                <span className="text-xs text-muted">{n}</span>
                <p className="mt-1 font-medium">{title}</p>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
        <BriefForm />
      </section>
    </main>
  );
}
