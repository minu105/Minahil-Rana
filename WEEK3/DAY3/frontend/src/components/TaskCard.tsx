"use client"

import { useState } from "react"
import type { Task } from "@/pages/Dashboard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { MoreHorizontal, Edit, Trash2, Calendar, Clock, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  onDelete: (taskId: string) => void
  onEdit: (task: Task) => void
  onUpdate: (task: Task) => void
}

export const TaskCard = ({ task, onDelete, onEdit, onUpdate }: TaskCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)
    try {
      await api.delete(`/tasks/${task._id}`)
      onDelete(task._id)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const handleStatusChange = async (newStatus: Task["status"]) => {
    setLoading(true)
    try {
      const response = await api.put(`/tasks/${task._id}`, { status: newStatus })
      onUpdate(response.data.data.task)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Card className={`transition-all hover:shadow-md ${task.status === "completed" ? "opacity-75" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className={`text-lg ${task.status === "completed" ? "line-through" : ""}`}>
                {task.title}
              </CardTitle>
              {task.description && <CardDescription className="mt-1">{task.description}</CardDescription>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge
              className={`cursor-pointer ${getStatusColor(task.status)}`}
              onClick={() => {
                const nextStatus =
                  task.status === "pending" ? "in-progress" : task.status === "in-progress" ? "completed" : "pending"
                handleStatusChange(nextStatus)
              }}
            >
              {task.status === "completed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
              {task.status === "in-progress" && <Clock className="mr-1 h-3 w-3" />}
              {task.status.replace("-", " ")}
            </Badge>
            <Badge className={getPriorityColor(task.priority)}>{task.priority} priority</Badge>
          </div>

          {task.dueDate && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Calendar className="mr-1 h-4 w-4" />
              Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
            </div>
          )}

          <div className="text-xs text-gray-500">Created: {format(new Date(task.createdAt), "MMM dd, yyyy HH:mm")}</div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task "{task.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
