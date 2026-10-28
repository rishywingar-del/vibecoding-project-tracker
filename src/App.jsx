
import { useEffect, useState } from "react";

const stages = [
  { id: "todo", name: "To Do", emoji: "📋", bg: "bg-slate-100" },
  { id: "in-progress", name: "In Progress", emoji: "🚀", bg: "bg-blue-50" },
  { id: "review", name: "Review", emoji: "👀", bg: "bg-amber-50" },
  { id: "done", name: "Done", emoji: "✅", bg: "bg-green-50" },
];

const starterTasks = [
  { id: "1", title: "Create Kanban board", description: "Set up four task columns.", type: "feature", status: "done", assignee: "Rishy Winayagarajah", dueDate: "", aiTool: "", aiPrompt: "", aiOutcome: "" },
  { id: "2", title: "Test task display", description: "Check tasks appear correctly.", type: "feature", status: "in-progress", assignee: "Rishy Winayagarajah", dueDate: "", aiTool: "", aiPrompt: "", aiOutcome: "" },
];

const inputStyle = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";
const buttonStyle = "rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700";
const lightButton = "rounded-xl bg-violet-100 px-4 py-2.5 text-sm font-bold text-violet-700 hover:bg-violet-200";

function useSaved(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

function newTask() {
  return {
    title: "",
    description: "",
    type: "feature",
    status: "todo",
    assignee: "",
    dueDate: "",
    aiTool: "",
    aiPrompt: "",
    aiOutcome: "",
  };
}

function getDueState(task) {
  if (!task.dueDate || task.status === "done") return "normal";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate + "T00:00:00");
  if (due < today) return "overdue";
  if (due - today <= 3 * 86400000) return "soon";
  return "normal";
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function suggestDescription(title, type) {
  const name = title.trim().replace(/[.!?]+$/, "");
  if (!name) return "";

  if (type === "bug") {
    return `Investigate and resolve the issue: ${name}. Reproduce the problem, identify its cause, implement a suitable fix and test that the affected functionality works correctly.`;
  }

  return `Implement ${name.charAt(0).toLowerCase() + name.slice(1)}. Ensure the feature meets user needs, works with the existing application and is tested before moving to review.`;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 px-3 py-1 text-xl">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (email.toLowerCase().trim() === "demo@flowstate.app" && password === "FlowState123") {
      onLogin();
    } else {
      setError("Incorrect demo login details.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-violet-900 to-fuchsia-700 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-4xl font-black text-white">F</div>
          <h1 className="text-3xl font-black">Flow<span className="text-violet-600">State</span></h1>
          <p className="mt-2 text-sm text-slate-500">Less chaos. More creating. ✨</p>
        </div>

        <h2 className="mb-4 text-xl font-bold">Welcome back 👋</h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="demo@flowstate.app" className={inputStyle} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className={inputStyle} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className={`${buttonStyle} w-full`}>Sign In →</button>
        </form>

        <p className="my-4 text-center text-xs text-slate-400">OR</p>
        <button type="button" onClick={onLogin} className={`${lightButton} w-full`}>✨ Continue as Demo</button>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
          <strong>Demo credentials</strong>
          <p>demo@flowstate.app</p>
          <p>FlowState123</p>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">Prototype login only — no secure authentication.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    try {
      return sessionStorage.getItem("flowstate.demoLogin") === "true";
    } catch {
      return false;
    }
  });

  const [tasks, setTasks] = useSaved("vibetracker.tasks", starterTasks);
  const [team, setTeam] = useSaved("vibetracker.team", ["Rishy Winayagarajah"]);
  const [deliverables, setDeliverables] = useSaved("vibetracker.anchors", []);

  const [page, setPage] = useState("overview");
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(newTask());
  const [teamOpen, setTeamOpen] = useState(false);
  const [newMember, setNewMember] = useState("");
  const [teamError, setTeamError] = useState("");
  const [editingDeliverable, setEditingDeliverable] = useState(null);
  const [deliverableForm, setDeliverableForm] = useState({ title: "", description: "", url: "" });
  const [deliverableError, setDeliverableError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const completed = tasks.filter(t => t.status === "done").length;
  const active = tasks.filter(t => t.status === "in-progress").length;
  const overdue = tasks.filter(t => getDueState(t) === "overdue").length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const priorities = tasks
    .filter(t => t.status !== "done")
    .sort((a, b) => {
      const rank = t => getDueState(t) === "overdue" ? 0 : getDueState(t) === "soon" ? 1 : 2;
      return rank(a) - rank(b);
    })
    .slice(0, 4);

  const visibleTasks = tasks.filter(t => {
    const text = [t.title, t.description, t.assignee].join(" ").toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "mine" ? t.assignee === team[0] :
       filter === "overdue" ? getDueState(t) === "overdue" :
       t.type === filter);
    return matchesSearch && matchesFilter;
  });

  function login() {
    try { sessionStorage.setItem("flowstate.demoLogin", "true"); } catch {}
    setLoggedIn(true);
  }

  function logout() {
    try { sessionStorage.removeItem("flowstate.demoLogin"); } catch {}
    setLoggedIn(false);
  }

  function openNewTask() {
    setForm({ ...newTask(), assignee: team[0] || "" });
    setEditingTask({ id: null });
  }

  function openEditTask(task) {
    setForm({ ...newTask(), ...task, dueDate: task.dueDate || "" });
    setEditingTask(task);
  }

  function saveTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const saved = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || null,
    };

    if (editingTask.id === null) {
      setTasks(current => [
        ...current,
        { ...saved, id: crypto.randomUUID(), createdDate: new Date().toISOString().slice(0, 10) },
      ]);
    } else {
      setTasks(current => current.map(t => t.id === editingTask.id ? { ...t, ...saved } : t));
    }

    setEditingTask(null);
  }

  function deleteTask() {
    if (!window.confirm("Delete this task?")) return;
    setTasks(current => current.filter(t => t.id !== editingTask.id));
    setEditingTask(null);
  }

  function moveTask(id, status) {
    setTasks(current => current.map(t => t.id === id ? { ...t, status } : t));
  }

  function addMember(e) {
    e.preventDefault();
    const name = newMember.trim().replace(/\s+/g, " ");
    if (!name) return;

    if (team.some(t => t.toLowerCase() === name.toLowerCase())) {
      setTeamError("This person is already in the team.");
      return;
    }

    setTeam(current => [...current, name]);
    setNewMember("");
    setTeamError("");
  }

  function removeMember(name) {
    if (tasks.some(t => t.assignee === name)) {
      setTeamError("Reassign this person's tasks before removing them.");
      return;
    }
    setTeam(current => current.filter(t => t !== name));
    setTeamError("");
  }

  function openNewDeliverable() {
    setDeliverableForm({ title: "", description: "", url: "" });
    setDeliverableError("");
    setEditingDeliverable({ id: null });
  }

  function openEditDeliverable(item) {
    setDeliverableForm({
      title: item.title,
      description: item.description || "",
      url: item.url || "",
    });
    setDeliverableError("");
    setEditingDeliverable(item);
  }

  function saveDeliverable(e) {
    e.preventDefault();

    const saved = {
      title: deliverableForm.title.trim(),
      description: deliverableForm.description.trim(),
      url: deliverableForm.url.trim(),
    };

    if (!saved.title) return;

    if (saved.url) {
      try {
        const parsed = new URL(saved.url);
        if (!["https:", "http:"].includes(parsed.protocol)) throw new Error();
      } catch {
        setDeliverableError("Enter a valid http:// or https:// link.");
        return;
      }
    }

    if (editingDeliverable.id === null) {
      setDeliverables(current => [...current, { ...saved, id: crypto.randomUUID() }]);
    } else {
      setDeliverables(current => current.map(d => d.id === editingDeliverable.id ? { ...d, ...saved } : d));
    }
    setEditingDeliverable(null);
  }

  function deleteDeliverable() {
    if (!window.confirm("Remove this deliverable?")) return;
    setDeliverables(current => current.filter(d => d.id !== editingDeliverable.id));
    setEditingDeliverable(null);
  }

  if (!loggedIn) return <Login onLogin={login} />;

  return (
    <div className="min-h-screen bg-[#f7f7ff] text-slate-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 bg-[#121832] text-white shadow-lg">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-3">
          <button type="button" onClick={() => setPage("overview")} className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl font-black">F</span>
            <span className="text-xl font-black">Flow<span className="text-violet-400">State</span></span>
          </button>

          <nav className="order-3 flex w-full gap-2 overflow-x-auto md:order-2 md:w-auto">
            {[
              ["overview", "🏠 Overview"],
              ["board", "📋 Task Board"],
              ["deliverables", "📁 Deliverables"],
            ].map(([id, name]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPage(id)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold ${
                  page === id ? "bg-violet-600" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {name}
              </button>
            ))}
          </nav>

          <div className="order-2 flex gap-2 md:order-3">
            <button type="button" onClick={() => setTeamOpen(true)} className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold">👥 {team.length}</button>
            <button type="button" onClick={openNewTask} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold">+ Task</button>
            <button type="button" onClick={logout} className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-6">
        {/* COMPACT DASHBOARD */}
        {page === "overview" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-black">Your Workspace 👋</h1>
              <p className="mt-1 text-sm text-slate-500">Everything important, at a glance.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ["📋", "Total Tasks", tasks.length, "bg-violet-50", "text-violet-700"],
                ["🚀", "In Progress", active, "bg-blue-50", "text-blue-700"],
                ["✅", "Completed", completed, "bg-green-50", "text-green-700"],
                ["⏰", "Overdue", overdue, "bg-rose-50", "text-rose-700"],
              ].map(([emoji, name, value, bg, colour]) => (
                <div key={name} className={`rounded-2xl ${bg} p-4`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-600">{name}</p>
                    <span>{emoji}</span>
                  </div>
                  <p className={`mt-2 text-3xl font-black ${colour}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">Project Progress 🚀</h2>
                  <p className="mt-1 text-xs text-violet-100">{completed} of {tasks.length} tasks completed</p>
                </div>
                <span className="text-3xl font-black">{progress}%</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-black">🎯 Current Priorities</h2>
                <button type="button" onClick={() => setPage("board")} className="text-xs font-bold text-violet-600">View Board →</button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {priorities.map(task => (
                  <button key={task.id} type="button" onClick={() => openEditTask(task)} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-left hover:bg-violet-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{task.title}</p>
                      <p className="truncate text-xs text-slate-500">{task.assignee || "Unassigned"}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-violet-600">{stages.find(s => s.id === task.status)?.name}</span>
                  </button>
                ))}
                {priorities.length === 0 && <p className="text-sm text-green-700">🎉 All tasks completed!</p>}
              </div>
            </div>
          </div>
        )}

        {/* FOUR-COLUMN TASK BOARD */}
        {page === "board" && (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black">📋 Task Board</h1>
                <p className="mt-1 text-sm text-slate-500">Move tasks from idea to completion.</p>
              </div>
              <button type="button" onClick={openNewTask} className={buttonStyle}>+ Add Task</button>
            </div>

            <div className="mb-4 flex flex-wrap gap-3">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔎 Search tasks..." aria-label="Search tasks" className={`${inputStyle} max-w-sm`} />
              <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter tasks" className={`${inputStyle} max-w-44`}>
                <option value="all">All Tasks</option>
                <option value="mine">My Tasks</option>
                <option value="feature">Features</option>
                <option value="bug">Bugs</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              {stages.map(stage => {
                const items = visibleTasks.filter(t => t.status === stage.id);

                return (
                  <section key={stage.id} className={`min-w-0 min-h-[360px] rounded-2xl ${stage.bg} p-3`}>
                    <div className="mb-4 flex items-center justify-between px-1">
                      <h2 className="text-sm font-black">{stage.emoji} {stage.name}</h2>
                      <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold">{items.length}</span>
                    </div>

                    <div className="space-y-3">
                      {items.map(task => {
                        const due = getDueState(task);

                        return (
                          <article key={task.id} className={`min-w-0 rounded-xl border p-4 shadow-sm ${
                            due === "overdue" ? "border-red-300 bg-red-50" :
                            due === "soon" ? "border-amber-300 bg-amber-50" :
                            "border-white bg-white"
                          }`}>
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${
                                task.type === "bug" ? "bg-rose-100 text-rose-700" : "bg-violet-100 text-violet-700"
                              }`}>
                                {task.type === "bug" ? "🐛 Bug" : "⚡ Feature"}
                              </span>
                              <button type="button" onClick={() => openEditTask(task)} className="text-xs font-bold text-violet-600">Edit</button>
                            </div>

                            <button type="button" onClick={() => openEditTask(task)} className="w-full text-left">
                              <h3 className="break-words text-sm font-black">{task.title}</h3>
                              <p className="mt-2 line-clamp-3 break-words text-xs leading-5 text-slate-500">{task.description || "No description yet."}</p>
                            </button>

                            {task.dueDate && (
                              <p className={`mt-3 text-xs font-bold ${due === "overdue" ? "text-red-600" : due === "soon" ? "text-amber-700" : "text-slate-500"}`}>
                                📅 {formatDate(task.dueDate)} {due === "overdue" ? "· Overdue" : due === "soon" ? "· Due Soon" : ""}
                              </p>
                            )}

                            <div className="mt-3 border-t border-slate-100 pt-3">
                              <p className="mb-2 truncate text-xs text-slate-500">👤 {task.assignee || "Unassigned"}</p>
                              <select value={task.status} onChange={e => moveTask(task.id, e.target.value)} aria-label={`Move ${task.title}`} className="w-full min-w-0 rounded-lg border border-slate-200 bg-white p-2 text-xs">
                                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            </div>
                          </article>
                        );
                      })}
                      {items.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-400">Nothing here yet ✨</p>}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}

        {/* DELIVERABLES */}
        {page === "deliverables" && (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black">📁 Deliverables</h1>
                <p className="mt-1 text-sm text-slate-500">Keep important project links together.</p>
              </div>
              <button type="button" onClick={openNewDeliverable} className={buttonStyle}>+ Add Deliverable</button>
            </div>

            {deliverables.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-white p-10 text-center">
                <div className="text-4xl">📁</div>
                <h2 className="mt-3 font-black">Nothing saved yet</h2>
                <p className="mt-2 text-sm text-slate-500">Add your GitHub repository, documents or demo link.</p>
                <button type="button" onClick={openNewDeliverable} className={`${buttonStyle} mt-5`}>Add Resource</button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {deliverables.map(item => (
                  <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-2xl">📁</span>
                      <button type="button" onClick={() => openEditDeliverable(item)} className="text-xs font-bold text-violet-600">Edit</button>
                    </div>
                    <h2 className="break-words font-black">{item.title}</h2>
                    <p className="mt-2 break-words text-sm text-slate-500">{item.description}</p>
                    {item.url && /^https?:\/\//i.test(item.url) && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-bold text-violet-600">Open Resource ↗</a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="mt-8 border-t border-slate-200 py-4 text-center text-xs text-slate-400">FlowState ✨ Built for developers</footer>
      </main>

      {/* CREATE / EDIT TASK */}
      {editingTask !== null && (
        <Modal title={editingTask.id === null ? "✨ Create Task" : "✏️ Edit Task"} onClose={() => setEditingTask(null)}>
          <form onSubmit={saveTask} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold">Task Title</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Fix mobile navigation" className={inputStyle} />
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label className="text-sm font-bold">Description</label>
                <button
                  type="button"
                  onClick={() => {
                    const suggestion = suggestDescription(form.title, form.type);
                    if (!suggestion) return;
                    if (form.description.trim() && !window.confirm("Replace the current description with a suggestion?")) return;
                    setForm({ ...form, description: suggestion });
                  }}
                  className="rounded-lg bg-fuchsia-100 px-3 py-2 text-xs font-bold text-fuchsia-700 hover:bg-fuchsia-200"
                >
                  ✨ Suggest Description
                </button>
              </div>
              <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the task, or generate a suggestion..." className={inputStyle} />
              <p className="mt-1 text-xs text-slate-400">Uses a local template, not a live AI service. You can edit the suggestion.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputStyle}>
                  <option value="feature">⚡ Feature</option>
                  <option value="bug">🐛 Bug</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputStyle}>
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Assigned To</label>
                <select value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} className={inputStyle}>
                  <option value="">Unassigned</option>
                  {form.assignee && !team.includes(form.assignee) && <option value={form.assignee}>{form.assignee}</option>}
                  {team.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Due Date</label>
                <input type="date" value={form.dueDate || ""} onChange={e => setForm({ ...form, dueDate: e.target.value })} className={inputStyle} />
              </div>
            </div>

            <details className="rounded-xl border border-slate-200 p-4">
              <summary className="cursor-pointer text-sm font-black">🤖 AI Development Log (optional)</summary>
              <p className="mt-2 text-xs text-slate-500">Record how AI helped with this task.</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-bold">AI Tool</label>
                  <input value={form.aiTool || ""} onChange={e => setForm({ ...form, aiTool: e.target.value })} placeholder="e.g. ChatGPT" className={inputStyle} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold">Prompt Used</label>
                  <textarea rows={2} value={form.aiPrompt || ""} onChange={e => setForm({ ...form, aiPrompt: e.target.value })} className={inputStyle} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold">Outcome / Changes</label>
                  <textarea rows={2} value={form.aiOutcome || ""} onChange={e => setForm({ ...form, aiOutcome: e.target.value })} className={inputStyle} />
                </div>
              </div>
            </details>

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              {editingTask.id !== null ? (
                <button type="button" onClick={deleteTask} className="text-sm font-bold text-red-600">Delete</button>
              ) : <span />}
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingTask(null)} className={lightButton}>Cancel</button>
                <button type="submit" className={buttonStyle}>{editingTask.id === null ? "Create Task" : "Save Changes"}</button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* TEAM MANAGEMENT */}
      {teamOpen && (
        <Modal title="👥 Manage Team" onClose={() => setTeamOpen(false)}>
          <form onSubmit={addMember} className="flex gap-2">
            <input required value={newMember} onChange={e => setNewMember(e.target.value)} placeholder="Teammate's name" className={`${inputStyle} min-w-0 flex-1`} />
            <button type="submit" className={buttonStyle}>Add</button>
          </form>

          {teamError && <p className="mt-3 text-sm text-red-600">{teamError}</p>}

          <div className="mt-4 space-y-2">
            {team.map(name => (
              <div key={name} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">
                <span className="min-w-0 truncate text-sm font-bold">👤 {name}</span>
                <button type="button" onClick={() => removeMember(name)} className="text-xs font-bold text-red-600">Remove</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setTeamOpen(false)} className={`${lightButton} mt-5 w-full`}>Done</button>
        </Modal>
      )}

      {/* DELIVERABLE EDITOR */}
      {editingDeliverable !== null && (
        <Modal title={editingDeliverable.id === null ? "📁 Add Deliverable" : "✏️ Edit Deliverable"} onClose={() => setEditingDeliverable(null)}>
          <form onSubmit={saveDeliverable} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold">Name</label>
              <input required value={deliverableForm.title} onChange={e => setDeliverableForm({ ...deliverableForm, title: e.target.value })} placeholder="e.g. GitHub Repository" className={inputStyle} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold">Description</label>
              <textarea rows={3} value={deliverableForm.description} onChange={e => setDeliverableForm({ ...deliverableForm, description: e.target.value })} className={inputStyle} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold">Link (optional)</label>
              <input type="url" value={deliverableForm.url} onChange={e => setDeliverableForm({ ...deliverableForm, url: e.target.value })} placeholder="https://..." className={inputStyle} />
            </div>
            {deliverableError && <p className="text-sm text-red-600">{deliverableError}</p>}
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              {editingDeliverable.id !== null ? (
                <button type="button" onClick={deleteDeliverable} className="text-sm font-bold text-red-600">Remove</button>
              ) : <span />}
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingDeliverable(null)} className={lightButton}>Cancel</button>
                <button type="submit" className={buttonStyle}>Save</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
