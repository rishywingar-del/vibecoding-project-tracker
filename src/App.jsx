
import { useEffect, useState } from 'react';

export const STAGES = [
  { id: 'todo', label: 'To Do', dot: 'bg-slate-400' },
  { id: 'in-progress', label: 'In Progress', dot: 'bg-blue-500' },
  { id: 'review', label: 'Review', dot: 'bg-amber-500' },
  { id: 'done', label: 'Done', dot: 'bg-emerald-500' },
];

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

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved === null ? initialValue : JSON.parse(saved);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable.
    }
  }, [key, value]);

  return [value, setValue];
}

const emptyTask = () => ({
  title: '',
  description: '',
  type: 'feature',
  status: 'todo',
  assignee: '',
  dueDate: '',
  context: '',
  aiTool: '',
  aiPrompt: '',
  aiOutcome: '',
});

const emptyAnchor = () => ({
  title: '',
  description: '',
  url: '',
});

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

const primary =
  'rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50';

const secondary =
  'rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50';

const label = 'mb-1.5 block text-sm font-semibold text-slate-700';

function initials(name) {
  return (
    (name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  );
}

function deadline(task) {
  if (!task.dueDate || task.status === 'done') return 'normal';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${task.dueDate}T00:00:00`);
  if (Number.isNaN(due.getTime())) return 'normal';

  const days = Math.round(
    (due.getTime() - today.getTime()) / 86400000
  );

  if (days < 0) return 'overdue';
  if (days <= 3) return 'soon';
  return 'normal';
}

function formatDate(date) {
  if (!date) return 'Not set';

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function safeLink(url) {
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol)
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}

function taskContext(task) {
  const stage =
    STAGES.find((item) => item.id === task.status)?.label ||
    task.status;

  return [
    `Task: ${task.title}`,
    `Description: ${task.description || 'Not provided'}`,
    `Type: ${task.type}`,
    `Status: ${stage}`,
    `Owner: ${task.assignee || 'Unassigned'}`,
    `Due date: ${formatDate(task.dueDate)}`,
    '',
    'Task context:',
    task.context || 'No additional notes.',
    '',
    'Previous AI workflow:',
    `Tool: ${task.aiTool || 'Not recorded'}`,
    `Prompt: ${task.aiPrompt || 'Not recorded'}`,
    `Outcome: ${task.aiOutcome || 'Not recorded'}`,
  ].join('\n');
}

function generatePrompt(request, task, mode, anchors) {
  const instructions = {
    build:
      'Help me implement this feature. Give me a clear step-by-step approach, relevant React code, where the changes should go, and a testing checklist.',
    debug:
      'Help me investigate this problem. Explain likely causes, how to test them, the smallest suitable fix, and how to confirm it works.',
    explain:
      'Explain this concept clearly and simply. Use practical examples relevant to my project and avoid unnecessary jargon.',
    plan:
      'Turn this request into manageable tasks. Include priorities, dependencies, possible problems and a definition of done.',
  };

  const references = anchors.length
    ? anchors
        .map(
          (anchor) =>
            `- ${anchor.title}: ${anchor.description || 'Project reference'}${
              anchor.url ? ` (${anchor.url})` : ''
            }`
        )
        .join('\n')
    : 'No project links have been pinned.';

  return [
    'You are an experienced React developer helping me build FlowState.',
    '',
    'PROJECT BACKGROUND',
    'FlowState is a Vibecoding Project Tracker built using React, Vite and Tailwind CSS.',
    'It includes a four-stage Kanban board, team assignments, deadlines, AI development notes, and project deliverables.',
    'Project data is saved locally using localStorage.',
    '',
    'MY REQUEST',
    request.trim(),
    '',
    'WHAT I NEED FROM YOU',
    instructions[mode] || instructions.build,
    '',
    ...(task
      ? ['RELATED TASK', taskContext(task), '']
      : []),
    'PROJECT REFERENCES',
    references,
    '',
    'IMPORTANT',
    '- Keep existing features working.',
    '- Preserve existing localStorage keys and saved data.',
    '- Keep the design clean, responsive and easy to use.',
    '- Explain exactly what code needs changing.',
    '- Do not assume you have opened any linked documents.',
    '- End with a short checklist to verify the result.',
  ].join('\n');
}

function Modal({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${
          wide ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-2xl text-slate-400 hover:bg-slate-100"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
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

  const [anchors, setAnchors] = useLocalStorage(
    'vibetracker.anchors',
    []
  );

  const [page, setPage] = useState('overview');

  const [editing, setEditing] = useState(null);
  const [taskForm, setTaskForm] = useState(emptyTask());
  const [taskMessage, setTaskMessage] = useState('');

  const [teamOpen, setTeamOpen] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [teamError, setTeamError] = useState('');

  const [editingAnchor, setEditingAnchor] = useState(null);
  const [anchorForm, setAnchorForm] = useState(emptyAnchor());
  const [anchorError, setAnchorError] = useState('');

  const [search, setSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');

  const [request, setRequest] = useState('');
  const [promptTaskId, setPromptTaskId] = useState('');
  const [mode, setMode] = useState('build');
  const [prompt, setPrompt] = useState('');
  const [promptMessage, setPromptMessage] = useState('');

  const completed = tasks.filter(
    (task) => task.status === 'done'
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === 'in-progress'
  ).length;

  const overdue = tasks.filter(
    (task) => deadline(task) === 'overdue'
  ).length;

  const percent = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const selectedTask = tasks.find(
    (task) => String(task.id) === promptTaskId
  );

  const navigation = [
    { id: 'overview', label: 'Overview', icon: '◈' },
    { id: 'board', label: 'Task Board', icon: '▦' },
    { id: 'ai', label: 'AI Studio', icon: '✦' },
    { id: 'deliverables', label: 'Deliverables', icon: '◫' },
  ];

  const headings = {
    overview: [
      'Project Overview',
      'Everything important about your project at a glance.',
    ],
    board: [
      'Task Board',
      'Manage your work from idea to completion.',
    ],
    ai: [
      'AI Prompt Studio',
      'Turn your ideas into better prompts, right here.',
    ],
    deliverables: [
      'Project Deliverables',
      'Your important documents and links in one place.',
    ],
  };

  function newTask() {
    setTaskMessage('');
    setTaskForm({
      ...emptyTask(),
      assignee: team[0] || '',
    });
    setEditing({ id: null });
  }

  function editTask(task) {
    setTaskMessage('');
    setTaskForm({
      ...emptyTask(),
      ...task,
      dueDate: task.dueDate || '',
    });
    setEditing(task);
  }

  function saveTask(event) {
    event.preventDefault();

    if (!taskForm.title.trim()) return;

    const saved = {
      ...taskForm,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      context: taskForm.context.trim(),
      aiTool: taskForm.aiTool.trim(),
      aiPrompt: taskForm.aiPrompt.trim(),
      aiOutcome: taskForm.aiOutcome.trim(),
      dueDate: taskForm.dueDate || null,
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
    if (!window.confirm('Delete this task?')) return;

    setTasks((current) =>
      current.filter((task) => task.id !== editing.id)
    );
    setEditing(null);
  }

  function moveTask(id, status) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
  }

  function addMember(event) {
    event.preventDefault();

    const name = memberName.trim().replace(/\s+/g, ' ');
    if (!name) return;

    if (
      team.some(
        (member) =>
          member.toLowerCase() === name.toLowerCase()
      )
    ) {
      setTeamError('This person is already on the team.');
      return;
    }

    setTeam((current) => [...current, name]);
    setMemberName('');
    setTeamError('');
  }

  function removeMember(name) {
    if (tasks.some((task) => task.assignee === name)) {
      setTeamError(
        'Reassign their tasks before removing this member.'
      );
      return;
    }

    setTeam((current) =>
      current.filter((member) => member !== name)
    );
    setTeamError('');
  }

  function newAnchor() {
    setAnchorForm(emptyAnchor());
    setAnchorError('');
    setEditingAnchor({ id: null });
  }

  function editAnchor(anchor) {
    setAnchorForm({
      title: anchor.title,
      description: anchor.description || '',
      url: anchor.url || '',
    });
    setAnchorError('');
    setEditingAnchor(anchor);
  }

  function saveAnchor(event) {
    event.preventDefault();

    const saved = {
      title: anchorForm.title.trim(),
      description: anchorForm.description.trim(),
      url: anchorForm.url.trim(),
    };

    if (!saved.title) return;

    if (saved.url && !safeLink(saved.url)) {
      setAnchorError(
        'Please enter a valid http:// or https:// link.'
      );
      return;
    }

    if (editingAnchor.id === null) {
      setAnchors((current) => [
        ...current,
        {
          ...saved,
          id: crypto.randomUUID(),
        },
      ]);
    } else {
      setAnchors((current) =>
        current.map((anchor) =>
          anchor.id === editingAnchor.id
            ? { ...anchor, ...saved }
            : anchor
        )
      );
    }

    setEditingAnchor(null);
  }

  function deleteAnchor() {
    if (!window.confirm('Remove this deliverable?')) return;

    setAnchors((current) =>
      current.filter(
        (anchor) => anchor.id !== editingAnchor.id
      )
    );
    setEditingAnchor(null);
  }

  async function copyText(text, feedback) {
    try {
      await navigator.clipboard.writeText(text);
      feedback('Copied to clipboard!');
    } catch {
      feedback(
        'Clipboard unavailable. Select the text and copy it manually.'
      );
    }
  }

  function openStudio(task) {
    if (task) {
      setPromptTaskId(String(task.id));
      setRequest(`Help me with: ${task.title}`);
    }
    setPrompt('');
    setPromptMessage('');
    setPage('ai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function makeNewPrompt() {
    if (!request.trim()) {
      setPromptMessage('Write what you need help with first.');
      return;
    }

    setPrompt(
      generatePrompt(request, selectedTask, mode, anchors)
    );

    setPromptMessage(
      'Prompt generated! You can edit it before copying.'
    );
  }

  const visibleTasks = tasks.filter((task) => {
    const matchesSearch = [
      task.title,
      task.description,
      task.assignee,
      task.context,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      taskFilter === 'all' ||
      (taskFilter === 'overdue'
        ? deadline(task) === 'overdue'
        : taskFilter === 'mine'
          ? task.assignee === team[0]
          : task.type === taskFilter);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      {/* DARK NAVIGATION */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c1426] text-white shadow-lg">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <button
            type="button"
            onClick={() => setPage('overview')}
            className="flex items-center gap-3 text-left"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-black shadow-lg shadow-indigo-500/20">
              F
            </span>
            <span>
              <span className="block text-xl font-extrabold tracking-tight">
                Flow
                <span className="text-indigo-400">
                  State
                </span>
              </span>
              <span className="block text-[10px] font-semibold tracking-widest text-slate-400">
                PROJECT TRACKER
              </span>
            </span>
          </button>

          <nav
            aria-label="Main navigation"
            className="order-3 flex w-full gap-1 overflow-x-auto md:order-2 md:w-auto"
          >
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  page === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="order-2 flex items-center gap-2 md:order-3">
            <button
              type="button"
              onClick={() => setTeamOpen(true)}
              className="rounded-xl border border-white/15 px-3 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              Team · {team.length}
            </button>

            <button
              type="button"
              onClick={newTask}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold hover:bg-indigo-500"
            >
              + New Task
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8">
        {/* PAGE HEADING */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            FlowState Workspace
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
            {headings[page][0]}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {headings[page][1]}
          </p>
        </div>

        {/* OVERVIEW */}
        {page === 'overview' && (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  name: 'Total Tasks',
                  value: tasks.length,
                  colour: 'text-indigo-600',
                  icon: '▦',
                },
                {
                  name: 'In Progress',
                  value: inProgress,
                  colour: 'text-blue-600',
                  icon: '↗',
                },
                {
                  name: 'Completed',
                  value: completed,
                  colour: 'text-emerald-600',
                  icon: '✓',
                },
                {
                  name: 'Overdue',
                  value: overdue,
                  colour: 'text-rose-600',
                  icon: '!',
                },
              ].map((stat) => (
                <div
                  key={stat.name}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">
                      {stat.name}
                    </p>
                    <span
                      className={`text-xl font-bold ${stat.colour}`}
                    >
                      {stat.icon}
                    </span>
                  </div>
                  <p
                    className={`mt-4 text-4xl font-extrabold ${stat.colour}`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl bg-gradient-to-r from-[#14203c] to-[#33276e] p-7 text-white shadow-lg">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-200">
                    PROJECT PROGRESS
                  </span>
                  <h2 className="mt-5 text-2xl font-extrabold">
                    Keep the momentum going.
                  </h2>
                  <p className="mt-2 text-sm text-indigo-100">
                    {completed} of {tasks.length} tasks completed.
                  </p>
                </div>
                <span className="text-4xl font-extrabold">
                  {percent}%
                </span>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-300 to-violet-300 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <button
                type="button"
                onClick={() => setPage('board')}
                className="mt-6 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-900 hover:bg-indigo-50"
              >
                Open Task Board →
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  Current Priorities
                </h2>
                <button
                  type="button"
                  onClick={() => setPage('board')}
                  className="text-sm font-bold text-indigo-600 hover:underline"
                >
                  View Board →
                </button>
              </div>

              <div className="space-y-3">
                {tasks
                  .filter((task) => task.status !== 'done')
                  .slice(0, 4)
                  .map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => editTask(task)}
                      className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {task.assignee || 'Unassigned'}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {STAGES.find(
                          (stage) => stage.id === task.status
                        )?.label}
                      </span>
                    </button>
                  ))}

                {tasks.every((task) => task.status === 'done') && (
                  <p className="rounded-xl bg-emerald-50 p-5 text-sm text-emerald-700">
                    All tasks are complete!
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* TASK BOARD */}
        {page === 'board' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-1 flex-wrap gap-3">
                <input
                  aria-label="Search tasks"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search tasks..."
                  className={`${field} max-w-sm`}
                />

                <select
                  aria-label="Filter tasks"
                  value={taskFilter}
                  onChange={(event) =>
                    setTaskFilter(event.target.value)
                  }
                  className={`${field} max-w-[170px]`}
                >
                  <option value="all">All Tasks</option>
                  <option value="mine">My Tasks</option>
                  <option value="feature">Features</option>
                  <option value="bug">Bugs</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <button
                type="button"
                onClick={newTask}
                className={primary}
              >
                + Add Task
              </button>
            </div>

            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              <span className="rounded-full bg-white px-3 py-2 text-slate-500">
                ● Normal
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700">
                ● Due Soon
              </span>
              <span className="rounded-full bg-red-50 px-3 py-2 text-red-700">
                ● Overdue
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {STAGES.map((stage) => {
                const stageTasks = visibleTasks.filter(
                  (task) => task.status === stage.id
                );

                return (
                  <section
                    key={stage.id}
                    className="min-h-[420px] rounded-2xl border border-slate-200 bg-[#edf1f7] p-3"
                  >
                    <div className="mb-4 flex items-center justify-between px-2 pt-2">
                      <h2 className="flex items-center gap-2 text-sm font-extrabold">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${stage.dot}`}
                        />
                        {stage.label}
                      </h2>
                      <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                        {stageTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {stageTasks.map((task) => {
                        const state = deadline(task);

                        return (
                          <article
                            key={task.id}
                            className={`rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
                              state === 'overdue'
                                ? 'border-red-300 bg-red-50'
                                : state === 'soon'
                                  ? 'border-amber-300 bg-amber-50'
                                  : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="mb-3 flex items-start justify-between gap-2">
                              <span
                                className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${
                                  task.type === 'bug'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-indigo-100 text-indigo-700'
                                }`}
                              >
                                {task.type === 'bug'
                                  ? 'Bug'
                                  : 'Feature'}
                              </span>

                              <button
                                type="button"
                                onClick={() => editTask(task)}
                                className="text-xs font-bold text-indigo-600 hover:underline"
                              >
                                Edit
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => editTask(task)}
                              className="w-full text-left"
                            >
                              <h3 className="break-words text-sm font-extrabold leading-6">
                                {task.title}
                              </h3>
                              <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500">
                                {task.description ||
                                  'No description yet.'}
                              </p>
                            </button>

                            {task.context && (
                              <div className="mt-3 rounded-lg bg-indigo-50 p-3">
                                <p className="mb-1 text-[10px] font-extrabold uppercase text-indigo-600">
                                  ✦ AI Context
                                </p>
                                <p className="line-clamp-2 whitespace-pre-wrap text-xs text-indigo-700">
                                  {task.context}
                                </p>
                              </div>
                            )}

                            {task.dueDate && (
                              <p
                                className={`mt-3 text-xs font-semibold ${
                                  state === 'overdue'
                                    ? 'text-red-600'
                                    : state === 'soon'
                                      ? 'text-amber-700'
                                      : 'text-slate-500'
                                }`}
                              >
                                ◷ {formatDate(task.dueDate)}
                                {state === 'overdue'
                                  ? ' · Overdue'
                                  : state === 'soon'
                                    ? ' · Due Soon'
                                    : ''}
                              </p>
                            )}

                            <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                                {initials(task.assignee)}
                              </span>
                              <span className="min-w-0 truncate text-xs text-slate-500">
                                {task.assignee || 'Unassigned'}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => openStudio(task)}
                                className="rounded-lg bg-indigo-50 px-2 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                              >
                                ✦ AI Prompt
                              </button>

                              <select
                                aria-label={`Move ${task.title}`}
                                value={task.status}
                                onChange={(event) =>
                                  moveTask(
                                    task.id,
                                    event.target.value
                                  )
                                }
                                className="min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600"
                              >
                                {STAGES.map((option) => (
                                  <option
                                    key={option.id}
                                    value={option.id}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </article>
                        );
                      })}

                      {stageTasks.length === 0 && (
                        <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-400">
                          No tasks here yet.
                        </p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}

        {/* AI PROMPT STUDIO */}
        {page === 'ai' && (
          <div className="mx-auto max-w-4xl space-y-5">
            <section className="rounded-2xl bg-gradient-to-r from-[#14203c] to-[#33276e] p-6 text-white">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-200">
                ✦ FLOWSTATE AI
              </span>
              <h2 className="mt-4 text-2xl font-extrabold">
                What are we building today?
              </h2>
              <p className="mt-2 text-sm leading-6 text-indigo-100">
                Describe your idea and FlowState will create a
                structured prompt using your project context.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <label
                htmlFor="ai-request"
                className="mb-2 block text-sm font-bold"
              >
                Your request
              </label>

              <textarea
                id="ai-request"
                rows={5}
                value={request}
                onChange={(event) =>
                  setRequest(event.target.value)
                }
                placeholder="e.g. Help me make my Kanban board responsive on mobile, keeping the same design and functionality..."
                className={`${field} resize-y`}
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="prompt-mode"
                    className={label}
                  >
                    What kind of help?
                  </label>

                  <select
                    id="prompt-mode"
                    value={mode}
                    onChange={(event) =>
                      setMode(event.target.value)
                    }
                    className={field}
                  >
                    <option value="build">
                      Build a Feature
                    </option>
                    <option value="debug">
                      Fix a Bug
                    </option>
                    <option value="explain">
                      Explain Something
                    </option>
                    <option value="plan">
                      Plan Next Steps
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="prompt-task"
                    className={label}
                  >
                    Related Task (optional)
                  </label>

                  <select
                    id="prompt-task"
                    value={promptTaskId}
                    onChange={(event) =>
                      setPromptTaskId(event.target.value)
                    }
                    className={field}
                  >
                    <option value="">
                      No Specific Task
                    </option>
                    {tasks.map((task) => (
                      <option
                        key={task.id}
                        value={String(task.id)}
                      >
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  ✓ Includes relevant project context
                </p>

                <button
                  type="button"
                  onClick={makeNewPrompt}
                  className={primary}
                >
                  ✦ Generate Prompt
                </button>
              </div>
            </section>

            {prompt && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">
                      Your Generated Prompt
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Edit anything before copying.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    ✓ Ready to Use
                  </span>
                </div>

                <textarea
                  aria-label="Generated prompt"
                  rows={16}
                  value={prompt}
                  onChange={(event) =>
                    setPrompt(event.target.value)
                  }
                  className={`${field} resize-y font-mono text-xs leading-6`}
                />

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      copyText(prompt, setPromptMessage)
                    }
                    className={primary}
                  >
                    Copy Prompt
                  </button>

                  <button
                    type="button"
                    onClick={makeNewPrompt}
                    className={secondary}
                  >
                    Regenerate
                  </button>

                  <a
                    href="https://chatgpt.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={secondary}
                  >
                    Open ChatGPT ↗
                  </a>
                </div>
              </section>
            )}

            {promptMessage && (
              <p
                role="status"
                className="text-sm font-semibold text-indigo-600"
              >
                {promptMessage}
              </p>
            )}

            <p className="text-center text-xs text-slate-400">
              Prompts are created locally from your input and
              project details. No API key is required.
            </p>
          </div>
        )}

        {/* DELIVERABLES */}
        {page === 'deliverables' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <h2 className="text-lg font-bold">
                  Project Anchor Board
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {anchors.length} pinned{' '}
                  {anchors.length === 1
                    ? 'deliverable'
                    : 'deliverables'}
                </p>
              </div>

              <button
                type="button"
                onClick={newAnchor}
                className={primary}
              >
                + Add Deliverable
              </button>
            </div>

            {anchors.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-white p-12 text-center">
                <span className="text-4xl text-indigo-600">
                  ◫
                </span>
                <h3 className="mt-4 text-lg font-extrabold">
                  Nothing pinned yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Add your GitHub repo, project document,
                  presentation or demo link.
                </p>
                <button
                  type="button"
                  onClick={newAnchor}
                  className={`${primary} mt-5`}
                >
                  Add Your First Deliverable
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {anchors.map((anchor) => (
                  <article
                    key={anchor.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-2xl text-indigo-600">
                        ◫
                      </span>

                      <button
                        type="button"
                        onClick={() => editAnchor(anchor)}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    <h3 className="break-words text-base font-extrabold">
                      {anchor.title}
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
                      {anchor.description ||
                        'Pinned project resource'}
                    </p>

                    {safeLink(anchor.url) && (
                      <a
                        href={safeLink(anchor.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-block text-sm font-bold text-indigo-600 hover:underline"
                      >
                        Open Resource ↗
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          FlowState · Vibecoding Project Tracker
        </footer>
      </main>

      {/* ADD / EDIT TASK */}
      {editing !== null && (
        <Modal
          title={
            editing.id === null
              ? 'Create Task'
              : 'Edit Task'
          }
          subtitle="Manage the task and keep its development context together."
          onClose={() => setEditing(null)}
          wide
        >
          <form onSubmit={saveTask} className="space-y-5">
            <div>
              <label htmlFor="task-title" className={label}>
                Task Title
              </label>
              <input
                id="task-title"
                required
                value={taskForm.title}
                onChange={(event) =>
                  setTaskForm({
                    ...taskForm,
                    title: event.target.value,
                  })
                }
                placeholder="What needs to be done?"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="task-description" className={label}>
                Description
              </label>
              <textarea
                id="task-description"
                rows={3}
                value={taskForm.description}
                onChange={(event) =>
                  setTaskForm({
                    ...taskForm,
                    description: event.target.value,
                  })
                }
                placeholder="Describe the task..."
                className={field}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="task-type" className={label}>
                  Type
                </label>
                <select
                  id="task-type"
                  value={taskForm.type}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      type: event.target.value,
                    })
                  }
                  className={field}
                >
                  <option value="feature">Feature</option>
                  <option value="bug">Bug</option>
                </select>
              </div>

              <div>
                <label htmlFor="task-status" className={label}>
                  Status
                </label>
                <select
                  id="task-status"
                  value={taskForm.status}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      status: event.target.value,
                    })
                  }
                  className={field}
                >
                  {STAGES.map((stage) => (
                    <option
                      key={stage.id}
                      value={stage.id}
                    >
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="task-owner" className={label}>
                  Assigned To
                </label>
                <select
                  id="task-owner"
                  value={taskForm.assignee}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      assignee: event.target.value,
                    })
                  }
                  className={field}
                >
                  <option value="">Unassigned</option>

                  {taskForm.assignee &&
                    !team.includes(taskForm.assignee) && (
                      <option value={taskForm.assignee}>
                        {taskForm.assignee}
                      </option>
                    )}

                  {team.map((member) => (
                    <option
                      key={member}
                      value={member}
                    >
                      {member}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="task-date" className={label}>
                  Due Date
                </label>
                <input
                  id="task-date"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      dueDate: event.target.value,
                    })
                  }
                  className={field}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
              <h3 className="text-sm font-extrabold text-indigo-800">
                ✦ AI Task Context
              </h3>
              <p className="mb-3 mt-1 text-xs text-indigo-600">
                Save requirements, relevant files and decisions
                for future AI prompts.
              </p>

              <textarea
                aria-label="Task Context / AI Briefing"
                rows={4}
                value={taskForm.context}
                onChange={(event) =>
                  setTaskForm({
                    ...taskForm,
                    context: event.target.value,
                  })
                }
                placeholder="Relevant files, requirements, technical constraints..."
                className={field}
              />

              <button
                type="button"
                onClick={() =>
                  copyText(
                    taskContext(taskForm),
                    setTaskMessage
                  )
                }
                className="mt-3 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Copy Task Context
              </button>

              {taskMessage && (
                <p
                  role="status"
                  className="mt-2 text-xs font-semibold text-indigo-700"
                >
                  {taskMessage}
                </p>
              )}
            </div>

            <details className="rounded-2xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer text-sm font-extrabold text-slate-800">
                ✦ AI Development Log (optional)
              </summary>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Record how AI helped you complete this task.
                Useful for reviewing your hackathon workflow.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="ai-tool" className={label}>
                    AI Tool Used
                  </label>
                  <input
                    id="ai-tool"
                    value={taskForm.aiTool}
                    onChange={(event) =>
                      setTaskForm({
                        ...taskForm,
                        aiTool: event.target.value,
                      })
                    }
                    placeholder="e.g. ChatGPT"
                    className={field}
                  />
                </div>

                <div>
                  <label htmlFor="ai-prompt" className={label}>
                    Prompt Used
                  </label>
                  <textarea
                    id="ai-prompt"
                    rows={3}
                    value={taskForm.aiPrompt}
                    onChange={(event) =>
                      setTaskForm({
                        ...taskForm,
                        aiPrompt: event.target.value,
                      })
                    }
                    placeholder="What did you ask?"
                    className={field}
                  />
                </div>

                <div>
                  <label htmlFor="ai-outcome" className={label}>
                    Outcome
                  </label>
                  <textarea
                    id="ai-outcome"
                    rows={3}
                    value={taskForm.aiOutcome}
                    onChange={(event) =>
                      setTaskForm({
                        ...taskForm,
                        aiOutcome: event.target.value,
                      })
                    }
                    placeholder="What worked and what did you change?"
                    className={field}
                  />
                </div>
              </div>
            </details>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              {editing.id !== null ? (
                <button
                  type="button"
                  onClick={deleteTask}
                  className="text-sm font-bold text-red-600 hover:underline"
                >
                  Delete Task
                </button>
              ) : (
                <span />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className={secondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={primary}
                >
                  {editing.id === null
                    ? 'Create Task'
                    : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* TEAM MANAGEMENT */}
      {teamOpen && (
        <Modal
          title="Manage Team"
          subtitle="Add teammates and assign tasks to them."
          onClose={() => {
            setTeamOpen(false);
            setTeamError('');
          }}
        >
          <form
            onSubmit={addMember}
            className="flex gap-2"
          >
            <input
              aria-label="Team member name"
              value={memberName}
              onChange={(event) => {
                setMemberName(event.target.value);
                setTeamError('');
              }}
              placeholder="Team member name"
              required
              className={`${field} min-w-0 flex-1`}
            />
            <button
              type="submit"
              className={primary}
            >
              Add
            </button>
          </form>

          {teamError && (
            <p
              role="alert"
              className="mt-3 text-sm text-red-600"
            >
              {teamError}
            </p>
          )}

          <div className="mt-5 space-y-2">
            {team.map((member) => (
              <div
                key={member}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {initials(member)}
                  </span>
                  <span className="truncate text-sm font-semibold">
                    {member}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeMember(member)}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setTeamOpen(false);
              setTeamError('');
            }}
            className={`${secondary} mt-5 w-full`}
          >
            Done
          </button>
        </Modal>
      )}

      {/* DELIVERABLE EDITOR */}
      {editingAnchor !== null && (
        <Modal
          title={
            editingAnchor.id === null
              ? 'Add Deliverable'
              : 'Edit Deliverable'
          }
          subtitle="Keep important project resources together."
          onClose={() => setEditingAnchor(null)}
        >
          <form
            onSubmit={saveAnchor}
            className="space-y-5"
          >
            <div>
              <label htmlFor="anchor-title" className={label}>
                Deliverable Name
              </label>
              <input
                id="anchor-title"
                required
                value={anchorForm.title}
                onChange={(event) =>
                  setAnchorForm({
                    ...anchorForm,
                    title: event.target.value,
                  })
                }
                placeholder="e.g. Project Presentation"
                className={field}
              />
            </div>

            <div>
              <label
                htmlFor="anchor-description"
                className={label}
              >
                Description
              </label>
              <textarea
                id="anchor-description"
                rows={3}
                value={anchorForm.description}
                onChange={(event) =>
                  setAnchorForm({
                    ...anchorForm,
                    description: event.target.value,
                  })
                }
                placeholder="What is this resource for?"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="anchor-url" className={label}>
                Link (optional)
              </label>
              <input
                id="anchor-url"
                type="url"
                value={anchorForm.url}
                onChange={(event) =>
                  setAnchorForm({
                    ...anchorForm,
                    url: event.target.value,
                  })
                }
                placeholder="https://..."
                className={field}
              />
            </div>

            {anchorError && (
              <p
                role="alert"
                className="text-sm text-red-600"
              >
                {anchorError}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
              {editingAnchor.id !== null ? (
                <button
                  type="button"
                  onClick={deleteAnchor}
                  className="text-sm font-bold text-red-600 hover:underline"
                >
                  Remove
                </button>
              ) : (
                <span />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAnchor(null)}
                  className={secondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={primary}
                >
                  {editingAnchor.id === null
                    ? 'Add Deliverable'
                    : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
