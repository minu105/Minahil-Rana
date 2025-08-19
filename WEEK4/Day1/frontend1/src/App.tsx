import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Check, Trash2, RotateCcw } from "lucide-react";

type Priority = "Low" | "Medium" | "High";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<Priority>("Low");

  useEffect(() => {
    axios.get("http://localhost:5000/api/tasks").then((res) => {
      setTasks(res.data);
    });
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const res = await axios.post("http://localhost:5000/api/tasks", {
      title: newTask,
      priority,
    });

    setTasks((prev) => [...prev, res.data]);
    setNewTask("");
    setPriority("Low");
  };

  const toggleTask = async (id: number) => {
    const res = await axios.put(`http://localhost:5000/api/tasks/${id}/toggle`);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: res.data.completed } : t))
    );
  };
  const changePriority = async (id: number, newPriority: Priority) => {
    const res = await axios.put(`http://localhost:5000/api/tasks/${id}/priority`, {
      priority: newPriority,
    });
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority: res.data.priority } : t))
    );
  };

  const deleteTask = async (id: number) => {
    await axios.delete(`http://localhost:5000/api/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-white/40 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-center">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-700 to-pink-500 bg-clip-text text-transparent drop-shadow">
            ✨ My Todo App
          </h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-10 max-w-2xl overflow-x-hidden">
        <div className="bg-white/85 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-gray-200">
          <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2 mb-6">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter a new task..."
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 shadow-sm bg-white/90 placeholder-gray-400"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="px-3 py-3 rounded-2xl border border-gray-300 bg-white/90 focus:ring-2 focus:ring-indigo-400 text-gray-700"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <button
              type="submit"
              className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-2xl shadow hover:scale-105 hover:opacity-95 transition flex items-center gap-2"
            >
              <Plus size={18} /> Add
            </button>
          </form>
          <div className="space-y-3 max-h-[400px] overflow-y-auto overflow-x-hidden pr-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between bg-white/90 shadow-md p-4 rounded-2xl border border-gray-100 hover:shadow-lg hover:scale-[1.01] transition-transform overflow-hidden"
              >
                <div className="flex-1 pr-3 min-w-0">
                  <span
                    className={`block break-words whitespace-pre-wrap overflow-hidden w-full text-base leading-relaxed ${
                      task.completed
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {task.title}
                  </span>
                  <select
                    value={task.priority}
                    onChange={(e) =>
                      changePriority(task.id, e.target.value as Priority)
                    }
                    className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full border focus:ring-2 ${
                      task.priority === "Low"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : task.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="text-green-600 hover:text-green-800 transition"
                  >
                    {task.completed ? <RotateCcw size={20} /> : <Check size={20} />}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <span className="px-4 py-1.5 bg-gradient-to-r from-green-200 to-green-100 text-green-800 rounded-full text-sm font-medium shadow">
              ✅ Completed: {completedCount}
            </span>
            <span className="px-4 py-1.5 bg-gradient-to-r from-yellow-200 to-yellow-100 text-yellow-800 rounded-full text-sm font-medium shadow">
              ⏳ Pending: {pendingCount}
            </span>
            <span className="px-4 py-1.5 bg-gradient-to-r from-blue-200 to-blue-100 text-blue-800 rounded-full text-sm font-medium shadow">
              📋 Total: {tasks.length}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
