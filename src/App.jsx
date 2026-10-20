
import { useState, useEffect } from 'react';

/**
 * Vibecoding Project Tracker — starter scaffold.
 *
 * This file is intentionally almost empty. The boilerplate (Vite, React,
 * Tailwind) is configured for you, plus a few shared constants and a
 * localStorage helper. Everything visible on screen, you build.
 *
 * Where to start (build sequence in Phase 3):
 *   - M4  data-model    : render the four columns and the task cards below.
 *   - M5  crud-modal    : add the "+" button modal and the edit-on-click modal.
 *   - M6  tag-style     : feature vs. bug color coding (uses DESIGN.md §2 colors).
 *   - M7  task-owner    : assignee badge + "Hand off to..." dropdown.
 *   - M8  due-tint      : color cards by due date (uses DESIGN.md §2 due-state colors).
 *   - M9  context       : a curated Context briefing field on the modal.
 *   - M10 copy-prompt   : a "Copy as Prompt Context" button that serializes the task + context.
 *   - M11 anchors       : the Anchor Board above the Kanban.
 *   - M12 secret-sauce  : the one open-ended thing that makes your tracker yours.
 *
 * Search the file for `TODO M<n>` to find the right hook for each milestone.
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'feature'|'bug'} type
 * @property {'todo'|'in-progress'|'review'|'done'} status
 * @property {string} assignee
 * @property {string|null} dueDate     ISO 'YYYY-MM-DD'
 * @property {string} createdDate      ISO 'YYYY-MM-DD'
 */

export const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

export const TEAM = ['Rishy Winayagarajah'];

/**
 * A tiny localStorage hook — survives reloads, no library needed.
 *
 * Usage:
 *   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', []);
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode error — silently ignore for hackathon */
    }
  }, [key, value]);

  return [value, setValue];
}

export default function App() {
  // TODO M4 data-model:
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', [
    {
      id: '1',
      title: 'Create Kanban board',
      description: 'Set up the four task columns.',
      type: 'feature',
      status: 'done',
      assignee: 'Rishy Winayagarajah',
      dueDate: null,
      createdDate: '2026-10-20',
    },
    {
      id: '2',
      title: 'Add task modal',
      description: 'Create a form for adding and editing tasks.',
      type: 'feature',
      status: 'todo',
      assignee: 'Rishy Winayagarajah',
      dueDate: null,
      createdDate: '2026-10-20',
    },
    {
      id: '3',
      title: 'Test task display',
      description: 'Check that tasks appear in the correct columns.',
      type: 'feature',
      status: 'in-progress',
      assignee: 'Rishy Winayagarajah',
      dueDate: null,
      createdDate: '2026-10-20',
    },
    {
      id: '4',
      title: 'Review board layout',
      description: 'Check the layout and readability of the board.',
      type: 'feature',
      status: 'review',
      assignee: 'Rishy Winayagarajah',
      dueDate: null,
      createdDate: '2026-10-20',
    },
  ]);

  // TODO M5 crud-modal:
  //   const [editing, setEditing] = useState(null);
  //
  // TODO M11 anchors:
  //   const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', [...]);

  return (
    <div className="min-h-screen bg-surface-page p-6">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Vibecoding Project Tracker
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            FlowState
          </p>
        </div>
      </header>

      {/* TODO M11 anchors: render the Anchor Board (Presentation / Demo / Report / Documentation) above the board. */}

      <main className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => {
          const stageTasks = tasks.filter(
            (task) => task.status === stage.id
          );

          return (
            <section
              key={stage.id}
              className="min-h-80 rounded-xl border border-slate-200 bg-slate-100 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary">
                  {stage.label}
                </h2>
                <span className="rounded-full bg-white px-2 py-1 text-xs text-text-muted">
                  {stageTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {stageTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-lg border border-slate-200 bg-surface-card p-4 shadow-sm"
                  >
                    <h3 className="text-sm font-semibold text-text-primary">
                      {task.title}
                    </h3>
                    <p className="mt-2 text-sm leading-5 text-text-muted">
                      {task.description}
                    </p>
                  </article>
                ))}

                {stageTasks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-text-muted">
                    No tasks here yet.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
