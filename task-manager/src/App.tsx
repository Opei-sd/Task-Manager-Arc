import { useMemo, useState } from "react";
import type { Task, Status } from "./types";
import { uid } from "./utils";
import { useTasks } from "./store";
import Column from "./components/Column";

type DueFilter = "" | "overdue" | "week" | "month";

const columns: { key: Status; label: string }[] = [
  { key: "todo", label: "To-Do" },
  { key: "doing", label: "In-Progress" },
  { key: "done", label: "Done" },
];

export default function App() {
  const { tasks, upsert, remove, move, clearAll } = useTasks();
  const [q, setQ] = useState("");
  const [prio, setPrio] = useState<"" | "low" | "medium" | "high">("");
  const [due, setDue] = useState<DueFilter>("");

  const filtered = useMemo(() => {
    const now = new Date();
    const today = new Date(new Date().toISOString().slice(0, 10));

    return tasks.filter((t) => {
      if (prio && t.priority !== prio) return false;

      if (due) {
        const d = t.due ? new Date(t.due) : null;
        if (due === "overdue") {
          if (!d || d >= today) return false;
        } else if (due === "week") {
          if (!d) return false;
          const in7 = new Date(now);
          in7.setDate(now.getDate() + 7);
          if (!(d >= now && d <= in7)) return false;
        } else if (due === "month") {
          if (!d) return false;
          const in1m = new Date(now);
          in1m.setMonth(now.getMonth() + 1);
          if (!(d >= now && d <= in1m)) return false;
        }
      }

      const query = q.trim().toLowerCase();
      if (!query) return true;

      const parts = query.split(/\s+/);
      return parts.every((token) => {
        if (token.startsWith("priority:")) {
          return t.priority === token.split(":")[1];
        }
        if (token.startsWith("tag:")) {
          const tag = token.split(":")[1];
          return t.tags.some((x) => x.toLowerCase() === tag);
        }
        const hay = `${t.title} ${t.desc} ${t.tags.join(" ")}`.toLowerCase();
        return hay.includes(token);
      });
    });
  }, [tasks, q, prio, due]);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") || "").trim();
    if (!title) return;

    const task: Task = {
      id: uid(),
      title,
      desc: String(fd.get("desc") || "").trim(),
      priority: (fd.get("priority") as any) || "medium",
      due: String(fd.get("due") || "") || undefined,
      status: "todo",
      tags: String(fd.get("tags") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      created: Date.now(),
      updated: Date.now(),
    };
    upsert(task);
    e.currentTarget.reset();
    (
      e.currentTarget.elements.namedItem("priority") as HTMLSelectElement
    ).value = "medium";
  }

  function handleEdit(t: Task) {
    upsert(t);
  }

  function handleDrop(taskId: string, status: Status) {
    move(taskId, status);
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <h1>
            Task Manager <span className="pill">Kanban + LocalStorage</span>
          </h1>

          <div className="toolbar">
            <input
              className="grow"
              placeholder="Search… (e.g. 'priority:high' or 'tag:school')"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              value={prio}
              onChange={(e) => setPrio(e.target.value as any)}
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              value={due}
              onChange={(e) => setDue(e.target.value as DueFilter)}
            >
              <option value="">Any due</option>
              <option value="overdue">Overdue</option>
              <option value="week">Due this week</option>
              <option value="month">Due this month</option>
            </select>
            <button
              className="ghost"
              onClick={clearAll}
              title="Delete all tasks"
            >
              Clear All
            </button>
          </div>

          <form className="form" onSubmit={handleCreate}>
            <div className="row">
              <input
                className="grow"
                name="title"
                placeholder="Task title *"
                required
              />
              <select name="priority" defaultValue="medium" title="Priority">
                <option value="medium">Priority: Medium</option>
                <option value="low">Priority: Low</option>
                <option value="high">Priority: High</option>
              </select>
              <input type="date" name="due" />
            </div>
            <textarea
              name="desc"
              rows={2}
              placeholder="Short description…"
            ></textarea>
            <div className="row">
              <input
                className="grow"
                name="tags"
                placeholder="Tags (comma-separated, e.g. school, web3, chores)"
              />
              <button className="primary" type="submit">
                Add Task
              </button>
            </div>
            <span className="muted">
              Tip: Drag cards between columns. Click a title/description to edit
              inline.
            </span>
          </form>
        </div>
      </header>

      <main className="container">
        <section className="grid">
          {columns.map((c) => (
            <Column
              key={c.key}
              label={c.label}
              status={c.key}
              tasks={filtered.filter((t) => t.status === c.key)}
              onDropTask={handleDrop}
              onEdit={handleEdit}
              onDelete={remove}
            />
          ))}
        </section>
        <div className="footer">
          Made with React + TypeScript. Data persists in your browser
          (localStorage).
        </div>
      </main>
    </>
  );
}
