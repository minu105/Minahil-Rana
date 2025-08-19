
import React from 'react';
import { Task } from '../api';

interface Props {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<Props> = ({ task, onToggle, onDelete }) => {
  return (
    <li className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/90 px-4 py-3 transition hover:shadow-md">
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <span className={task.completed ? 'line-through text-slate-400' : ''}>{task.title}</span>
      </label>
      <button
        className="btn btn-danger p-2 rounded-lg"
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
        title="Delete task"
      >
        ✕
      </button>
    </li>
  );
};

export default TaskItem;
