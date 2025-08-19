
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export const getTasks = async (): Promise<Task[]> => {
  const res = await api.get<Task[]>('/tasks');
  return res.data;
};

export const addTask = async (title: string): Promise<Task> => {
  const res = await api.post<Task>('/tasks', { title });
  return res.data;
};

export const toggleTask = async (id: number): Promise<Task> => {
  const res = await api.put<Task>(`/tasks/${id}`);
  return res.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};
