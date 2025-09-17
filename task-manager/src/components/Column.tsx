import type { Task, Status } from "../types";
import TaskCard from "./TaskCard";

type Props = {
  label: string;
  status: Status;
  tasks: Task[];
  onDropTask: (taskId: string, status: Status) => void;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
};

export default function Column({
  label,
  status,
  tasks,
  onDropTask,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="column" data-status={status}>
      <div className="col-head">
        <div className="col-title">{label}</div>
        <div className="count">{tasks.length}</div>
      </div>
      <div
        className="dropzone"
        data-status={status}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain");
          if (id) onDropTask(id, status);
        }}
      >
        {tasks.length === 0 ? (
          <div className="empty">Drag tasks here</div>
        ) : (
          tasks.map((t) => (
            <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
