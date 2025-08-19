// backend/index.ts
import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

type Priority = "Low" | "Medium" | "High";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
}

let tasks: Task[] = [];
let nextId = 1;

// ✅ Get all tasks
app.get("/api/tasks", (req: Request, res: Response) => {
  res.json(tasks);
});

// ✅ Add new task
app.post("/api/tasks", (req: Request, res: Response) => {
  const { title, priority } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  const newTask: Task = {
    id: nextId++,
    title,
    completed: false,
    priority: priority || "Low", // default priority Low
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// ✅ Toggle completed
app.put("/api/tasks/:id/toggle", (req: Request, res: Response) => {
  const { id } = req.params;
  const task = tasks.find((t) => t.id === parseInt(id));
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  task.completed = !task.completed;
  res.json(task);
});

// ✅ Update priority
app.put("/api/tasks/:id/priority", (req: Request, res: Response) => {
  const { id } = req.params;
  const { priority } = req.body;
  const task = tasks.find((t) => t.id === parseInt(id));
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  if (!["Low", "Medium", "High"].includes(priority)) {
    return res.status(400).json({ message: "Invalid priority" });
  }
  task.priority = priority as Priority;
  res.json(task);
});

// ✅ Delete task
app.delete("/api/tasks/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  tasks = tasks.filter((t) => t.id !== parseInt(id));
  res.json({ message: "Task deleted" });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
