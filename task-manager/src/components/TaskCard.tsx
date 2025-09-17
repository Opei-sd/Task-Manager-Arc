import type { Task } from "../types";

import { escapeHtml, todayISO } from "../utils";

type Props = {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
};

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const prioClass =
    task.priority === "low"
      ? "prio-low"
      : task.priority === "high"
      ? "prio-high"
      : "prio-med";
  const dueTxt = task.due ? new Date(task.due).toLocaleDateString() : "No due";
  const overdue = task.due && new Date(task.due) < new Date(todayISO());

  return (
    <div
      className="card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
      }}
    >
      <div className="card-header">
        <span className={`badge ${prioClass}`}>
          {task.priority.toUpperCase()}
        </span>
        <div className="actions">
          <button className="ghost" title="Edit" onClick={() => onEdit(task)}>
            ✏️
          </button>
          <button
            className="ghost"
            title="Delete"
            onClick={() => onDelete(task.id)}
          >
            🗑️
          </button>
        </div>
      </div>
      <div
        className="title"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onBlur={(e) => {
          const v = e.currentTarget.textContent?.trim() ?? "";
          if (!v) {
            e.currentTarget.textContent = task.title;
            alert("Title cannot be empty.");
            return;
          }
          if (v !== task.title) onEdit({ ...task, title: v });
        }}
        dangerouslySetInnerHTML={{ __html: escapeHtml(task.title) }}
      />
      <div
        className={`desc ${task.desc ? "" : "muted"}`}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onBlur={(e) => {
          const v = e.currentTarget.textContent?.trim() ?? "";
          if (v !== task.desc)
            onEdit({ ...task, desc: v === "Add description…" ? "" : v });
        }}
        dangerouslySetInnerHTML={{
          __html: escapeHtml(task.desc || "Add description…"),
        }}
      />
      <div className="meta">
        <span title="Due date">
          {overdue ? "⚠️" : "📅"} {dueTxt}
        </span>
        <span>🏷️ {task.tags.length ? task.tags.join(", ") : "No tags"}</span>
      </div>
    </div>
  );
}
