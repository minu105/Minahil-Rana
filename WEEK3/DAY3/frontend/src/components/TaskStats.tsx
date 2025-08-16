"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { BarChart3, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react"

interface TaskStatsData {
  totalTasks: number
  statusBreakdown: Array<{ _id: string; count: number }>
  priorityBreakdown: Array<{ _id: string; count: number }>
}

export const TaskStats = () => {
  const [stats, setStats] = useState<TaskStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get("/tasks/stats")
      setStats(response.data.data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch task statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">Failed to load statistics</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusCount = (status: string) => {
    return stats.statusBreakdown.find((item) => item._id === status)?.count || 0
  }

  const getPriorityCount = (priority: string) => {
    return stats.priorityBreakdown.find((item) => item._id === priority)?.count || 0
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Task Statistics
          </CardTitle>
          <CardDescription>Overview of your task management progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">{stats.totalTasks}</div>
            <p className="text-gray-600">Total Tasks</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Completed</span>
              </div>
              <span className="font-semibold">{getStatusCount("completed")}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>In Progress</span>
              </div>
              <span className="font-semibold">{getStatusCount("in-progress")}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span>Pending</span>
              </div>
              <span className="font-semibold">{getStatusCount("pending")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>High Priority</span>
              </div>
              <span className="font-semibold">{getPriorityCount("high")}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Medium Priority</span>
              </div>
              <span className="font-semibold">{getPriorityCount("medium")}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Low Priority</span>
              </div>
              <span className="font-semibold">{getPriorityCount("low")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
