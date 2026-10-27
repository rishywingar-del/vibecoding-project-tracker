
import { useEffect, useState } from 'react';

export const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? initialValue : JSON.parse(stored);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable.
    }
  }, [key, value]);

  return [value, setValue];
}

const STARTER_TASKS = [
  {
    id: '1',
    title: 'Create Kanban board',
    description: 'Set up the four task columns.',
    type: 'feature',
    status: 'done',
    assignee: 'Rishy Winayagarajah',
    dueDate: null,
    createdDate: '2026-10-20',
    context: '',
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
    context: '',
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
    context: '',
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
    context: '',
  },
];

const blankTask = () => ({
  title: '',
  description: '',
  type: 'feature',
  status: 'todo',
  assignee: '',
  dueDate: '',
  context: '',
});

function initials(name) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  );
}

function getDeadlineState(task) {
  if (!task.dueDate || task.status === 'done') {
    return 'normal';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${task.dueDate}T00:00:00`);

  if (Number.isNaN(due.getTime())) {
    return 'normal';
  }

  const daysLeft = Math.round(
    (due.getTime() - today.getTime()) / 86400000
  );

  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 3) return 'soon';

  return 'normal';
}

function formatDueDate(date) {
  if (!date) return '';

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    'en-GB',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );
}

function buildPromptContext(task) {
  const stage =
    STAGES.find((item) => item.id === task.status)?.label ||
    task.status;

  return [
    'I am working on a software project and need help with the following task.',
    '',
    `TASK: ${task.title}`,
    `TYPE: ${task.type === 'bug' ? 'Bug' : 'Feature'}`,
    `STATUS: ${stage}`,
    `ASSIGNED TO: ${task.assignee || 'Unassigned'}`,
    `DUE DATE: ${task.dueDate ? formatDueDate(task.dueDate) : 'Not set'}`,
    '',
    'TASK DESCRIPTION:',
    task.description || 'No description provided.',
    '',
    'PROJECT CONTEXT AND REQUIREMENTS:',
    task.context || 'No additional context provided.',
    '',
    'Please use the information above to help me complete this task.',
    'If you suggest code, explain where it should go and keep it consistent with the existing project.',
  ].join('\n');
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage(
    'vibetracker.tasks',
    STARTER_TASKS
  );

  const [team, setTeam] = useLocalStorage(
    'vibetracker.team',
    ['Rishy Winayagarajah']
  );

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankTask());
  const [showTeam, setShowTeam] = useState(false);
  const [newMember, setNewMember] = useState('');
  const [teamError, setTeamError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  function openNewTask() {
    setCopyMessage('');
    setForm({
      ...blankTask(),
      assignee: team[0] || '',
    });
    setEditing({ id: null });
  }

  function openEditTask(task) {
    setCopyMessage('');
    setForm({
      title: task.title,
      description: task.description || '',
      type: task.type,
      status: task.status,
      assignee: task.assignee || '',
      dueDate: task.dueDate || '',
      context: task.context || '',
    });
    setEditing(task);
  }

  function saveTask(event) {
    event.preventDefault();

    if (!form.title.trim()) return;

    const saved = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      context: form.context.trim(),
      dueDate: form.dueDate || null,
    };

    if (editing.id === null) {
      setTasks((current) => [
        ...current,
        {
          ...saved,
          id: crypto.randomUUID(),
          createdDate: new Date().toISOString().slice(0, 10),
        },
      ]);
    } else {
      setTasks((current) =>
        current.map((task) =>
          task.id === editing.id
            ? { ...task, ...saved }
            : task
        )
      );
    }

    setEditing(null);
  }

  function deleteTask() {
    if (
      !window.confirm(
        'Delete this task? This action cannot be undone.'
      )
    ) {
      return;
    }

    setTasks((current) =>
      current.filter((task) => task.id !== editing.id)
    );
    setEditing(null);
  }

  function addMember(event) {
    event.preventDefault();

    const name = newMember.trim().replace(/\s+/g, ' ');
    if (!name) return;

    if (
      team.some(
        (member) =>
          member.toLowerCase() === name.toLowerCase()
      )
    ) {
      setTeamError('That person is already on the team.');
      return;
    }

    setTeam((current) => [...current, name]);
    setNewMember('');
    setTeamError('');
  }

  function removeMember(name) {
    if (tasks.some((task) => task.assignee === name)) {
      setTeamError(
        'Reassign their tasks before removing this team member.'
      );
      return;
    }

    setTeam((current) =>
      current.filter((member) => member !== name)
    );
    setTeamError('');
  }

  async function copyPromptContext() {
    if (!form.title.trim()) {
      setCopyMessage('Add a task title before copying.');
      return;
    }

    const prompt = buildPromptContext(form);

    try {
      await navigator.clipboard.writeText(prompt);
      setCopyMessage('Copied! Paste it into your AI assistant.');
    } catch {
      setCopyMessage(
        'Could not copy automatically. Check your browser clipboard permissions.'
      );
    }
  }

  return (
    <div className="min-h-screen bg-surface-page p-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Vibecoding Project Tracker
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            FlowState · AI-Ready Task Management
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowTeam(true)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-text-primary hover:bg-slate-50"
          >
            Manage Team ({team.length})
          </button>

          <button
            type="button"
            onClick={openNewTask}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            + Add Task
          </button>
        </div>
      </header>

      <div className="mb-5 flex flex-wrap gap-3 text-xs font-medium text-slate-600">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
          Normal
        </span>
        <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-amber-800">
          Due within 3 days
        </span>
        <span className="rounded-full border border-red-300 bg-red-50 px-3 py-1.5 text-red-800">
          Overdue
        </span>
      </div>

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
                {stageTasks.map((task) => {
                  const deadlineState = getDeadlineState(task);

                  const cardColour =
                    deadlineState === 'overdue'
                      ? 'border-red-400 bg-red-50 hover:border-red-600'
                      : deadlineState === 'soon'
                        ? 'border-amber-400 bg-amber-50 hover:border-amber-600'
                        : 'border-slate-200 bg-surface-card hover:border-blue-700';

                  return (
                    <button
                      type="button"
                      key={task.id}
                      onClick={() => openEditTask(task)}
                      className={`w-full rounded-lg border p-4 text-left shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 ${cardColour}`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-text-primary">
                          {task.title}
                        </h3>

                        <span
                          className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
                            task.type === 'bug'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {task.type === 'bug' ? 'Bug' : 'Feature'}
                        </span>
                      </div>

                      <p className="text-sm leading-5 text-text-muted">
                        {task.description}
                      </p>

                      {task.context && (
                        <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/80 px-3 py-2">
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                            AI Briefing
                          </p>
                          <p className="line-clamp-2 whitespace-pre-wrap break-words text-xs leading-5 text-indigo-900">
                            {task.context}
                          </p>
                        </div>
                      )}

                      {task.dueDate && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-slate-600">
                            Due: {formatDueDate(task.dueDate)}
                          </span>

                          {deadlineState === 'overdue' && (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                              Overdue
                            </span>
                          )}

                          {deadlineState === 'soon' && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                              Due soon
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-800">
                          <span
                            aria-hidden="true"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-[10px] font-bold"
                          >
                            {initials(task.assignee || '')}
                          </span>
                          <span className="truncate">
                            {task.assignee || 'Unassigned'}
                          </span>
                        </span>
                      </div>
                    </button>
                  );
                })}

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
                  onChange={(event) => {
                    setForm({
                      ...form,
                      title: event.target.value,
                    });
                    setCopyMessage('');
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
                  onChange={(event) => {
                    setForm({
                      ...form,
                      description: event.target.value,
                    });
                    setCopyMessage('');
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="task-context"
                  className="mb-1 block text-sm font-medium text-text-primary"
                >
                  Task Context / AI Briefing
                </label>
                <textarea
                  id="task-context"
                  rows="5"
                  value={form.context}
                  onChange={(event) => {
                    setForm({
                      ...form,
                      context: event.target.value,
                    });
                    setCopyMessage('');
                  }}
                  placeholder={
                    'Add anything an AI coding assistant should know:\n' +
                    '- Relevant files or components\n' +
                    '- Requirements and acceptance criteria\n' +
                    '- Technical constraints\n' +
                    '- Useful links or previous decisions'
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-text-muted">
                  Save details here and copy them into an AI coding
                  assistant whenever you need them.
                </p>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-indigo-950">
                      Ready for AI
                    </p>
                    <p className="text-xs text-indigo-700">
                      Turn this task into a reusable prompt.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyPromptContext}
                    className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-800"
                  >
                    Copy as Prompt Context
                  </button>
                </div>

                {copyMessage && (
                  <p
                    role="status"
                    className="text-xs font-medium text-indigo-900"
                  >
                    {copyMessage}
                  </p>
                )}
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
                      setForm({
                        ...form,
                        type: event.target.value,
                      })
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
                      setForm({
                        ...form,
                        status: event.target.value,
                      })
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
                    Hand off to...
                  </label>
                  <select
                    id="task-assignee"
                    value={form.assignee}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        assignee: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {!team.includes(form.assignee) &&
                      form.assignee && (
                        <option value={form.assignee}>
                          {form.assignee} (previous assignee)
                        </option>
                      )}
                    {team.map((name) => (
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
                      setForm({
                        ...form,
                        dueDate: event.target.value,
                      })
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
                    {editing.id === null
                      ? 'Add Task'
                      : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-modal-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="team-modal-title"
                className="text-xl font-semibold text-text-primary"
              >
                Manage Team
              </h2>
              <button
                type="button"
                aria-label="Close team management"
                onClick={() => {
                  setShowTeam(false);
                  setTeamError('');
                }}
                className="rounded px-2 py-1 text-xl text-text-muted hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <p className="mb-4 text-sm text-text-muted">
              Add teammates so tasks can be handed off to the
              right person.
            </p>

            <form
              onSubmit={addMember}
              className="mb-4 flex gap-2"
            >
              <label
                htmlFor="new-member"
                className="sr-only"
              >
                Team member name
              </label>
              <input
                id="new-member"
                value={newMember}
                onChange={(event) => {
                  setNewMember(event.target.value);
                  setTeamError('');
                }}
                placeholder="Team member name"
                required
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Add
              </button>
            </form>

            {teamError && (
              <p
                role="alert"
                className="mb-3 text-sm text-red-700"
              >
                {teamError}
              </p>
            )}

            <ul className="space-y-2">
              {team.map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-text-primary">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-800"
                    >
                      {initials(name)}
                    </span>
                    <span className="truncate">{name}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => removeMember(name)}
                    aria-label={`Remove ${name}`}
                    className="text-xs font-medium text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}

              {team.length === 0 && (
                <li className="text-sm text-text-muted">
                  No team members yet.
                </li>
              )}
            </ul>

            <button
              type="button"
              onClick={() => {
                setShowTeam(false);
                setTeamError('');
              }}
              className="mt-5 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-text-primary hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
