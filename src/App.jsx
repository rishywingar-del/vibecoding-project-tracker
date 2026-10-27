
import { useEffect, useMemo, useState } from 'react';

export const STAGES = [
  { id: 'todo', label: 'To Do', colour: 'bg-slate-400' },
  { id: 'in-progress', label: 'In Progress', colour: 'bg-blue-400' },
  { id: 'review', label: 'Review', colour: 'bg-amber-400' },
  { id: 'done', label: 'Done', colour: 'bg-emerald-400' },
];

const NAV = [
  { id: 'overview', label: 'Overview', icon: '◈' },
  { id: 'board', label: 'Task Board', icon: '▦' },
  { id: 'ai', label: 'AI Studio', icon: '✦' },
  { id: 'deliverables', label: 'Deliverables', icon: '◫' },
];

const MODES = [
  {
    id: 'build',
    label: 'Build a feature',
    description: 'Turn a task into a clear implementation plan.',
    instruction:
      'Help me implement this feature. Break it into manageable steps, provide code where useful, explain which files to change and include acceptance checks.',
  },
  {
    id: 'debug',
    label: 'Debug an issue',
    description: 'Investigate bugs without losing project context.',
    instruction:
      'Help me debug this issue. Identify likely causes, suggest a systematic investigation, propose a minimal fix and explain how to test it.',
  },
  {
    id: 'review',
    label: 'Review my work',
    description: 'Check quality, usability and missing requirements.',
    instruction:
      'Review this task against its requirements. Identify potential bugs, accessibility issues, edge cases and improvements. Prioritise the findings.',
  },
  {
    id: 'plan',
    label: 'Plan next steps',
    description: 'Get a practical checklist for what to do next.',
    instruction:
      'Create an actionable plan for completing this task. Include dependencies, a sensible order of work, risks and a definition of done.',
  },
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
      // Ignore storage errors.
    }
  }, [key, value]);

  return [value, setValue];
}

const blankTask = () => ({
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

const blankAnchor = () => ({
  title: '',
  description: '',
  url: '',
});

const input =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

const primary =
  'rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50';

const secondary =
  'rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50';

const label = 'mb-1.5 block text-sm font-semibold text-slate-700';

function initials(name) {
  return (
    (name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('') || '?'
  );
}

function dueState(task) {
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

function prettyDate(date) {
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

function stageLabel(id) {
  return STAGES.find((stage) => stage.id === id)?.label || id;
}

function taskContext(task) {
  return [
    `Task: ${task.title}`,
    `Type: ${task.type === 'bug' ? 'Bug' : 'Feature'}`,
    `Status: ${stageLabel(task.status)}`,
    `Owner: ${task.assignee || 'Unassigned'}`,
    `Due date: ${prettyDate(task.dueDate)}`,
    '',
    'Description:',
    task.description || 'No description provided.',
    '',
    'Development context:',
    task.context || 'No additional context provided.',
    '',
    'AI workflow:',
    `Tool: ${task.aiTool || 'Not recorded'}`,
    `Prompt used: ${task.aiPrompt || 'Not recorded'}`,
    `Outcome: ${task.aiOutcome || 'Not recorded'}`,
  ].join('\n');
}

function makePrompt(task, mode, anchors, tasks) {
  if (!task) return '';

  const selected = MODES.find((item) => item.id === mode) || MODES[0];

  const projectAnchors = anchors.length
    ? anchors
        .map(
          (anchor) =>
            `- ${anchor.title}\n  ${anchor.description || ''}${
              anchor.url ? `\n  ${anchor.url}` : ''
            }`
        )
        .join('\n')
    : 'No project deliverables have been pinned.';

  const progress = tasks.filter(
    (item) => item.status === 'done'
  ).length;

  return [
    'FLOWSTATE — PROJECT-AWARE AI BRIEFING',
    '',
    'PROJECT',
    'Vibecoding Project Tracker, built with React, Vite and Tailwind CSS.',
    'The app uses localStorage for task and project data.',
    'The workflow is To Do → In Progress → Review → Done.',
    '',
    'CURRENT PROJECT PROGRESS',
    `${progress} of ${tasks.length} tasks completed.`,
    '',
    'WHAT I NEED HELP WITH',
    selected.instruction,
    '',
    'TASK DETAILS',
    taskContext(task),
    '',
    'PROJECT DELIVERABLES AND REFERENCES',
    projectAnchors,
    '',
    'IMPORTANT INSTRUCTIONS',
    '- Work with the existing React project rather than rebuilding it.',
    '- Preserve working features and existing localStorage data.',
    '- Do not claim to have read linked documents unless I provide their contents.',
    '- Explain code changes clearly and keep them beginner-friendly.',
    '- Finish with a short testing checklist.',
  ].join('\n');
}

function Modal({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${
          wide ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
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
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
        style={{ width: `${value}%` }}
      />
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
  const [form, setForm] = useState(blankTask());

  const [teamOpen, setTeamOpen] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [teamError, setTeamError] = useState('');

  const [editingAnchor, setEditingAnchor] = useState(null);
  const [anchorForm, setAnchorForm] = useState(blankAnchor());

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [studioTaskId, setStudioTaskId] = useState('');
  const [studioMode, setStudioMode] = useState('build');
  const [studioMessage, setStudioMessage] = useState('');
  const [taskMessage, setTaskMessage] = useState('');

  const completed = tasks.filter(
    (task) => task.status === 'done'
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === 'in-progress'
  ).length;

  const overdue = tasks.filter(
    (task) => dueState(task) === 'overdue'
  ).length;

  const completion = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const query = search.toLowerCase().trim();

        const matchesSearch =
          !query ||
          [
            task.title,
            task.description,
            task.assignee,
            task.context,
          ]
            .join(' ')
            .toLowerCase()
            .includes(query);

        const matchesFilter =
          filter === 'all' ||
          (filter === 'overdue'
            ? dueState(task) === 'overdue'
            : filter === 'mine'
              ? task.assignee === team[0]
              : task.type === filter);

        return matchesSearch && matchesFilter;
      }),
    [tasks, search, filter, team]
  );

  const studioTask = tasks.find(
    (task) => String(task.id) === studioTaskId
  );

  const activeStudioId = studioTask
    ? studioTaskId
    : tasks.length
      ? String(tasks[0].id)
      : '';

  const activeStudioTask = tasks.find(
    (task) => String(task.id) === activeStudioId
  );

  const prompt = makePrompt(
    activeStudioTask,
    studioMode,
    anchors,
    tasks
  );

  function newTask() {
    setTaskMessage('');
    setForm({
      ...blankTask(),
      assignee: team[0] || '',
    });
    setEditing({ id: null });
  }

  function editTask(task) {
    setTaskMessage('');
    setForm({
      ...blankTask(),
      ...task,
      dueDate: task.dueDate || '',
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
      aiTool: form.aiTool.trim(),
      aiPrompt: form.aiPrompt.trim(),
      aiOutcome: form.aiOutcome.trim(),
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
          task.id === editing.id ? { ...task, ...saved } : task
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
        'Reassign their tasks before removing them.'
      );
      return;
    }

    setTeam((current) =>
      current.filter((member) => member !== name)
    );
    setTeamError('');
  }

  function newAnchor() {
    setAnchorForm(blankAnchor());
    setEditingAnchor({ id: null });
  }

  function editAnchor(anchor) {
    setAnchorForm({
      title: anchor.title,
      description: anchor.description || '',
      url: anchor.url || '',
    });
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
      window.alert('Enter a valid http:// or https:// link.');
      return;
    }

    if (editingAnchor.id === null) {
      setAnchors((current) => [
        ...current,
        { ...saved, id: crypto.randomUUID() },
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
      return true;
    } catch {
      feedback(
        'Clipboard unavailable. Select the text and copy manually.'
      );
      return false;
    }
  }

  function openStudio(task) {
    if (task) setStudioTaskId(String(task.id));
    setStudioMessage('');
    setPage('ai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function openChatGPT() {
    if (!prompt) return;

    const copied = await copyText(prompt, setStudioMessage);

    if (copied) {
      window.open(
        'https://chatgpt.com/',
        '_blank',
        'noopener,noreferrer'
      );
    }
  }

  const stats = [
    {
      title: 'Total tasks',
      value: tasks.length,
      note: 'Across your project',
      colour: 'text-indigo-600',
      symbol: '▦',
    },
    {
      title: 'In progress',
      value: inProgress,
      note: 'Currently being worked on',
      colour: 'text-blue-600',
      symbol: '↗',
    },
    {
      title: 'Completed',
      value: completed,
      note: `${completion}% of all tasks`,
      colour: 'text-emerald-600',
      symbol: '✓',
    },
    {
      title: 'Overdue',
      value: overdue,
      note: 'Needs attention',
      colour: 'text-rose-600',
      symbol: '!',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      {/* DARK NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b1120] text-white shadow-xl">
        <div className="mx-auto max-w-[1600px] px-5 lg:px-8">
          <div className="flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-3">
            <button
              type="button"
              onClick={() => setPage('overview')}
              className="flex items-center gap-3 text-left"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold shadow-lg shadow-indigo-500/20">
                F
              </span>
              <span>
                <span className="block text-xl font-extrabold tracking-tight">
                  Flow<span className="text-indigo-400">State</span>
                </span>
                <span className="block text-[11px] font-medium tracking-wide text-slate-400">
                  VIBECODING PROJECT TRACKER
                </span>
              </span>
            </button>

            <nav
              aria-label="Main navigation"
              className="order-3 flex w-full gap-1 overflow-x-auto pb-1 md:order-2 md:w-auto md:pb-0"
            >
              {NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPage(item.id)}
                  className={`shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                    page === item.id
                      ? 'bg-indigo-600 text-white shadow-md'
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
                className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10 sm:block"
              >
                Team · {team.length}
              </button>
              <button
                type="button"
                onClick={newTask}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
              >
                + New Task
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
        {/* PAGE INTRO */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Project workspace
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              {page === 'overview' && 'Your project, in flow.'}
              {page === 'board' && 'Task Board'}
              {page === 'ai' && 'AI Studio'}
              {page === 'deliverables' && 'Project Deliverables'}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {page === 'overview' &&
                'A clear view of your progress, priorities and next steps.'}
              {page === 'board' &&
                'Plan, assign and move work through your four-stage workflow.'}
              {page === 'ai' &&
                'Turn your project knowledge into useful prompts for ChatGPT.'}
              {page === 'deliverables' &&
                'Keep important links, documents and final outputs together.'}
            </p>
          </div>

          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700">
            ✦ AI-ready workspace
          </span>
        </div>

        {/* OVERVIEW */}
        {page === 'overview' && (
          <div className="space-y-7">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500">
                      {stat.title}
                    </span>
                    <span className={`text-xl font-bold ${stat.colour}`}>
                      {stat.symbol}
                    </span>
                  </div>
                  <p className="text-4xl font-extrabold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {stat.note}
                  </p>
                </div>
              ))}
            </section>

            <div className="grid gap-5 lg:grid-cols-3">
              <section className="rounded-2xl bg-gradient-to-br from-[#111b35] via-[#18234a] to-[#352475] p-7 text-white shadow-lg lg:col-span-2">
                <div className="mb-7 flex items-center justify-between">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
                    PROJECT HEALTH
                  </span>
                  <span className="text-xs text-indigo-200">
                    Live from your board
                  </span>
                </div>

                <h2 className="text-2xl font-bold">
                  Keep the momentum going.
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-indigo-100">
                  Track what has been finished, identify blockers
                  and keep your next development steps clear.
                </p>

                <div className="mt-8 flex items-end justify-between">
                  <span className="text-sm font-semibold text-indigo-100">
                    Overall completion
                  </span>
                  <span className="text-3xl font-extrabold">
                    {completion}%
                  </span>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-300 to-violet-300 transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setPage('board')}
                    className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-900 hover:bg-indigo-50"
                  >
                    Open Task Board →
                  </button>
                  <button
                    type="button"
                    onClick={() => openStudio()}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20"
                  >
                    ✦ Open AI Studio
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">Workflow breakdown</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Your tasks across each stage
                </p>

                <div className="mt-6 space-y-5">
                  {STAGES.map((stage) => {
                    const count = tasks.filter(
                      (task) => task.status === stage.id
                    ).length;
                    const percent = tasks.length
                      ? (count / tasks.length) * 100
                      : 0;

                    return (
                      <div key={stage.id}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {stage.label}
                          </span>
                          <span className="font-bold text-slate-900">
                            {count}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${stage.colour}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Current priorities</h2>
                  <button
                    type="button"
                    onClick={() => setPage('board')}
                    className="text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    View all →
                  </button>
                </div>

                <div className="space-y-3">
                  {tasks
                    .filter((task) => task.status !== 'done')
                    .sort((a, b) => {
                      const order = { overdue: 0, soon: 1, normal: 2 };
                      return order[dueState(a)] - order[dueState(b)];
                    })
                    .slice(0, 4)
                    .map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => editTask(task)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {task.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {stageLabel(task.status)} ·{' '}
                            {task.assignee || 'Unassigned'}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                            dueState(task) === 'overdue'
                              ? 'bg-red-100 text-red-700'
                              : dueState(task) === 'soon'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {dueState(task) === 'overdue'
                            ? 'Overdue'
                            : dueState(task) === 'soon'
                              ? 'Due soon'
                              : 'On track'}
                        </span>
                      </button>
                    ))}

                  {tasks.every((task) => task.status === 'done') && (
                    <p className="rounded-xl bg-emerald-50 p-5 text-sm text-emerald-700">
                      All tasks are complete. Nice work!
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">Quick access</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Everything your project needs
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    {
                      title: 'AI Prompt Studio',
                      subtitle: 'Build a project-aware prompt',
                      page: 'ai',
                      icon: '✦',
                    },
                    {
                      title: 'Project Deliverables',
                      subtitle: `${anchors.length} pinned references`,
                      page: 'deliverables',
                      icon: '◫',
                    },
                    {
                      title: 'Team Management',
                      subtitle: `${team.length} team members`,
                      page: 'team',
                      icon: '◉',
                    },
                  ].map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() =>
                        item.page === 'team'
                          ? setTeamOpen(true)
                          : setPage(item.page)
                      }
                      className="flex w-full items-center gap-3 rounded-xl bg-slate-50 p-4 text-left hover:bg-indigo-50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-lg text-indigo-600">
                        {item.icon}
                      </span>
                      <span>
                        <span className="block text-sm font-bold">
                          {item.title}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.subtitle}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* TASK BOARD */}
        {page === 'board' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-1 flex-wrap gap-3">
                <input
                  aria-label="Search tasks"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks, owners, context..."
                  className={`${input} max-w-sm flex-1`}
                />

                <select
                  aria-label="Filter tasks"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className={`${input} max-w-[180px]`}
                >
                  <option value="all">All tasks</option>
                  <option value="mine">My tasks</option>
                  <option value="feature">Features</option>
                  <option value="bug">Bugs</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {filteredTasks.length} tasks shown
              </span>
            </div>

            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-500">
                ● Normal
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">
                ● Due within 3 days
              </span>
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-red-700">
                ● Overdue
              </span>
            </div>

            <main className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {STAGES.map((stage) => {
                const columnTasks = filteredTasks.filter(
                  (task) => task.status === stage.id
                );

                return (
                  <section
                    key={stage.id}
                    className="min-h-[440px] rounded-2xl border border-slate-200 bg-[#edf1f7] p-3"
                  >
                    <div className="mb-4 flex items-center justify-between px-2 pt-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${stage.colour}`}
                        />
                        <h2 className="text-sm font-extrabold">
                          {stage.label}
                        </h2>
                      </div>
                      <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {columnTasks.map((task) => {
                        const deadline = dueState(task);

                        return (
                          <article
                            key={task.id}
                            className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                              deadline === 'overdue'
                                ? 'border-red-300 bg-red-50/70'
                                : deadline === 'soon'
                                  ? 'border-amber-300 bg-amber-50/70'
                                  : 'border-slate-200'
                            }`}
                          >
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <span
                                className={`rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                                  task.type === 'bug'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-indigo-100 text-indigo-700'
                                }`}
                              >
                                {task.type === 'bug' ? 'Bug' : 'Feature'}
                              </span>
                              <button
                                type="button"
                                onClick={() => editTask(task)}
                                className="text-xs font-bold text-slate-400 hover:text-indigo-600"
                              >
                                Edit ↗
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => editTask(task)}
                              className="w-full text-left"
                            >
                              <h3 className="break-words text-sm font-extrabold leading-6 text-slate-900">
                                {task.title}
                              </h3>
                              <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500">
                                {task.description || 'No description yet.'}
                              </p>
                            </button>

                            {task.context && (
                              <div className="mt-3 rounded-xl bg-indigo-50 p-3">
                                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-indigo-600">
                                  ✦ AI Context
                                </p>
                                <p className="line-clamp-2 whitespace-pre-wrap text-xs text-indigo-800">
                                  {task.context}
                                </p>
                              </div>
                            )}

                            {(task.aiTool || task.aiOutcome) && (
                              <div className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700">
                                ✦ AI workflow recorded
                              </div>
                            )}

                            {task.dueDate && (
                              <p
                                className={`mt-3 text-xs font-bold ${
                                  deadline === 'overdue'
                                    ? 'text-red-600'
                                    : deadline === 'soon'
                                      ? 'text-amber-700'
                                      : 'text-slate-500'
                                }`}
                              >
                                ◷ {prettyDate(task.dueDate)}
                                {deadline === 'overdue' && ' · Overdue'}
                                {deadline === 'soon' && ' · Due soon'}
                              </p>
                            )}

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-extrabold text-indigo-700">
                                  {initials(task.assignee)}
                                </span>
                                <span className="truncate text-xs font-medium text-slate-500">
                                  {task.assignee || 'Unassigned'}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => openStudio(task)}
                                className="rounded-lg bg-indigo-50 px-2 py-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100"
                              >
                                ✦ Ask AI
                              </button>

                              <select
                                aria-label={`Move ${task.title} to another stage`}
                                value={task.status}
                                onChange={(event) =>
                                  moveTask(task.id, event.target.value)
                                }
                                className="min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-600"
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

                      {columnTasks.length === 0 && (
                        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white/60 p-6 text-center text-xs text-slate-400">
                          No tasks here yet.
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </main>
          </div>
        )}

        {/* AI STUDIO */}
        {page === 'ai' && (
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#111b35] to-[#352475] p-7 text-white">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-indigo-200">
                ✦ FLOWSTATE SECRET SAUCE
              </span>
              <h2 className="mt-4 text-2xl font-extrabold">
                Your project context. Better AI prompts.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
                Most task boards stop at tracking work. FlowState
                helps you turn that work into useful AI
                instructions, while keeping a record of the
                prompts, tools and outcomes behind your project.
              </p>
            </section>

            <div className="grid gap-6 xl:grid-cols-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                <h2 className="text-lg font-extrabold">
                  Build your prompt
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Start with a task and choose what you need.
                </p>

                <div className="mt-6">
                  <label className={label} htmlFor="studio-task">
                    1. Select a task
                  </label>
                  <select
                    id="studio-task"
                    className={input}
                    value={activeStudioId}
                    onChange={(event) => {
                      setStudioTaskId(event.target.value);
                      setStudioMessage('');
                    }}
                  >
                    {tasks.length === 0 && (
                      <option value="">No tasks available</option>
                    )}
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

                <div className="mt-6">
                  <p className={label}>2. Choose your AI goal</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {MODES.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setStudioMode(mode.id);
                          setStudioMessage('');
                        }}
                        className={`rounded-xl border p-4 text-left transition ${
                          studioMode === mode.id
                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                            : 'border-slate-200 hover:border-indigo-200'
                        }`}
                      >
                        <span
                          className={`block text-sm font-extrabold ${
                            studioMode === mode.id
                              ? 'text-indigo-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {mode.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {mode.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Automatically included
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      'Task details',
                      'AI context',
                      'Project progress',
                      `${anchors.length} deliverables`,
                      'AI history',
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-indigo-700"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold">
                      Generated prompt
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Ready to copy into your AI assistant.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    ● Generated locally
                  </span>
                </div>

                <textarea
                  aria-label="Generated AI prompt"
                  readOnly
                  rows={22}
                  value={prompt}
                  placeholder="Create a task to get started."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-[#0f172a] p-5 font-mono text-xs leading-6 text-slate-200 outline-none"
                />

                {studioMessage && (
                  <p
                    role="status"
                    className="mt-3 text-sm font-semibold text-indigo-600"
                  >
                    {studioMessage}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={!prompt}
                    onClick={() =>
                      copyText(prompt, setStudioMessage)
                    }
                    className={primary}
                  >
                    Copy Prompt
                  </button>
                  <button
                    type="button"
                    disabled={!prompt}
                    onClick={openChatGPT}
                    className="rounded-xl bg-[#0f172a] px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    ✦ Copy & Open ChatGPT ↗
                  </button>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  ChatGPT opens in a new tab. Paste your copied
                  prompt into the chat. FlowState does not send
                  project data to an AI service automatically.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* DELIVERABLES */}
        {page === 'deliverables' && (
          <div className="space-y-6">
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-extrabold">
                  Project Anchor Board
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pin your presentation, demo, report, GitHub
                  repository and supporting documents.
                </p>
              </div>

              <button
                type="button"
                onClick={newAnchor}
                className={primary}
              >
                + Add Deliverable
              </button>
            </section>

            {anchors.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl text-indigo-600">
                  ◫
                </div>
                <h3 className="text-lg font-extrabold">
                  Your project hub starts here
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Add important links and deliverables so your
                  team can find them quickly and your AI prompts
                  can reference them.
                </p>
                <button
                  type="button"
                  onClick={newAnchor}
                  className={`${primary} mt-5`}
                >
                  Pin your first deliverable
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {anchors.map((anchor) => (
                  <article
                    key={anchor.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-5 flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl text-indigo-600">
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
                        'Pinned project reference'}
                    </p>

                    {safeLink(anchor.url) && (
                      <a
                        href={safeLink(anchor.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-block text-sm font-bold text-indigo-600 hover:underline"
                      >
                        Open resource ↗
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          FlowState · Built for the Vibecoding Hackathon ·
          React + Vite + Tailwind
        </footer>
      </div>

      {/* TASK MODAL */}
      {editing !== null && (
        <Modal
          title={editing.id === null ? 'Create Task' : 'Edit Task'}
          subtitle="Keep your task details and AI development context together."
          onClose={() => setEditing(null)}
          wide
        >
          <form onSubmit={saveTask} className="space-y-5">
            <div>
              <label htmlFor="task-title" className={label}>
                Task title
              </label>
              <input
                id="task-title"
                required
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                className={input}
                placeholder="What needs to be done?"
              />
            </div>

            <div>
              <label htmlFor="task-description" className={label}>
                Description
              </label>
              <textarea
                id="task-description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                className={input}
                placeholder="Describe the task..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="task-type" className={label}>
                  Type
                </label>
                <select
                  id="task-type"
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })
                  }
                  className={input}
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
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className={input}
                >
                  {STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="task-owner" className={label}>
                  Assigned to
                </label>
                <select
                  id="task-owner"
                  value={form.assignee}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      assignee: event.target.value,
                    })
                  }
                  className={input}
                >
                  <option value="">Unassigned</option>
                  {form.assignee &&
                    !team.includes(form.assignee) && (
                      <option value={form.assignee}>
                        {form.assignee}
                      </option>
                    )}
                  {team.map((member) => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="task-date" className={label}>
                  Due date
                </label>
                <input
                  id="task-date"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      dueDate: event.target.value,
                    })
                  }
                  className={input}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
              <div className="mb-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                  ✦ AI Development Context
                </p>
                <p className="mt-1 text-xs leading-5 text-indigo-700">
                  Save useful requirements, file references and
                  decisions for your next AI session.
                </p>
              </div>

              <textarea
                aria-label="Task Context / AI Briefing"
                rows={4}
                value={form.context}
                onChange={(event) =>
                  setForm({
                    ...form,
                    context: event.target.value,
                  })
                }
                placeholder="Relevant files, requirements, constraints, decisions..."
                className={input}
              />

              <button
                type="button"
                onClick={() =>
                  copyText(taskContext(form), setTaskMessage)
                }
                className="mt-3 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Copy as Prompt Context
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

            {/* HACKATHON: PROMPT / TOOL / OUTCOME */}
            <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-violet-700">
                ◈ AI Workflow Log
              </p>
              <p className="mb-4 mt-1 text-xs leading-5 text-violet-600">
                Record how AI helped you build this feature.
                This makes your development process visible.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="ai-tool" className={label}>
                    AI tool used
                  </label>
                  <input
                    id="ai-tool"
                    value={form.aiTool}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        aiTool: event.target.value,
                      })
                    }
                    placeholder="e.g. ChatGPT, GitHub Copilot"
                    className={input}
                  />
                </div>

                <div>
                  <label htmlFor="ai-prompt" className={label}>
                    Prompt used
                  </label>
                  <textarea
                    id="ai-prompt"
                    rows={3}
                    value={form.aiPrompt}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        aiPrompt: event.target.value,
                      })
                    }
                    placeholder="What did you ask the AI?"
                    className={input}
                  />
                </div>

                <div>
                  <label htmlFor="ai-outcome" className={label}>
                    Outcome / what you changed
                  </label>
                  <textarea
                    id="ai-outcome"
                    rows={3}
                    value={form.aiOutcome}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        aiOutcome: event.target.value,
                      })
                    }
                    placeholder="What worked, what didn't, and what did you improve?"
                    className={input}
                  />
                </div>
              </div>
            </div>

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
                <button type="submit" className={primary}>
                  {editing.id === null ? 'Create Task' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* TEAM MODAL */}
      {teamOpen && (
        <Modal
          title="Manage Team"
          subtitle="Add teammates and assign them to tasks."
          onClose={() => {
            setTeamOpen(false);
            setTeamError('');
          }}
        >
          <form onSubmit={addMember} className="flex gap-2">
            <input
              aria-label="New team member"
              value={memberName}
              onChange={(event) => {
                setMemberName(event.target.value);
                setTeamError('');
              }}
              placeholder="Team member name"
              required
              className={`${input} min-w-0 flex-1`}
            />
            <button type="submit" className={primary}>
              Add
            </button>
          </form>

          {teamError && (
            <p role="alert" className="mt-3 text-sm text-red-600">
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
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-700">
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

      {/* DELIVERABLE MODAL */}
      {editingAnchor !== null && (
        <Modal
          title={
            editingAnchor.id === null
              ? 'Add Deliverable'
              : 'Edit Deliverable'
          }
          subtitle="Pin a document, project link or final output."
          onClose={() => setEditingAnchor(null)}
        >
          <form onSubmit={saveAnchor} className="space-y-5">
            <div>
              <label htmlFor="anchor-title" className={label}>
                Deliverable name
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
                className={input}
              />
            </div>

            <div>
              <label htmlFor="anchor-description" className={label}>
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
                placeholder="What is this deliverable for?"
                className={input}
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
                className={input}
              />
            </div>

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
                <button type="submit" className={primary}>
                  {editingAnchor.id === null
                    ? 'Pin Deliverable'
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
