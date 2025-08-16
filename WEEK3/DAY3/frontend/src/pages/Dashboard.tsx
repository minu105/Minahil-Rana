"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { TaskList } from "@/components/TaskList"
import { TaskForm } from "@/components/TaskForm"
import { TaskStats } from "@/components/TaskStats"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { Plus, BarChart3 } from "lucide-react"

export interface Task {
  _id: string
  title: string
  description?: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate?: string
  createdAt: string
  updatedAt: string
}

const Dashboard = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks")
      setTasks(response.data.data.tasks)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks])
    setShowTaskForm(false)
    toast({
      title: "Success",
      description: "Task created successfully",
    })
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)))
    setEditingTask(null)
    toast({
      title: "Success",
      description: "Task updated successfully",
    })
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter((task) => task._id !== taskId))
    toast({
      title: "Success",
      description: "Task deleted successfully",
    })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
    setShowTaskForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Manage your tasks and stay productive</p>
        </div>
        <Button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {showTaskForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingTask ? "Edit Task" : "Create New Task"}</CardTitle>
                <CardDescription>
                  {editingTask ? "Update your task details" : "Add a new task to your list"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskForm
                  task={editingTask}
                  onTaskCreated={handleTaskCreated}
                  onTaskUpdated={handleTaskUpdated}
                  onCancel={handleCancelEdit}
                />
              </CardContent>
            </Card>
          )}

          <TaskList
            tasks={tasks}
            loading={loading}
            onTaskDeleted={handleTaskDeleted}
            onTaskEdit={handleEditTask}
            onTaskUpdated={handleTaskUpdated}
          />
        </TabsContent>

        <TabsContent value="stats">
          <TaskStats />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard
