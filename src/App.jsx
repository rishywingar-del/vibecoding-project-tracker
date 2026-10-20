
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
  const [editing, setEditing] = useState(null);

  const emptyTask = {
    title: '',
    description: '',
    type: 'feature',
    status: 'todo',
    assignee: TEAM[0],
    dueDate: '',
  };

  const [form, setForm] = useState(emptyTask);

  function openNewTask() {
    setForm(emptyTask);
    setEditing({ id: null });
  }

  function openEditTask(task) {
    setForm({
      title: task.title,
      description: task.description,
      type: task.type,
      status: task.status,
      assignee: task.assignee,
      dueDate: task.dueDate || '',
    });
    setEditing(task);
  }

  function saveTask(event) {
    event.preventDefault();

    if (!form.title.trim()) return;

    if (editing.id === null) {
      const newTask = {
        ...form,
        id: crypto.randomUUID(),
        title: form.title.trim(),
        dueDate: form.dueDate || null,
        createdDate: new Date().toISOString().slice(0, 10),
      };

      setTasks((current) => [...current, newTask]);
    } else {
      setTasks((current) =>
        current.map((task) =>
          task.id === editing.id
            ? {
                ...task,
                ...form,
                title: form.title.trim(),
                dueDate: form.dueDate || null,
              }
            : task
        )
      );
    }

    setEditing(null);
  }

  function deleteTask() {
    if (!window.confirm('Delete this task? This action cannot be undone.')) {
      return;
    }

    setTasks((current) =>
      current.filter((task) => task.id !== editing.id)
    );

    setEditing(null);
  }

  // TODO M11 anchors:
  //   const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', [...]);

  return (
    <div className="min-h-screen bg-surface-page p-6">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Vibecoding Project Tracker
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            FlowState
          </p>
        </div>

        <button
          type="button"
          onClick={openNewTask}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          + Add Task
        </button>
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
                  <button
                    type="button"
                    key={task.id}
                    onClick={() => openEditTask(task)}
                    className="w-full rounded-lg border border-slate-200 bg-surface-card p-4 text-left shadow-sm transition hover:border-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-text-primary">
                        {task.title}
                      </h3>

                      <span
                        className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
                          task.type === 'bug'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {task.type === 'bug' ? 'Bug' : 'Feature'}
                      </span>
                    </div>

                    <p className="text-sm leading-5 text-text-muted">
                      {task.description}
                    </p>
                  </button>
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

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="task-modal-title"
                className="text-xl font-semibold text-text-primary"
              >
                {editing.id === null ? 'Add Task' : 'Edit Task'}
              </h2>

              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close task form"
                className="rounded px-2 py-1 text-xl text-text-muted hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveTask} className="space-y-4">
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-1 block text-sm font-medium text-text-primary"
                >
                  Title
                </label>
                <input
                  id="task-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="task-description"
                  className="mb-1 block text-sm font-medium text-text-primary"
                >
                  Description
                </label>
                <textarea
                  id="task-description"
                  rows="3"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="task-type"
                    className="mb-1 block text-sm font-medium text-text-primary"
                  >
                    Type
                  </label>
                  <select
                    id="task-type"
                    value={form.type}
                    onChange={(event) =>
                      setForm({ ...form, type: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="feature">Feature</option>
                    <option value="bug">Bug</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="task-status"
                    className="mb-1 block text-sm font-medium text-text-primary"
                  >
                    Status
                  </label>
                  <select
                    id="task-status"
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {STAGES.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="task-assignee"
                    className="mb-1 block text-sm font-medium text-text-primary"
                  >
                    Assignee
                  </label>
                  <select
                    id="task-assignee"
                    value={form.assignee}
                    onChange={(event) =>
                      setForm({ ...form, assignee: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {TEAM.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="task-due-date"
                    className="mb-1 block text-sm font-medium text-text-primary"
                  >
                    Due date
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      setForm({ ...form, dueDate: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <div>
                  {editing.id !== null && (
                    <button
                      type="button"
                      onClick={deleteTask}
                      className="text-sm font-medium text-red-700 hover:underline"
                    >
                      Delete Task
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-text-primary hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    {editing.id === null ? 'Add Task' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
