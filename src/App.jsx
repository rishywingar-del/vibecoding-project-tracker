
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Columns3, BrainCircuit, FolderOpen,
  Plus, Search, CalendarDays, UserRound, Pencil, X,
  Trash2, Copy, ExternalLink, Link2, CheckCircle2,
  AlertCircle, Clock3, ArrowRight, Menu, Filter,
  FileText, Presentation, MonitorPlay, BookOpen,
  Sparkles, Check, Users
} from "lucide-react";

const STAGES = [
  { id: "todo", label: "To do", color: "bg-slate-400" },
  { id: "in-progress", label: "In progress", color: "bg-blue-500" },
  { id: "review", label: "Review", color: "bg-amber-500" },
  { id: "done", label: "Done", color: "bg-emerald-500" },
];

const VIEWS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "board", label: "Task board", icon: Columns3 },
  { id: "context", label: "AI context", icon: BrainCircuit },
  { id: "deliverables", label: "Deliverables", icon: FolderOpen },
];

const DELIVERABLES = [
  { id: "presentation", label: "Presentation", icon: Presentation, description: "Slides and pitch materials" },
  { id: "demo", label: "Live demo", icon: MonitorPlay, description: "Your working prototype" },
  { id: "report", label: "Report", icon: FileText, description: "Assessment report" },
  { id: "documentation", label: "Documentation", icon: BookOpen, description: "Requirements and design notes" },
];

const INITIAL_TASKS = [
  {
    id: "seed-1",
    title: "Set up the project",
    description: "Create the initial project structure.",
    type: "Feature",
    status: "done",
    assignee: "Rishy Winayagarajah",
    dueDate: "",
    context: "",
    contextTool: "ChatGPT",
  },
  {
    id: "seed-2",
    title: "Build the task board",
    description: "Create the four workflow columns and task cards.",
    type: "Feature",
    status: "in-progress",
    assignee: "Rishy Winayagarajah",
    dueDate: "",
    context: "",
    contextTool: "ChatGPT",
  },
  {
    id: "seed-3",
    title: "Review task interactions",
    description: "Test creating, editing and deleting tasks.",
    type: "Feature",
    status: "review",
    assignee: "Rishy Winayagarajah",
    dueDate: "",
    context: "",
    contextTool: "ChatGPT",
  },
  {
    id: "seed-4",
    title: "Check mobile layout",
    description: "Check usability on smaller screens.",
    type: "Bug",
    status: "todo",
    assignee: "Rishy Winayagarajah",
    dueDate: "",
    context: "",
    contextTool: "ChatGPT",
  },
];

const EMPTY_TASK = {
  title: "",
  description: "",
  type: "Feature",
  status: "todo",
  assignee: "Rishy Winayagarajah",
  dueDate: "",
  context: "",
  contextTool: "ChatGPT",
};

function useSavedState(key, initialValue) {
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
      // The interface still works if storage is unavailable.
    }
  }, [key, value]);

  return [value, setValue];
}

function daysUntil(dateString) {
  if (!dateString) return null;

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const parts = dateString.split("-").map(Number);
  const target = new Date(parts[0], parts[1] - 1, parts[2]);

  const difference = Math.round(
    (target.getTime() - today.getTime()) / 86400000
  );

  return Number.isFinite(difference) ? difference : null;
}

function getDueInfo(task) {
  if (!task.dueDate || task.status === "done") return null;

  const days = daysUntil(task.dueDate);
  if (days === null) return null;

  if (days < 0) {
    return {
      text: `${Math.abs(days)}d overdue`,
      className: "bg-red-50 text-red-700",
      urgent: true,
    };
  }

  if (days === 0) {
    return {
      text: "Due today",
      className: "bg-amber-50 text-amber-700",
      urgent: true,
    };
  }

  if (days <= 3) {
    return {
      text: `Due in ${days}d`,
      className: "bg-amber-50 text-amber-700",
      urgent: true,
    };
  }

  return {
    text: new Date(`${task.dueDate}T12:00:00`)
      .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
    className: "bg-emerald-50 text-emerald-700",
    urgent: false,
  };
}

function createPrompt(task) {
  return [
    "Project: FlowState, an AI-assisted project tracker.",
    `Task: ${task.title}`,
    `Type: ${task.type || "Feature"}`,
    `Status: ${
      STAGES.find((stage) => stage.id === task.status)?.label ||
      task.status
    }`,
    `Owner: ${task.assignee || "Unassigned"}`,
    task.description ? `Description:\n${task.description}` : "",
    task.context ? `Previous work and important context:\n${task.context}` : "",
    "Please help with this task while respecting the existing project decisions. Ask if important information is missing.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function validUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function Logo() {
  return (
    <div
      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-500 shadow-lg shadow-blue-950/20"
      aria-hidden="true"
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M7 7H20M7 14H16M7 21H20"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <circle cx="21" cy="14" r="3" fill="#BFDBFE" />
      </svg>
    </div>
  );
}

function Badge({ children, color = "slate" }) {
  const colors = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${colors[color]}`}
    >
      {children}
    </span>
  );
}

function TaskCard({ task, onEdit }) {
  const due = getDueInfo(task);

  return (
    <button
      type="button"
      onClick={() => onEdit(task)}
      className="group w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
    >
      <div className="mb-3 flex items-center justify-between">
        <Badge color={task.type === "Bug" ? "red" : "green"}>
          {task.type === "Bug" ? "Bug" : "Feature"}
        </Badge>
        <Pencil
          size={14}
          className="text-slate-300 group-hover:text-blue-600"
        />
      </div>

      <h3 className="text-sm font-semibold leading-snug text-slate-900">
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
          {task.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
          <UserRound size={13} />
          <span className="max-w-28 truncate">
            {task.assignee || "Unassigned"}
          </span>
        </span>

        {due ? (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${due.className}`}
          >
            <CalendarDays size={11} />
            {due.text}
          </span>
        ) : task.context ? (
          <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600">
            <BrainCircuit size={12} />
            Context saved
          </span>
        ) : null}
      </div>
    </button>
  );
}

function StatCard({ label, value, icon: Icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          {label}
        </span>
        <span className={`rounded-xl p-2.5 ${colors[color]}`}>
          <Icon size={19} />
        </span>
      </div>
      <div className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useSavedState(
    "vibetracker.tasks",
    INITIAL_TASKS
  );

  const [anchors, setAnchors] = useSavedState(
    "vibetracker.anchors",
    {}
  );

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeAnchors =
    anchors && typeof anchors === "object" ? anchors : {};

  const [view, setView] = useState("overview");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_TASK });
  const [formError, setFormError] = useState("");

  const [selectedContextId, setSelectedContextId] = useState(null);
  const [draftLinks, setDraftLinks] = useState({});
  const [notice, setNotice] = useState("");

  const total = safeTasks.length;
  const completed = safeTasks.filter(
    (task) => task.status === "done"
  ).length;
  const inProgress = safeTasks.filter(
    (task) => task.status === "in-progress"
  ).length;
  const overdue = safeTasks.filter((task) => {
    const days = daysUntil(task.dueDate);
    return task.status !== "done" && days !== null && days < 0;
  });
  const upcoming = safeTasks.filter((task) => {
    const days = daysUntil(task.dueDate);
    return task.status !== "done" &&
      days !== null &&
      days >= 0 &&
      days <= 3;
  });

  const completion = total
    ? Math.round((completed / total) * 100)
    : 0;

  const owners = useMemo(
    () =>
      [...new Set(
        safeTasks.map((task) => task.assignee).filter(Boolean)
      )].sort(),
    [tasks]
  );

  const filteredTasks = safeTasks.filter((task) => {
    const query = search.toLowerCase();

    const matchesSearch =
      `${task.title} ${task.description || ""} ${task.assignee || ""}`
        .toLowerCase()
        .includes(query);

    const matchesType =
      typeFilter === "All" || task.type === typeFilter;

    const matchesOwner =
      ownerFilter === "All" ||
      (ownerFilter === "Unassigned"
        ? !task.assignee
        : task.assignee === ownerFilter);

    return matchesSearch && matchesType && matchesOwner;
  });

  const contextTasks = safeTasks.filter(
    (task) => task.context?.trim()
  );

  const selectedContext =
    contextTasks.find((task) => task.id === selectedContextId) ||
    contextTasks[0] ||
    null;

  const savedDeliverables = DELIVERABLES.filter(
    (item) => validUrl(safeAnchors[item.id] || "")
  ).length;

  useEffect(() => {
    if (!modalOpen) return;

    function onEscape(event) {
      if (event.key === "Escape") {
        setModalOpen(false);
      }
    }

    window.addEventListener("keydown", onEscape);

    return () => window.removeEventListener("keydown", onEscape);
  }, [modalOpen]);

  function navigate(nextView) {
    setView(nextView);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showNotice(message) {
    setNotice(message);
  }

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_TASK });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditingId(task.id);
    setForm({
      ...EMPTY_TASK,
      ...task,
    });
    setFormError("");
    setModalOpen(true);
  }

  function saveTask(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError("Please enter a task title.");
      return;
    }

    const updated = {
      ...form,
      title: form.title.trim(),
      assignee: form.assignee.trim(),
    };

    if (editingId) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingId
            ? { ...task, ...updated }
            : task
        )
      );
      showNotice("Task updated");
    } else {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `task-${Date.now()}`;

      setTasks((previous) => [
        ...previous,
        { ...updated, id },
      ]);
      showNotice("Task created");
    }

    setModalOpen(false);
  }

  function deleteTask() {
    if (!editingId) return;

    if (!window.confirm("Delete this task? This cannot be undone.")) {
      return;
    }

    setTasks((previous) =>
      previous.filter((task) => task.id !== editingId)
    );

    setModalOpen(false);
    showNotice("Task deleted");
  }

  async function copyPrompt(task) {
    const prompt = createPrompt(task);

    try {
      await navigator.clipboard.writeText(prompt);
      showNotice("Prompt copied to clipboard");
    } catch {
      showNotice("Copy failed. Please check clipboard permissions.");
    }
  }

  function saveLink(id) {
    const value = (draftLinks[id] ?? safeAnchors[id] ?? "").trim();

    if (value && !validUrl(value)) {
      showNotice("Please enter a valid http or https link");
      return;
    }

    setAnchors((previous) => ({
      ...previous,
      [id]: value,
    }));

    showNotice(value ? "Deliverable link saved" : "Link cleared");
  }

  const activeView = VIEWS.find((item) => item.id === view);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#101B32] text-white transition-transform duration-200 lg:translate-x-0 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
          <Logo />
          <div>
            <div className="text-lg font-bold tracking-tight">
              FlowState
            </div>
            <div className="text-[11px] text-slate-400">
              Project workspace
            </div>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>

          <nav aria-label="Main navigation" className="space-y-1">
            {VIEWS.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1">{item.label}</span>
                  {item.id === "board" && (
                    <span className="text-xs opacity-70">
                      {total}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Sparkles size={15} className="text-blue-300" />
              AI-assisted workflow
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Organise tasks, preserve decisions and reuse context
              across AI tools.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-500 text-xs font-bold">
              RW
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold">
                Rishy Winayagarajah
              </div>
              <div className="text-[11px] text-slate-400">
                Project member
              </div>
            </div>
          </div>
        </div>
      </aside>

      {mobileMenu && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"
        />
      )}

      {/* MAIN WORKSPACE */}
      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenu(true)}
              aria-label="Open navigation"
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                {activeView?.label}
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                {view === "overview" && "Your project at a glance"}
                {view === "board" && "Plan, track and complete work"}
                {view === "context" && "Reusable context for AI-assisted tasks"}
                {view === "deliverables" && "Keep project outputs together"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">Add task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </header>

        <main className="mx-auto max-w-[1500px] space-y-7 p-5 sm:p-8">

          {/* OVERVIEW */}
          {view === "overview" && (
            <>
              <section className="relative overflow-hidden rounded-2xl bg-[#152642] p-7 text-white sm:p-9">
                <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-500/10" />
                <div className="absolute right-20 top-12 h-32 w-32 rounded-full bg-blue-400/10" />

                <div className="relative">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-200">
                    <Sparkles size={13} />
                    Your project workspace
                  </div>

                  <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
                    Keep your project moving.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                    Stay on top of tasks, deadlines and project
                    deliverables, with your AI context organised
                    alongside your work.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("board")}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-blue-50"
                  >
                    Open task board
                    <ArrowRight size={16} />
                  </button>
                </div>
              </section>

              <section>
                <div className="mb-4">
                  <h2 className="text-lg font-bold">
                    Project overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    A snapshot of your team's progress
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                  <StatCard
                    label="Total tasks"
                    value={total}
                    icon={Columns3}
                  />
                  <StatCard
                    label="In progress"
                    value={inProgress}
                    icon={Clock3}
                    color="amber"
                  />
                  <StatCard
                    label="Completed"
                    value={completed}
                    icon={CheckCircle2}
                    color="green"
                  />
                  <StatCard
                    label="Overdue"
                    value={overdue.length}
                    icon={AlertCircle}
                    color="red"
                  />
                </div>
              </section>

              <div className="grid gap-5 xl:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">
                        Project completion
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Based on tasks marked as done
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {completion}%
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-label="Project completion"
                    aria-valuenow={completion}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"
                  >
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${completion}%` }}
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {STAGES.map((stage) => (
                      <div
                        key={stage.id}
                        className="rounded-xl bg-slate-50 p-3"
                      >
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                          {stage.label}
                        </div>
                        <div className="mt-2 text-xl font-bold">
                          {safeTasks.filter(
                            (task) => task.status === stage.id
                          ).length}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">
                        Needs attention
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Overdue and approaching deadlines
                      </p>
                    </div>
                    <Badge color={overdue.length ? "red" : "slate"}>
                      {overdue.length + upcoming.length} tasks
                    </Badge>
                  </div>

                  <div className="mt-5 space-y-2">
                    {[...overdue, ...upcoming]
                      .sort(
                        (a, b) =>
                          daysUntil(a.dueDate) -
                          daysUntil(b.dueDate)
                      )
                      .slice(0, 4)
                      .map((task) => {
                        const due = getDueInfo(task);

                        return (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => openEdit(task)}
                            className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {task.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {task.assignee || "Unassigned"}
                              </p>
                            </div>
                            <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${due?.className}`}>
                              {due?.text}
                            </span>
                          </button>
                        );
                      })}

                    {!overdue.length && !upcoming.length && (
                      <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
                        <CheckCircle2
                          size={25}
                          className="mx-auto text-emerald-500"
                        />
                        <p className="mt-3 text-sm font-semibold">
                          Nothing urgent right now
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Upcoming deadlines will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigate("context")}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300"
                >
                  <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <BrainCircuit size={23} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold">
                      AI context library
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">
                      {contextTasks.length} saved task briefs
                    </span>
                  </span>
                  <ArrowRight size={18} className="text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("deliverables")}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300"
                >
                  <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <FolderOpen size={23} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold">
                      Project deliverables
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">
                      {savedDeliverables} of 4 links saved
                    </span>
                  </span>
                  <ArrowRight size={18} className="text-slate-400" />
                </button>
              </div>
            </>
          )}

          {/* TASK BOARD */}
          {view === "board" && (
            <>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Task board
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Select a task to edit it, update its stage,
                  assign ownership or add AI context.
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
                <label className="relative min-w-0 flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <span className="sr-only">Search tasks</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tasks..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-500">
                  <Filter size={16} />
                  <span className="sr-only">Filter by task type</span>
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  >
                    <option>All</option>
                    <option>Feature</option>
                    <option>Bug</option>
                  </select>
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-500">
                  <Users size={16} />
                  <span className="sr-only">Filter by owner</span>
                  <select
                    value={ownerFilter}
                    onChange={(event) => setOwnerFilter(event.target.value)}
                    className="max-w-48 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  >
                    <option>All</option>
                    <option>Unassigned</option>
                    {owners.map((owner) => (
                      <option key={owner}>{owner}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-4">
                {STAGES.map((stage) => {
                  const group = filteredTasks.filter(
                    (task) => task.status === stage.id
                  );

                  return (
                    <section
                      key={stage.id}
                      className="min-h-72 rounded-2xl border border-slate-200 bg-[#EFF3F9] p-3"
                    >
                      <div className="mb-4 flex items-center gap-2 px-2 pt-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                        <h3 className="text-sm font-bold">
                          {stage.label}
                        </h3>
                        <span className="rounded-md bg-white px-2 py-0.5 text-xs text-slate-500">
                          {group.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {group.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={openEdit}
                          />
                        ))}

                        {group.length === 0 && (
                          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-xs text-slate-400">
                            No tasks here
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>

              {!filteredTasks.length && total > 0 && (
                <p className="text-center text-sm text-slate-500">
                  No tasks match your filters.
                </p>
              )}
            </>
          )}

          {/* AI CONTEXT */}
          {view === "context" && (
            <>
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <BrainCircuit size={15} />
                  AI workflow
                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  AI context library
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                  Save important background information and previous
                  decisions with each task. Copy a structured prompt
                  when continuing work in an AI tool.
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                <strong>How it works:</strong> FlowState stores
                context in your browser and prepares text you can
                copy. It does not contact an AI service or
                generate AI responses itself.
              </div>

              {contextTasks.length > 0 ? (
                <div className="grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-4 text-sm font-bold">
                      Saved task briefs
                    </div>

                    <div className="space-y-1 p-2">
                      {contextTasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => setSelectedContextId(task.id)}
                          className={`w-full rounded-xl p-3 text-left ${
                            selectedContext?.id === task.id
                              ? "bg-blue-50 text-blue-900"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="block truncate text-sm font-semibold">
                            {task.title}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">
                            {task.contextTool || "AI tool"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {selectedContext && (
                    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Badge color={selectedContext.type === "Bug" ? "red" : "green"}>
                            {selectedContext.type}
                          </Badge>
                          <h3 className="mt-3 text-xl font-bold">
                            {selectedContext.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {selectedContext.assignee || "Unassigned"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => openEdit(selectedContext)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>
                      </div>

                      <h4 className="mb-2 mt-7 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Saved background
                      </h4>

                      <div className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                        {selectedContext.context}
                      </div>

                      <h4 className="mb-2 mt-7 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Prepared prompt preview
                      </h4>

                      <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                        {createPrompt(selectedContext)}
                      </pre>

                      <button
                        type="button"
                        onClick={() => copyPrompt(selectedContext)}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <Copy size={16} />
                        Copy prompt context
                      </button>
                    </section>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <BrainCircuit
                    size={32}
                    className="mx-auto text-blue-500"
                  />
                  <h3 className="mt-4 font-bold">
                    No AI context saved yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Open a task and add notes about decisions,
                    previous attempts or useful project information.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("board")}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Open task board
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* DELIVERABLES */}
          {view === "deliverables" && (
            <>
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <FolderOpen size={15} />
                  Project outputs
                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  Project deliverables
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                  Keep links to important project materials
                  organised in one place.
                </p>
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">
                      Deliverable links
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {savedDeliverables} of 4 saved
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {savedDeliverables}/4
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${(savedDeliverables / 4) * 100}%`,
                    }}
                  />
                </div>
              </section>

              <div className="grid gap-4 lg:grid-cols-2">
                {DELIVERABLES.map((item) => {
                  const Icon = item.icon;
                  const saved = validUrl(safeAnchors[item.id] || "");
                  const value =
                    draftLinks[item.id] ??
                    safeAnchors[item.id] ??
                    "";

                  return (
                    <section
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="rounded-xl bg-slate-100 p-3 text-slate-600">
                            <Icon size={20} />
                          </span>

                          <div>
                            <h3 className="font-bold">
                              {item.label}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <Badge color={saved ? "green" : "slate"}>
                          {saved ? "Link saved" : "Not linked"}
                        </Badge>
                      </div>

                      <label
                        htmlFor={`link-${item.id}`}
                        className="mt-5 block text-xs font-semibold text-slate-600"
                      >
                        Link URL
                      </label>

                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <div className="relative min-w-0 flex-1">
                          <Link2
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            id={`link-${item.id}`}
                            type="url"
                            value={value}
                            onChange={(event) =>
                              setDraftLinks((previous) => ({
                                ...previous,
                                [item.id]: event.target.value,
                              }))
                            }
                            placeholder="https://..."
                            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => saveLink(item.id)}
                          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>

                      {saved && (
                        <a
                          href={safeAnchors[item.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Open saved link
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </section>
                  );
                })}
              </div>

              <p className="text-xs text-slate-500">
                Links are stored in this browser and are not
                automatically shared between devices.
              </p>
            </>
          )}
        </main>
      </div>

      {/* NOTIFICATION */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          <Check size={16} className="text-emerald-300" />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* TASK MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-dialog-title"
            className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2
                  id="task-dialog-title"
                  className="text-lg font-bold"
                >
                  {editingId ? "Edit task" : "Add a new task"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Manage task details and AI context
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close task editor"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={saveTask}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="space-y-5 overflow-y-auto px-6 py-5">
                <div>
                  <label
                    htmlFor="task-title"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    Task title *
                  </label>
                  <input
                    id="task-title"
                    required
                    maxLength={120}
                    value={form.title}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        title: event.target.value,
                      }))
                    }
                    placeholder="What needs to be done?"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="task-description"
                    className="mb-1.5 block text-sm font-semibold"
                  >
                    Description
                  </label>
                  <textarea
                    id="task-description"
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Add more detail..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="task-type"
                      className="mb-1.5 block text-sm font-semibold"
                    >
                      Task type
                    </label>
                    <select
                      id="task-type"
                      value={form.type}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          type: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                    >
                      <option>Feature</option>
                      <option>Bug</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="task-status"
                      className="mb-1.5 block text-sm font-semibold"
                    >
                      Status
                    </label>
                    <select
                      id="task-status"
                      value={form.status}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          status: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
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
                      htmlFor="task-owner"
                      className="mb-1.5 block text-sm font-semibold"
                    >
                      Assigned to
                    </label>
                    <input
                      id="task-owner"
                      value={form.assignee}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          assignee: event.target.value,
                        }))
                      }
                      placeholder="Name or leave blank"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="task-due"
                      className="mb-1.5 block text-sm font-semibold"
                    >
                      Due date
                    </label>
                    <input
                      id="task-due"
                      type="date"
                      value={form.dueDate || ""}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          dueDate: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                    <BrainCircuit
                      size={18}
                      className="text-blue-600"
                    />
                    AI context
                  </div>

                  <p className="mb-4 text-xs leading-5 text-slate-500">
                    Record decisions, previous attempts and useful
                    instructions to reuse later.
                  </p>

                  <label
                    htmlFor="task-tool"
                    className="mb-1.5 block text-xs font-semibold"
                  >
                    AI tool used
                  </label>
                  <select
                    id="task-tool"
                    value={form.contextTool}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        contextTool: event.target.value,
                      }))
                    }
                    className="mb-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  >
                    <option>ChatGPT</option>
                    <option>Claude</option>
                    <option>GitHub Copilot</option>
                    <option>Gemini</option>
                    <option>Other</option>
                  </select>

                  <label
                    htmlFor="task-context"
                    className="mb-1.5 block text-xs font-semibold"
                  >
                    Context notes
                  </label>
                  <textarea
                    id="task-context"
                    rows={4}
                    value={form.context}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        context: event.target.value,
                      }))
                    }
                    placeholder="What should the AI know about this task?"
                    className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                  {editingId && (
                    <button
                      type="button"
                      onClick={() => copyPrompt(form)}
                      className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-700 hover:underline"
                    >
                      <Copy size={14} />
                      Copy as prompt context
                    </button>
                  )}
                </div>

                {formError && (
                  <p role="alert" className="text-sm font-semibold text-red-600">
                    {formError}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
                <div>
                  {editingId && (
                    <button
                      type="button"
                      onClick={deleteTask}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {editingId ? "Save changes" : "Create task"}
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
