export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  desc: string;
  priority: Priority;
  due?: string; // YYYY-MM-DD
  status: Status;
  tags: string[];
  created: number;
  updated: number;
}
