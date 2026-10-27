
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  Columns3,
  BrainCircuit,
  Link2,
  Users,
  Plus,
  Search,
  X,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Menu,
  Sparkles,
  Pencil,
  ArrowRight,
} from "lucide-react";

// --------------------------------------------------
// PROJECT DATA
// --------------------------------------------------

const STORAGE = {
  tasks: "vibetracker.tasks",
  links: "vibetracker.anchors",
  members: "vibetracker.members",
};

const INITIAL_TASKS = [
  {
    id: "demo-1",
    title: "Define project requirements",
    description: "Identify users, key workflows and acceptance criteria.",
    type: "Feature",
    status: "done",
    assignee: "Rishy Winayagarajah",
    dueDate: "",
    contextTool: "ChatGPT",
    context: "Document the essential task-tracking and AI-context workflows.",
    outcome: "Requirements drafted.",
  },
  {
    id: "demo-2",
    title: "Build task board",
    description: "Create task cards and support task status changes.",
    type: "Feature",
    status: "in-progress",
    assignee: "Rishy Winayagarajah",
    dueDate: "",
    contextTool: "ChatGPT",
    context: "Use React components with accessible buttons and local persistence.",
    outcome: "",
  },
  {
    id: "demo-3",
    title: "Review keyboard accessibility",
    description: "Check focus visibility, labels and modal keyboard controls.",
    type: "Feature",
    status: "review",
    assignee: "",
    dueDate: "",
    contextTool: "Other",
    context: "",
    outcome: "",
  },
  {
    id: "demo-4",
    title: "Test deliverable links",
    description: "Confirm links save, persist and open safely.",
    type: "Bug",
    status: "todo",
    assignee: "",
    dueDate: "",
    contextTool: "Other",
    context: "",
    outcome: "",
  },
];

const INITIAL_MEMBERS = [
  {
    id: "member-1",
    name: "Rishy Winayagarajah",
    email: "",
    role: "Developer",
  },
];

const STATUSES = [
  { id: "todo", name: "To do" },
  { id: "in-progress", name: "In progress" },
  { id: "review", name: "In review" },
  { id: "done", name: "Done" },
];

const STATUS_STYLES = {
  todo: {
    column: "border-slate-300 bg-slate-100",
    header: "bg-slate-700 text-white",
    card: "border-l-slate-500",
  },
  "in-progress": {
    column: "border-blue-300 bg-blue-50",
    header: "bg-blue-700 text-white",
    card: "border-l-blue-600",
  },
  review: {
    column: "border-amber-300 bg-amber-50",
    header: "bg-amber-600 text-white",
    card: "border-l-amber-500",
  },
  done: {
    column: "border-emerald-300 bg-emerald-50",
    header: "bg-emerald-700 text-white",
    card: "border-l-emerald-600",
  },
};

const ANCHORS = [
  {
    id: "presentation",
    name: "Presentation",
    help: "Slides for the project demonstration",
  },
  {
    id: "demo",
    name: "Live demo",
    help: "Public link to the working prototype",
  },
  {
    id: "report",
    name: "Report",
    help: "Final written submission",
  },
  {
    id: "documentation",
    name: "Documentation",
    help: "Repository or technical documentation",
  },
];

const ROLES = [
  "Developer",
  "Senior developer",
  "Junior developer",
  "Software architect",
  "UX designer",
  "Database developer",
  "Other",
];

const TOOLS = [
  "ChatGPT",
  "Claude",
  "Copilot",
  "Gemini",
  "Other",
];

const EMPTY_TASK = {
  title: "",
  description: "",
  type: "Feature",
  status: "todo",
  assignee: "",
  dueDate: "",
  contextTool: "ChatGPT",
  context: "",
  outcome: "",
};

// --------------------------------------------------
// DEVELOPER-FOCUSED AI PROMPT BUILDER
// --------------------------------------------------

const PROMPT_MODES = [
  {
    id: "implementation",
    label: "Implementation plan",
    instruction:
      "Provide an implementation plan for this software development task. " +
      "Break it into concrete steps, suggest component or module boundaries, " +
      "note dependencies and give measurable acceptance criteria.",
  },
  {
    id: "debugging",
    label: "Debug a problem",
    instruction:
      "Help debug this issue. Identify likely root causes, suggest a " +
      "systematic investigation, show relevant example code or pseudocode " +
      "where helpful, and list regression tests.",
  },
  {
    id: "review",
    label: "Code review",
    instruction:
      "Prepare a focused code review checklist for this task. Cover " +
      "correctness, readability, maintainability, edge cases, security " +
      "and accessibility where applicable. Ask for source code if needed.",
  },
  {
    id: "architecture",
    label: "Architecture",
    instruction:
      "Recommend an appropriate software architecture. Explain components, " +
      "interfaces, data flow, trade-offs, risks and how the design can be tested.",
  },
  {
    id: "database",
    label: "Database design",
    instruction:
      "Help design the data model for this task. Suggest entities, " +
      "relationships, constraints, example schemas or queries, migrations " +
      "and data integrity tests where relevant.",
  },
  {
    id: "ux",
    label: "UX and accessibility",
    instruction:
      "Suggest a user-centred design approach, including user flows, " +
      "interaction states, keyboard support, screen-reader labels, " +
      "accessibility considerations and usability checks.",
  },
  {
    id: "testing",
    label: "Testing strategy",
    instruction:
      "Produce a practical testing strategy covering unit, integration " +
      "and user acceptance tests, edge cases and clear pass/fail criteria.",
  },
];

function buildPrompt(task, mode, request) {
  const selected =
    PROMPT_MODES.find((item) => item.id === mode) || PROMPT_MODES[0];

  const status =
    STATUSES.find((item) => item.id === task.status)?.name || task.status;

  return `You are a senior software engineer helping a small development team.

Tailor your advice to the development task below.
Do not assume access to source files or systems that have not been provided.

DEVELOPMENT TASK: ${task.title}

TASK TYPE: ${task.type}

KANBAN STATUS: ${status}

TASK DESCRIPTION:
${task.description || "Not provided"}

DEVELOPER / OWNER:
${task.assignee || "Unassigned"}

DUE DATE:
${task.dueDate || "Not set"}

PREVIOUS AI TOOL:
${task.contextTool || "Not specified"}

PREVIOUS PROMPTS, DECISIONS AND ATTEMPTS:
${task.context || "None recorded"}

RECORDED RESULTS / OUTCOMES:
${task.outcome || "None recorded"}

ASSISTANCE TYPE:
${selected.label}

WHAT I NEED:
${selected.instruction}

ADDITIONAL DEVELOPER QUESTION:
${request || "No additional question"}

Give actionable, technically accurate advice suitable for software developers.

Include examples where useful, explain assumptions, and finish with concrete next steps and ways to verify success.`;
}

// --------------------------------------------------
// HELPERS AND SHARED STYLES
// --------------------------------------------------

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

function useSavedState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return saved !== null ? saved : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }, [key, value]);

  return [value, setValue];
}

function validUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isOverdue(task) {
  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    Boolean(task.dueDate) &&
    task.status !== "done" &&
    task.dueDate < localToday
  );
}

const field =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 " +
  "text-sm text-slate-900 outline-none focus-visible:ring-2 " +
  "focus-visible:ring-blue-600";

const primary =
  "inline-flex items-center justify-center gap-2 rounded-lg " +
  "bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white " +
  "hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-blue-600";

const secondary =
  "inline-flex items-center justify-center gap-2 rounded-lg " +
  "border border-slate-300 bg-white px-3 py-2 text-sm font-medium " +
  "text-slate-700 hover:bg-slate-50 focus-visible:outline " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-blue-600";

const label = "mb-1 block text-sm font-semibold text-slate-700";

function Badge({ children, tone = "slate" }) {
  const colors = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-800",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[tone]}`}
    >
      {children}
    </span>
  );
}

function Panel({ title, children, action }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;

    dialog
      ?.querySelector("input,select,textarea,button")
      ?.focus();

    const keydown = (event) => {
      if (event.key === "Escape") {
        closeRef.current();
      }

      if (event.key === "Tab" && dialog) {
        const focusable = [
          ...dialog.querySelectorAll(
            "button:not([disabled]),input:not([disabled])," +
              "select:not([disabled]),textarea:not([disabled]),a[href]"
          ),
        ];

        if (!focusable.length) return;

        if (
          event.shiftKey &&
          document.activeElement === focusable[0]
        ) {
          event.preventDefault();
          focusable[focusable.length - 1].focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === focusable[focusable.length - 1]
        ) {
          event.preventDefault();
          focusable[0].focus();
        }
      }
    };

    document.addEventListener("keydown", keydown);

    return () => {
      document.removeEventListener("keydown", keydown);
      previous?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="modal-title" className="text-xl font-bold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            className={secondary}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// --------------------------------------------------
// MAIN APPLICATION
// --------------------------------------------------

export default function App() {
  const [tasks, setTasks] = useSavedState(
    STORAGE.tasks,
    INITIAL_TASKS
  );

  const [anchors, setAnchors] = useSavedState(
    STORAGE.links,
    {}
  );

  const [members, setMembers] = useSavedState(
    STORAGE.members,
    INITIAL_MEMBERS
  );

  const [page, setPage] = useState("overview");
  const [taskModal, setTaskModal] = useState(null);
  const [memberModal, setMemberModal] = useState(null);

  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [anchorDrafts, setAnchorDrafts] = useState({});

  const [assistantTask, setAssistantTask] = useState("");
  const [assistantMode, setAssistantMode] = useState("implementation");
  const [assistantRequest, setAssistantRequest] = useState("");

  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const safeTasks = Array.isArray(tasks) ? tasks : INITIAL_TASKS;
  const safeMembers = Array.isArray(members)
    ? members
    : INITIAL_MEMBERS;

  const safeAnchors =
    anchors && typeof anchors === "object" && !Array.isArray(anchors)
      ? anchors
      : {};

  const notify = (message) => setNotice(message);

  const completed = safeTasks.filter(
    (task) => task.status === "done"
  ).length;

  const inProgress = safeTasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const overdue = safeTasks.filter(isOverdue).length;

  const progress = safeTasks.length
    ? Math.round((completed / safeTasks.length) * 100)
    : 0;

  const owners = [
    ...new Set(
      [
        ...safeMembers.map((member) => member.name),
        ...safeTasks.map((task) => task.assignee),
      ].filter(Boolean)
    ),
  ];

  const filtered = safeTasks.filter((task) => {
    const matchesSearch =
      `${task.title} ${task.description}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesOwner =
      ownerFilter === "all" || task.assignee === ownerFilter;

    const matchesType =
      typeFilter === "all" || task.type === typeFilter;

    return matchesSearch && matchesOwner && matchesType;
  });

  const contextTasks = safeTasks.filter(
    (task) => task.context?.trim() || task.outcome?.trim()
  );

  const selectedTask =
    safeTasks.find((task) => task.id === assistantTask) ||
    safeTasks[0];

  const prompt = selectedTask
    ? buildPrompt(selectedTask, assistantMode, assistantRequest)
    : "";

  const suggestions = useMemo(() => {
    if (!selectedTask) return [];

    const result = [];

    if (!selectedTask.description?.trim()) {
      result.push(
        "Add a clear description and acceptance criteria."
      );
    }

    if (!selectedTask.assignee) {
      result.push(
        "Assign an owner to make responsibility clear."
      );
    }

    if (!selectedTask.dueDate) {
      result.push(
        "Consider setting a target date for planning."
      );
    }

    if (isOverdue(selectedTask)) {
      result.push(
        "This task is overdue. Review the deadline and blockers."
      );
    }

    if (!selectedTask.context?.trim()) {
      result.push(
        "Record previous AI attempts or decisions to avoid repeating work."
      );
    }

    if (selectedTask.status === "review") {
      result.push(
        "Check acceptance criteria and accessibility before marking Done."
      );
    }

    if (selectedTask.type === "Bug") {
      result.push(
        "Document reproduction steps, expected behaviour and actual behaviour."
      );
    }

    return result.length
      ? result
      : [
          "The task has a clear owner and context. Use the generated prompt to plan the next steps.",
        ];
  }, [selectedTask]);

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
      notify("Copied to clipboard.");
    } catch {
      notify(
        "Copy failed. Select and copy the prompt manually."
      );
    }
  }

  // --------------------------------------------------
  // TASK ACTIONS
  // --------------------------------------------------

  function openTask(task) {
    setTaskModal(
      task
        ? { ...EMPTY_TASK, ...task }
        : { ...EMPTY_TASK, id: uid() }
    );
  }

  function saveTask(event) {
    event.preventDefault();

    if (!taskModal.title.trim()) {
      notify("A task title is required.");
      return;
    }

    const cleaned = {
      ...taskModal,
      title: taskModal.title.trim(),
      description: taskModal.description.trim(),
      context: taskModal.context.trim(),
      outcome: taskModal.outcome.trim(),
    };

    setTasks((previous) => {
      const current = Array.isArray(previous) ? previous : [];

      const exists = current.some(
        (task) => task.id === cleaned.id
      );

      return exists
        ? current.map((task) =>
            task.id === cleaned.id ? cleaned : task
          )
        : [...current, cleaned];
    });

    setTaskModal(null);
    notify("Task saved.");
  }

  function deleteTask() {
    if (!window.confirm("Delete this task? This cannot be undone.")) {
      return;
    }

    setTasks((previous) =>
      previous.filter((task) => task.id !== taskModal.id)
    );

    setTaskModal(null);
    notify("Task deleted.");
  }

  // --------------------------------------------------
  // TEAM ACTIONS
  // --------------------------------------------------

  function saveMember(event) {
    event.preventDefault();

    const name = memberModal.name.trim();

    if (!name) {
      notify("Member name is required.");
      return;
    }

    const duplicate = safeMembers.some(
      (member) =>
        member.name.toLowerCase() === name.toLowerCase() &&
        member.id !== memberModal.id
    );

    if (duplicate) {
      notify("A member with that name already exists.");
      return;
    }

    const updated = {
      ...memberModal,
      name,
      email: memberModal.email.trim(),
    };

    const previous = safeMembers.find(
      (member) => member.id === updated.id
    );

    setMembers((current) =>
      current.some((member) => member.id === updated.id)
        ? current.map((member) =>
            member.id === updated.id ? updated : member
          )
        : [...current, updated]
    );

    if (previous && previous.name !== updated.name) {
      setTasks((current) =>
        current.map((task) =>
          task.assignee === previous.name
            ? { ...task, assignee: updated.name }
            : task
        )
      );
    }

    setMemberModal(null);
    notify("Team member saved.");
  }

  function deleteMember() {
    const confirmed = window.confirm(
      "Remove this member? Their assigned tasks will become unassigned."
    );

    if (!confirmed) return;

    setMembers((current) =>
      current.filter((member) => member.id !== memberModal.id)
    );

    setTasks((current) =>
      current.map((task) =>
        task.assignee === memberModal.name
          ? { ...task, assignee: "" }
          : task
      )
    );

    setMemberModal(null);
    notify("Member removed.");
  }

  // --------------------------------------------------
  // DELIVERABLE ACTIONS
  // --------------------------------------------------

  function saveAnchor(event, id) {
    event.preventDefault();

    const url = (
      anchorDrafts[id] ??
      safeAnchors[id] ??
      ""
    ).trim();

    if (url && !validUrl(url)) {
      notify("Enter a valid http:// or https:// URL.");
      return;
    }

    setAnchors((previous) => ({
      ...previous,
      [id]: url,
    }));

    notify(url ? "Deliverable link saved." : "Deliverable link cleared.");
  }

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  const navigation = [
    {
      id: "overview",
      name: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "board",
      name: "Task board",
      icon: Columns3,
    },
    {
      id: "assistant",
      name: "AI assistant",
      icon: BrainCircuit,
    },
    {
      id: "team",
      name: "Team",
      icon: Users,
    },
    {
      id: "deliverables",
      name: "Deliverables",
      icon: Link2,
    },
  ];

  function navigate(next) {
    setPage(next);
    setMobileMenu(false);
    setNotice("");
  }

  // --------------------------------------------------
  // PAGE LAYOUT
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* TOP NAVIGATION */}

      <header className="sticky top-0 z-20 bg-[#111318] text-white shadow-lg">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <Columns3 size={22} />
            </div>

            <div>
              <div className="text-xl font-bold tracking-tight">
                FlowState
              </div>
              <div className="hidden text-xs text-slate-300 sm:block">
                AI-assisted project tracker
              </div>
            </div>
          </div>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main navigation"
          >
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                aria-current={page === item.id ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                  page === item.id
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={17} />
                {item.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              className={primary}
              onClick={() => openTask()}
            >
              <Plus size={17} />
              <span className="hidden sm:inline">Add task</span>
              <span className="sm:hidden">Task</span>
            </button>

            <button
              type="button"
              className="rounded-lg border border-white/20 p-2.5 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white lg:hidden"
              onClick={() => setMobileMenu((open) => !open)}
              aria-label={mobileMenu ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileMenu}
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION */}

        {mobileMenu && (
          <nav
            className="border-t border-white/10 px-4 pb-4 lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="grid gap-1 pt-3 sm:grid-cols-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  aria-current={page === item.id ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                    page === item.id
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* MAIN CONTENT */}

      <main className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Project workspace
            </div>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              {navigation.find((item) => item.id === page)?.name}
            </h1>
          </div>

          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            One project · One team
          </span>
        </div>

        <div className="space-y-6">
          {/* NOTIFICATIONS */}

          {notice && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900"
            >
              <span>{notice}</span>
              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* OVERVIEW */}

          {page === "overview" && (
            <>
              <div className="rounded-2xl bg-[#152744] p-7 text-white sm:p-9">
                <div className="mb-2 flex items-center gap-2 text-sm text-blue-200">
                  <Sparkles size={17} />
                  Project overview
                </div>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  Keep your project moving.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                  Manage tasks, share responsibility, preserve AI
                  development context and keep final deliverables
                  together.
                </p>

                <button
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                  onClick={() => navigate("board")}
                >
                  Open task board
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                  {
                    name: "Total tasks",
                    value: safeTasks.length,
                  },
                  {
                    name: "In progress",
                    value: inProgress,
                  },
                  {
                    name: "Completed",
                    value: completed,
                  },
                  {
                    name: "Overdue",
                    value: overdue,
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="text-sm text-slate-600">
                      {item.name}
                    </div>
                    <div className="mt-2 text-3xl font-bold">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <Panel title="Project completion">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-600">
                    {completed} of {safeTasks.length} tasks complete
                  </span>
                  <strong>{progress}%</strong>
                </div>

                <div
                  className="h-3 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Project completion"
                >
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Panel>

              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Needs attention">
                  {safeTasks.filter(
                    (task) =>
                      isOverdue(task) ||
                      task.status === "review"
                  ).length ? (
                    <div className="space-y-2">
                      {safeTasks
                        .filter(
                          (task) =>
                            isOverdue(task) ||
                            task.status === "review"
                        )
                        .slice(0, 5)
                        .map((task) => (
                          <button
                            key={task.id}
                            className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50"
                            onClick={() => openTask(task)}
                          >
                            <span className="text-sm font-medium">
                              {task.title}
                            </span>
                            <Badge
                              tone={
                                isOverdue(task) ? "red" : "amber"
                              }
                            >
                              {isOverdue(task)
                                ? "Overdue"
                                : "Review"}
                            </Badge>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">
                      Nothing needs urgent attention.
                    </p>
                  )}
                </Panel>

                <Panel title="Quick actions">
                  <div className="grid gap-2">
                    <button
                      className={secondary}
                      onClick={() => navigate("assistant")}
                    >
                      <BrainCircuit size={17} />
                      Open AI assistant
                    </button>

                    <button
                      className={secondary}
                      onClick={() => navigate("team")}
                    >
                      <Users size={17} />
                      Manage team ({safeMembers.length})
                    </button>

                    <button
                      className={secondary}
                      onClick={() => navigate("deliverables")}
                    >
                      <Link2 size={17} />
                      View deliverables
                    </button>
                  </div>
                </Panel>
              </div>
            </>
          )}

          {/* FOUR-COLUMN KANBAN BOARD */}

          {page === "board" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  Select any card to edit it. Changes are saved in
                  this browser.
                </p>

                <Badge tone="blue">
                  {filtered.length} tasks
                </Badge>
              </div>

              <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">
                <label className="block">
                  <span className={label}>Search tasks</span>

                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                      className={`${field} pl-9`}
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search title or description"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className={label}>Task type</span>
                  <select
                    className={field}
                    value={typeFilter}
                    onChange={(event) =>
                      setTypeFilter(event.target.value)
                    }
                  >
                    <option value="all">All types</option>
                    <option>Feature</option>
                    <option>Bug</option>
                  </select>
                </label>

                <label className="block">
                  <span className={label}>Assigned to</span>
                  <select
                    className={field}
                    value={ownerFilter}
                    onChange={(event) =>
                      setOwnerFilter(event.target.value)
                    }
                  >
                    <option value="all">Everyone</option>
                    {owners.map((owner) => (
                      <option key={owner}>{owner}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Four columns across on desktop */}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                {STATUSES.map((status) => {
                  const columnTasks = filtered.filter(
                    (task) => task.status === status.id
                  );

                  const style = STATUS_STYLES[status.id];

                  return (
                    <section
                      key={status.id}
                      className={`min-h-[600px] min-w-0 rounded-xl border p-3 ${style.column}`}
                      aria-label={`${status.name} tasks`}
                    >
                      <div
                        className={`mb-3 flex items-center justify-between rounded-lg px-3 py-3 ${style.header}`}
                      >
                        <h2 className="text-sm font-bold">
                          {status.name}
                        </h2>

                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
                          {columnTasks.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {columnTasks.map((task) => (
                          <button
                            type="button"
                            key={task.id}
                            onClick={() => openTask(task)}
                            className={`w-full rounded-xl border border-slate-200 border-l-4 p-3 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${
                              isOverdue(task)
                                ? "border-l-red-600 bg-red-50"
                                : `bg-white ${style.card}`
                            }`}
                          >
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge
                                tone={
                                  task.type === "Bug"
                                    ? "red"
                                    : "blue"
                                }
                              >
                                {task.type}
                              </Badge>

                              {isOverdue(task) && (
                                <Badge tone="red">
                                  Overdue
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-bold leading-6">
                              {task.title}
                            </h3>

                            <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                              {task.description ||
                                "No description yet."}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                              <span>
                                {task.assignee || "Unassigned"}
                              </span>

                              {task.dueDate && (
                                <span>· {task.dueDate}</span>
                              )}

                              {(task.context || task.outcome) && (
                                <span className="text-blue-700">
                                  · AI context
                                </span>
                              )}
                            </div>
                          </button>
                        ))}

                        {!columnTasks.length && (
                          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                            No tasks
                          </p>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </>
          )}

          {/* AI ASSISTANT */}

          {page === "assistant" && (
            <>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
                <strong>How this works:</strong> FlowState builds
                a task-specific developer prompt using saved notes,
                previous attempts and outcomes. Copy the prompt,
                then paste it into ChatGPT.
                <strong>
                  {" "}This free workflow does not generate AI
                  responses inside FlowState.
                </strong>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                <Panel title="AI prompt builder">
                  <div className="space-y-4">
                    <label className="block">
                      <span className={label}>
                        Select development task
                      </span>

                      <select
                        className={field}
                        value={selectedTask?.id || ""}
                        onChange={(event) =>
                          setAssistantTask(event.target.value)
                        }
                      >
                        {!safeTasks.length && (
                          <option value="">
                            Create a task first
                          </option>
                        )}

                        {safeTasks.map((task) => (
                          <option
                            key={task.id}
                            value={task.id}
                          >
                            {task.title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className={label}>
                        Developer assistance type
                      </span>

                      <select
                        className={field}
                        value={assistantMode}
                        onChange={(event) =>
                          setAssistantMode(event.target.value)
                        }
                      >
                        {PROMPT_MODES.map((mode) => (
                          <option
                            key={mode.id}
                            value={mode.id}
                          >
                            {mode.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className={label}>
                        Additional developer question (optional)
                      </span>

                      <textarea
                        rows={3}
                        className={field}
                        value={assistantRequest}
                        onChange={(event) =>
                          setAssistantRequest(event.target.value)
                        }
                        placeholder="e.g. We use React and Vite. How should I structure this feature?"
                      />
                    </label>

                    <label className="block">
                      <span className={label}>
                        Generated developer prompt
                      </span>

                      <textarea
                        rows={13}
                        className={`${field} font-mono text-xs`}
                        value={prompt}
                        readOnly
                        aria-describedby="prompt-help"
                      />

                      <span
                        id="prompt-help"
                        className="mt-1 block text-xs text-slate-500"
                      >
                        Change the task, assistance type or question
                        to automatically update this prompt.
                      </span>
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <button
                        className={primary}
                        disabled={!selectedTask}
                        onClick={() => copyText(prompt)}
                      >
                        <Copy size={16} />
                        Copy prompt
                      </button>

                      <a
                        className={secondary}
                        href="https://chatgpt.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={16} />
                        Open ChatGPT
                      </a>
                    </div>
                  </div>
                </Panel>

                <div className="space-y-5">
                  <Panel title="Task recommendations">
                    <div className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Rule-based suggestions · Not AI-generated
                    </div>

                    {selectedTask ? (
                      <ul className="space-y-3">
                        {suggestions.map((suggestion) => (
                          <li
                            key={suggestion}
                            className="flex gap-2 text-sm leading-6 text-slate-700"
                          >
                            <Check
                              size={17}
                              className="mt-1 shrink-0 text-blue-600"
                            />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-600">
                        Create a task to see suggestions.
                      </p>
                    )}
                  </Panel>

                  <Panel title="Saved AI context">
                    <p className="mb-3 text-sm text-slate-600">
                      Previous prompts, attempts and outcomes from
                      your development tasks.
                    </p>

                    {contextTasks.length ? (
                      <div className="space-y-2">
                        {contextTasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => {
                              setAssistantTask(task.id);
                              setAssistantRequest(
                                "Summarise the previous work and recommend the next step."
                              );
                            }}
                            className="w-full rounded-lg border border-slate-200 p-3 text-left hover:border-blue-400"
                          >
                            <div className="text-sm font-semibold">
                              {task.title}
                            </div>

                            <div className="mt-1 line-clamp-2 text-xs text-slate-600">
                              {task.context || task.outcome}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">
                        No AI context saved yet. Open a task
                        and add context notes.
                      </p>
                    )}
                  </Panel>
                </div>
              </div>
            </>
          )}

          {/* TEAM MEMBERS */}

          {page === "team" && (
            <Panel
              title="Team members"
              action={
                <button
                  className={primary}
                  onClick={() =>
                    setMemberModal({
                      id: uid(),
                      name: "",
                      email: "",
                      role: "Developer",
                    })
                  }
                >
                  <Plus size={17} />
                  Add member
                </button>
              }
            >
              <p className="mb-5 text-sm text-slate-600">
                Manage the developers working on this project.
                Members appear in the task assignee dropdown.
                Email is optional.
              </p>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {safeMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() =>
                      setMemberModal({ ...member })
                    }
                    className="rounded-xl border border-slate-200 p-4 text-left hover:border-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
                        {member.name.slice(0, 1).toUpperCase()}
                      </div>

                      <Pencil
                        size={16}
                        className="text-slate-500"
                      />
                    </div>

                    <div className="mt-3 font-bold">
                      {member.name}
                    </div>

                    <div className="mt-1 text-sm text-slate-600">
                      {member.role || "Team member"}
                    </div>

                    {member.email && (
                      <div className="mt-1 break-all text-xs text-slate-500">
                        {member.email}
                      </div>
                    )}

                    <div className="mt-3 text-xs text-blue-700">
                      {
                        safeTasks.filter(
                          (task) =>
                            task.assignee === member.name
                        ).length
                      }{" "}
                      assigned tasks
                    </div>
                  </button>
                ))}

                {!safeMembers.length && (
                  <p className="text-sm text-slate-600">
                    No team members yet. Add your first member.
                  </p>
                )}
              </div>
            </Panel>
          )}

          {/* DELIVERABLE ANCHOR BOARD */}

          {page === "deliverables" && (
            <>
              <p className="text-sm text-slate-600">
                Deliverable Anchor Board — keep final project links
                in one place. Only links are stored, not the files.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {ANCHORS.map((anchor) => (
                  <Panel
                    key={anchor.id}
                    title={anchor.name}
                  >
                    <p className="mb-4 text-sm text-slate-600">
                      {anchor.help}
                    </p>

                    <form
                      onSubmit={(event) =>
                        saveAnchor(event, anchor.id)
                      }
                      className="space-y-3"
                    >
                      <label className="block">
                        <span className={label}>
                          Link URL
                        </span>

                        <input
                          type="url"
                          className={field}
                          value={
                            anchorDrafts[anchor.id] ??
                            safeAnchors[anchor.id] ??
                            ""
                          }
                          onChange={(event) =>
                            setAnchorDrafts((previous) => ({
                              ...previous,
                              [anchor.id]: event.target.value,
                            }))
                          }
                          placeholder="https://example.com"
                        />
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className={primary}
                        >
                          Save link
                        </button>

                        {validUrl(
                          safeAnchors[anchor.id] || ""
                        ) && (
                          <a
                            className={secondary}
                            href={safeAnchors[anchor.id]}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink size={16} />
                            Open saved link
                          </a>
                        )}
                      </div>
                    </form>
                  </Panel>
                ))}
              </div>
            </>
          )}

          <footer className="pt-3 text-xs text-slate-500">
            FlowState prototype · Data is stored in this browser
            only. It does not sync between users or devices.
          </footer>
        </div>
      </main>

      {/* TASK EDITOR */}

      {taskModal && (
        <Modal
          title={
            safeTasks.some(
              (task) => task.id === taskModal.id
            )
              ? "Edit task"
              : "Add task"
          }
          onClose={() => setTaskModal(null)}
        >
          <form
            onSubmit={saveTask}
            className="space-y-4"
          >
            <label className="block">
              <span className={label}>
                Task title *
              </span>

              <input
                required
                maxLength={120}
                className={field}
                value={taskModal.title}
                onChange={(event) =>
                  setTaskModal((task) => ({
                    ...task,
                    title: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block">
              <span className={label}>
                Description
              </span>

              <textarea
                rows={3}
                className={field}
                value={taskModal.description}
                onChange={(event) =>
                  setTaskModal((task) => ({
                    ...task,
                    description: event.target.value,
                  }))
                }
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={label}>Type</span>

                <select
                  className={field}
                  value={taskModal.type}
                  onChange={(event) =>
                    setTaskModal((task) => ({
                      ...task,
                      type: event.target.value,
                    }))
                  }
                >
                  <option>Feature</option>
                  <option>Bug</option>
                </select>
              </label>

              <label className="block">
                <span className={label}>Status</span>

                <select
                  className={field}
                  value={taskModal.status}
                  onChange={(event) =>
                    setTaskModal((task) => ({
                      ...task,
                      status: event.target.value,
                    }))
                  }
                >
                  {STATUSES.map((status) => (
                    <option
                      key={status.id}
                      value={status.id}
                    >
                      {status.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={label}>Assignee</span>

                <select
                  className={field}
                  value={taskModal.assignee}
                  onChange={(event) =>
                    setTaskModal((task) => ({
                      ...task,
                      assignee: event.target.value,
                    }))
                  }
                >
                  <option value="">Unassigned</option>

                  {[
                    ...new Set(
                      [
                        ...safeMembers.map(
                          (member) => member.name
                        ),
                        taskModal.assignee,
                      ].filter(Boolean)
                    ),
                  ].map((name) => (
                    <option
                      key={name}
                      value={name}
                    >
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={label}>Due date</span>

                <input
                  type="date"
                  className={field}
                  value={taskModal.dueDate}
                  onChange={(event) =>
                    setTaskModal((task) => ({
                      ...task,
                      dueDate: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            {/* AI CONTEXT FIELDS */}

            <div className="border-t border-slate-200 pt-4">
              <h3 className="mb-3 flex items-center gap-2 font-bold">
                <BrainCircuit size={18} />
                AI development context
              </h3>

              <label className="mb-3 block">
                <span className={label}>
                  AI tool previously used
                </span>

                <select
                  className={field}
                  value={taskModal.contextTool}
                  onChange={(event) =>
                    setTaskModal((task) => ({
                      ...task,
                      contextTool: event.target.value,
                    }))
                  }
                >
                  {TOOLS.map((tool) => (
                    <option key={tool}>
                      {tool}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mb-3 block">
                <span className={label}>
                  Prompts, decisions or previous attempts
                </span>

                <textarea
                  rows={3}
                  className={field}
                  value={taskModal.context}
                  onChange={(event) =>
                    setTaskModal((task) => ({
                      ...task,
                      context: event.target.value,
                    }))
                  }
                  placeholder="What did you ask? What was tried? What should be remembered?"
                />
              </label>

              <label className="block">
                <span className={label}>
                  Outcome / what worked
                </span>

                <textarea
                  rows={2}
                  className={field}
                  value={taskModal.outcome}
                  onChange={(event) =>
                    setTaskModal((task) => ({
                      ...task,
                      outcome: event.target.value,
                    }))
                  }
                  placeholder="Record the result and any next steps"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
              <div>
                {safeTasks.some(
                  (task) => task.id === taskModal.id
                ) && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    onClick={deleteTask}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className={secondary}
                  onClick={() => setTaskModal(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={primary}
                >
                  Save task
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* TEAM MEMBER EDITOR */}

      {memberModal && (
        <Modal
          title={
            safeMembers.some(
              (member) => member.id === memberModal.id
            )
              ? "Edit team member"
              : "Add team member"
          }
          onClose={() => setMemberModal(null)}
        >
          <form
            className="space-y-4"
            onSubmit={saveMember}
          >
            <label className="block">
              <span className={label}>Name *</span>

              <input
                required
                maxLength={100}
                className={field}
                value={memberModal.name}
                onChange={(event) =>
                  setMemberModal((member) => ({
                    ...member,
                    name: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block">
              <span className={label}>
                Email (optional)
              </span>

              <input
                type="email"
                className={field}
                value={memberModal.email}
                onChange={(event) =>
                  setMemberModal((member) => ({
                    ...member,
                    email: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block">
              <span className={label}>Role</span>

              <select
                className={field}
                value={memberModal.role}
                onChange={(event) =>
                  setMemberModal((member) => ({
                    ...member,
                    role: event.target.value,
                  }))
                }
              >
                {ROLES.map((role) => (
                  <option key={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
              <div>
                {safeMembers.some(
                  (member) => member.id === memberModal.id
                ) && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    onClick={deleteMember}
                  >
                    <Trash2 size={16} />
                    Remove member
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className={secondary}
                  onClick={() => setMemberModal(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={primary}
                >
                  Save member
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
