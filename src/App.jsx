
import { useEffect, useState } from 'react';

export const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

export const TEAM = ['Rishy Winayagarajah'];

const DELIVERABLES = [
  { id: 'presentation', label: 'Presentation' },
  { id: 'demo', label: 'Demo' },
  { id: 'report', label: 'Report' },
  { id: 'documentation', label: 'Documentation' },
];

const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Create Kanban board',
    description: 'Set up the four task columns.',
    type: 'feature',
    status: 'done',
    assignee: TEAM[0],
    dueDate: null,
    createdDate: '2026-10-20',
  },
  {
    id: '2',
    title: 'Add task modal',
    description: 'Create a form for adding and editing tasks.',
    type: 'feature',
    status: 'todo',
    assignee: TEAM[0],
    dueDate: null,
    createdDate: '2026-10-20',
  },
  {
    id: '3',
    title: 'Test task display',
    description: 'Check that tasks appear in the correct columns.',
    type: 'feature',
    status: 'in-progress',
    assignee: TEAM[0],
    dueDate: null,
    createdDate: '2026-10-20',
  },
  {
    id: '4',
    title: 'Review board layout',
    description: 'Check the layout and readability of the board.',
    type: 'feature',
    status: 'review',
    assignee: TEAM[0],
    dueDate: null,
    createdDate: '2026-10-20',
  },
];

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
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

function todayString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysUntil(dateString) {
  const today = new Date(`${todayString()}T00:00:00`);
  const due = new Date(`${dateString}T00:00:00`);
  return Math.round((due - today) / 86400000);
}

function getDueState(task) {
  if (!task.dueDate) return null;

  const days = daysUntil(task.dueDate);

  if (task.status === 'done') {
    return {
      label: 'Completed',
      style: 'border-slate-200 bg-slate-50 text-slate-600',
    };
  }

  if (days < 0) {
    return {
      label: `Overdue by ${Math.abs(days)}d`,
      style: 'border-red-200 bg-red-50 text-red-800',
    };
  }

  if (days === 0) {
    return {
      label: 'Due today',
      style: 'border-amber-200 bg-amber-50 text-amber-800',
    };
  }

  if (days <= 3) {
    return {
      label: `Due in ${days}d`,
      style: 'border-amber-200 bg-amber-50 text-amber-800',
    };
  }

  return {
    label: `Due ${task.dueDate}`,
    style: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };
}

function createEmptyTask() {
  return {
    title: '',
    description: '',
    type: 'feature',
    status: 'todo',
    assignee: TEAM[0],
    dueDate: '',
    context: '',
    contextTool: '',
  };
}

function buildPrompt(task) {
  const stage = STAGES.find((item) => item.id === task.status);

  return [
    'PROJECT: FlowState',
    '',
    `TASK: ${task.title}`,
    `TYPE: ${task.type === 'bug' ? 'Bug' : 'Feature'}`,
    `STATUS: ${stage?.label || task.status}`,
    `ASSIGNEE: ${task.assignee || 'Unassigned'}`,
    `DUE DATE: ${task.dueDate || 'Not set'}`,
    '',
    'DESCRIPTION:',
    task.description || 'No description provided.',
    '',
    'PROJECT CONTEXT:',
    task.context || 'No additional context provided.',
    '',
    `AI TOOL: ${task.contextTool || 'Not specified'}`,
    '',
    'Use the information above to help with this task.',
    'Ask for clarification if important information is missing.',
  ].join('\n');
}

function isValidLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage(
    'vibetracker.tasks',
    INITIAL_TASKS
  );

  const [anchors, setAnchors] = useLocalStorage(
    'vibetracker.anchors',
    {
      presentation: '',
      demo: '',
      report: '',
      documentation: '',
    }
  );

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(createEmptyTask());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [notice, setNotice] = useState('');

  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === 'done').length;
  const active = tasks.filter((task) => task.status === 'in-progress').length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      task.status !== 'done' &&
      daysUntil(task.dueDate) < 0
  );

  const upcomingTasks = tasks
    .filter(
      (task) =>
        task.dueDate &&
        task.status !== 'done' &&
        daysUntil(task.dueDate) >= 0 &&
        daysUntil(task.dueDate) <= 3
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const owners = [
    ...new Set([
      ...TEAM,
      ...tasks.map((task) => task.assignee).filter(Boolean),
    ]),
  ];

  const filteredTasks = tasks.filter((task) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [task.title, task.description, task.context, task.assignee]
        .some((value) => String(value || '').toLowerCase().includes(query));

    const matchesType =
      typeFilter === 'all' || task.type === typeFilter;

    const matchesOwner =
      ownerFilter === 'all' || task.assignee === ownerFilter;

    return matchesSearch && matchesType && matchesOwner;
  });

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openNewTask() {
    setForm(createEmptyTask());
    setEditing({ id: null });
    setNotice('');
  }

  function openEditTask(task) {
    setForm({
      title: task.title || '',
      description: task.description || '',
      type: task.type || 'feature',
      status: task.status || 'todo',
      assignee: task.assignee || TEAM[0],
      dueDate: task.dueDate || '',
      context: task.context || '',
      contextTool: task.contextTool || '',
    });

    setEditing(task);
    setNotice('');
  }

  function saveTask(event) {
    event.preventDefault();

    if (!form.title.trim()) return;

    const details = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      context: form.context.trim(),
      dueDate: form.dueDate || null,
      contextUpdatedAt: form.context.trim()
        ? new Date().toISOString()
        : null,
    };

    if (editing.id === null) {
      const newTask = {
        ...details,
        id: crypto.randomUUID(),
        createdDate: todayString(),
      };

      setTasks((current) => [...current, newTask]);
    } else {
      setTasks((current) =>
        current.map((task) =>
          task.id === editing.id
            ? { ...task, ...details }
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

  async function copyContext() {
    const task = { ...editing, ...form };
    const prompt = buildPrompt(task);

    try {
      await navigator.clipboard.writeText(prompt);
      setNotice('Context copied. Ready to paste into your AI tool.');
    } catch {
      setNotice('Could not copy automatically. Check clipboard permissions.');
    }
  }

  function updateAnchor(id, value) {
    setAnchors((current) => ({
      ...current,
      [id]: value,
    }));
  }

  const fieldClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100';

  const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-xl font-bold text-white"
                aria-hidden="true"
              >
                F
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  FlowState
                </h1>
                <p className="text-xs text-slate-500">
                  Vibecoding Project Tracker
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openNewTask}
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            + Add Task
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8">
        <section aria-labelledby="overview-title">
          <div className="mb-4">
            <h2
              id="overview-title"
              className="text-xl font-bold tracking-tight"
            >
              Project overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep track of progress, deadlines and your next priorities.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Total tasks', value: total },
              { label: 'In progress', value: active },
              { label: 'Completed', value: completed },
              { label: 'Overdue', value: overdueTasks.length },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex justify-between gap-3">
              <span className="text-sm font-semibold">
                Overall completion
              </span>
              <span className="text-sm font-semibold text-blue-700">
                {progress}%
              </span>
            </div>

            <div
              role="progressbar"
              aria-label="Overall project completion"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2.5 overflow-hidden rounded-full bg-slate-100"
            >
              <div
                className="h-full rounded-full bg-blue-700 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {completed} of {total} tasks completed
            </p>
          </div>
        </section>

        <section
          aria-labelledby="focus-title"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="focus-title" className="text-lg font-bold">
                Needs attention
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your next priorities, based on task due dates.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {overdueTasks.length + upcomingTasks.length} priority tasks
            </span>
          </div>

          {overdueTasks.length === 0 && upcomingTasks.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Nothing urgent right now. Tasks due within three days will appear here.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {[...overdueTasks, ...upcomingTasks].map((task) => {
                const due = getDueState(task);

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => openEditTask(task)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-blue-300 hover:bg-blue-50"
                  >
                    <span className="text-sm font-medium">
                      {task.title}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${due.style}`}
                    >
                      {due.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section aria-labelledby="deliverables-title">
          <div className="mb-4">
            <h2 id="deliverables-title" className="text-xl font-bold">
              Project deliverables
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep important project links together in your Anchor Board.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DELIVERABLES.map((item) => {
              const value = anchors[item.id] || '';
              const valid = isValidLink(value);

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{item.label}</h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        valid
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {valid ? 'Linked' : 'Not linked'}
                    </span>
                  </div>

                  <label
                    htmlFor={`anchor-${item.id}`}
                    className="mb-1 block text-xs text-slate-500"
                  >
                    Deliverable URL
                  </label>

                  <input
                    id={`anchor-${item.id}`}
                    type="url"
                    value={value}
                    onChange={(event) =>
                      updateAnchor(item.id, event.target.value)
                    }
                    placeholder="https://..."
                    className={fieldClass}
                  />

                  {valid ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                    >
                      Open {item.label}
                    </a>
                  ) : (
                    <p className="mt-3 text-xs text-slate-500">
                      Add a valid link when it's ready.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Links are saved automatically in this browser.
          </p>
        </section>

        <section aria-labelledby="board-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="board-title" className="text-xl font-bold">
                Task board
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Move work forward by updating each task's status.
              </p>
            </div>

            <span className="text-sm text-slate-500">
              Showing {filteredTasks.length} of {total} tasks
            </span>
          </div>

          <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
            <div>
              <label htmlFor="task-search" className={labelClass}>
                Search tasks
              </label>
              <input
                id="task-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title or description..."
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="filter-type" className={labelClass}>
                Task type
              </label>
              <select
                id="filter-type"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className={fieldClass}
              >
                <option value="all">All types</option>
                <option value="feature">Features</option>
                <option value="bug">Bugs</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-owner" className={labelClass}>
                Assigned to
              </label>
              <select
                id="filter-owner"
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value)}
                className={fieldClass}
              >
                <option value="all">Everyone</option>
                {owners.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <main className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STAGES.map((stage) => {
              const stageTasks = filteredTasks.filter(
                (task) => task.status === stage.id
              );

              return (
                <section
                  key={stage.id}
                  aria-label={`${stage.label} tasks`}
                  className="min-h-80 rounded-xl border border-slate-200 bg-slate-100 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">{stage.label}</h3>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {stageTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {stageTasks.map((task) => {
                      const due = getDueState(task);

                      const borderStyle =
                        due && due.label.startsWith('Overdue')
                          ? 'border-l-4 border-l-red-600'
                          : due &&
                              (due.label.startsWith('Due in') ||
                                due.label === 'Due today')
                            ? 'border-l-4 border-l-amber-500'
                            : 'border-l-4 border-l-transparent';

                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => openEditTask(task)}
                          className={`w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 ${borderStyle}`}
                        >
                          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                            <h4 className="min-w-0 flex-1 break-words text-sm font-semibold">
                              {task.title}
                            </h4>

                            <span
                              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                                task.type === 'bug'
                                  ? 'bg-red-50 text-red-800'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {task.type === 'bug' ? 'Bug' : 'Feature'}
                            </span>
                          </div>

                          {task.description && (
                            <p className="mb-3 break-words text-sm leading-5 text-slate-600">
                              {task.description}
                            </p>
                          )}

                          {due && (
                            <span
                              className={`mb-3 inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${due.style}`}
                            >
                              {due.label}
                            </span>
                          )}

                          {task.context && (
                            <p className="mb-3 text-xs font-medium text-blue-700">
                              AI context added
                            </p>
                          )}

                          <div className="border-t border-slate-100 pt-3">
                            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
                              <span
                                aria-hidden="true"
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white"
                              >
                                {(task.assignee || '?')
                                  .trim()
                                  .charAt(0)
                                  .toUpperCase()}
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
                      <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                        No tasks here yet.
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </main>
        </section>

        <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
          FlowState · Project tracking with AI context
        </footer>
      </div>

      {editing !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditing(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2
                  id="task-modal-title"
                  className="text-xl font-bold"
                >
                  {editing.id === null ? 'Add Task' : 'Edit Task'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Keep your task details and AI context together.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close task form"
                className="rounded-lg px-3 py-1 text-xl text-slate-600 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveTask} className="space-y-4">
              <div>
                <label htmlFor="task-title" className={labelClass}>
                  Task title *
                </label>
                <input
                  id="task-title"
                  required
                  maxLength={120}
                  value={form.title}
                  onChange={(event) =>
                    updateForm('title', event.target.value)
                  }
                  placeholder="What needs to be done?"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="task-description" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="task-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    updateForm('description', event.target.value)
                  }
                  placeholder="Add a short description..."
                  className={fieldClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="task-type" className={labelClass}>
                    Type
                  </label>
                  <select
                    id="task-type"
                    value={form.type}
                    onChange={(event) =>
                      updateForm('type', event.target.value)
                    }
                    className={fieldClass}
                  >
                    <option value="feature">Feature</option>
                    <option value="bug">Bug</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="task-status" className={labelClass}>
                    Status
                  </label>
                  <select
                    id="task-status"
                    value={form.status}
                    onChange={(event) =>
                      updateForm('status', event.target.value)
                    }
                    className={fieldClass}
                  >
                    {STAGES.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="task-owner" className={labelClass}>
                    Hand off to...
                  </label>
                  <select
                    id="task-owner"
                    value={form.assignee}
                    onChange={(event) =>
                      updateForm('assignee', event.target.value)
                    }
                    className={fieldClass}
                  >
                    {[
                      ...new Set([...owners, form.assignee].filter(Boolean)),
                    ].map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="task-due" className={labelClass}>
                    Due date
                  </label>
                  <input
                    id="task-due"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      updateForm('dueDate', event.target.value)
                    }
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-slate-900">
                    AI task context
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Record decisions, constraints and relevant project details
                    so you can reuse them in an AI coding tool.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="task-context-tool"
                      className={labelClass}
                    >
                      AI tool
                    </label>
                    <select
                      id="task-context-tool"
                      value={form.contextTool}
                      onChange={(event) =>
                        updateForm('contextTool', event.target.value)
                      }
                      className={fieldClass}
                    >
                      <option value="">Not specified</option>
                      <option value="ChatGPT">ChatGPT</option>
                      <option value="GitHub Copilot">GitHub Copilot</option>
                      <option value="Claude">Claude</option>
                      <option value="Cursor">Cursor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="task-context" className={labelClass}>
                      Context briefing
                    </label>
                    <textarea
                      id="task-context"
                      rows={5}
                      value={form.context}
                      onChange={(event) =>
                        updateForm('context', event.target.value)
                      }
                      placeholder="What has already been decided? What constraints or files should the AI know about?"
                      className={fieldClass}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={copyContext}
                    className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                  >
                    Copy as Prompt Context
                  </button>

                  <p role="status" className="text-xs text-slate-600">
                    {notice}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <div>
                  {editing.id !== null && (
                    <button
                      type="button"
                      onClick={deleteTask}
                      className="text-sm font-semibold text-red-700 hover:underline"
                    >
                      Delete Task
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
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
