'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { STAGES, STAGE_LABEL, SERVICE_LABEL, canMoveStage, type Project, type Stage } from '@/lib/types';

interface Props {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  isAdmin: boolean;
  onChange: () => Promise<void>;
  onError: (msg: string) => void;
}

export function Board({ projects, setProjects, isAdmin, onChange, onError }: Props) {
  const [dragging, setDragging] = useState<Project | null>(null);

  /**
   * Optimistic update: move the card in local state first so the UI reacts instantly,
   * then call the API. If the API refuses, put the card back and show the error.
   */
  async function move(project: Project, to: Stage) {
    if (!canMoveStage(project.stage, to)) {
      onError(`Can't jump from ${STAGE_LABEL[project.stage]} to ${STAGE_LABEL[to]}: forward moves go one column at a time`);
      return;
    }
    const from = project.stage;
    setProjects((ps) => ps.map((p) => (p.id === project.id ? { ...p, stage: to } : p)));
    try {
      await api.moveProject(project.id, to);
      await onChange(); // refresh stats
    } catch (err) {
      setProjects((ps) => ps.map((p) => (p.id === project.id ? { ...p, stage: from } : p)));
      onError(err instanceof Error ? err.message : 'Move failed');
    }
  }

  async function remove(project: Project) {
    if (!window.confirm(`Delete “${project.title}”?`)) return;
    try {
      await api.deleteProject(project.id);
      await onChange();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div className="mt-4 grid gap-4 overflow-x-auto pb-2 md:grid-cols-5">
      {STAGES.map((stage, i) => {
        const cards = projects.filter((p) => p.stage === stage);
        const canDrop = dragging ? canMoveStage(dragging.stage, stage) : false;
        return (
          <section
            key={stage}
            onDragOver={(e) => canDrop && e.preventDefault()} // preventDefault = "drop allowed here"
            onDrop={() => dragging && move(dragging, stage)}
            className={`min-h-64 min-w-56 rounded-2xl p-3 transition ${
              dragging && canDrop ? 'bg-accent/10 ring-2 ring-accent/40' : 'bg-black/[0.03]'
            }`}
          >
            <header className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-medium">{STAGE_LABEL[stage]}</h3>
              <span className="text-xs text-muted">{cards.length}</span>
            </header>
            <ul className="flex flex-col gap-3">
              {cards.map((p) => (
                <li
                  key={p.id}
                  draggable
                  onDragStart={() => setDragging(p)}
                  onDragEnd={() => setDragging(null)}
                  className="cursor-grab rounded-xl bg-white p-4 shadow-sm active:cursor-grabbing"
                >
                  <p className="text-sm leading-snug font-medium">{p.title}</p>
                  <p className="mt-1 text-xs text-muted">{p.clientName}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.services.map((s) => (
                      <span key={s} className="rounded bg-paper px-1.5 py-0.5 text-[10px] text-muted uppercase">
                        {SERVICE_LABEL[s]}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                    <span className="whitespace-nowrap">{p.dueDate ? `due ${p.dueDate}` : 'no deadline'}</span>
                    <span className="flex gap-1">
                      {/* Buttons do the same as drag & drop — for touch screens and keyboard users. */}
                      {i > 0 && (
                        <button aria-label="Move back" className="btn-ghost px-2 py-0.5" onClick={() => move(p, STAGES[i - 1])}>
                          ←
                        </button>
                      )}
                      {i < STAGES.length - 1 && (
                        <button aria-label="Move forward" className="btn-ghost px-2 py-0.5" onClick={() => move(p, STAGES[i + 1])}>
                          →
                        </button>
                      )}
                      {isAdmin && (
                        <button aria-label="Delete" className="btn-ghost px-2 py-0.5 hover:border-red-500" onClick={() => remove(p)}>
                          ✕
                        </button>
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
