import { useLocalStorage } from "./useLocalStorage";
import type { Task, Status } from "./types";

const LS_KEY = "kanban_tasks_v1";

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(LS_KEY, []);

  function upsert(next: Task) {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === next.id);
      next.updated = Date.now();
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = next;
        return copy;
      }
      return [...prev, next];
    });
  }

  function remove(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function move(id: string, status: Status) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, updated: Date.now() } : t))
    );
  }

  function clearAll() {
    setTasks([]);
  }

  return { tasks, upsert, remove, move, clearAll };
}
