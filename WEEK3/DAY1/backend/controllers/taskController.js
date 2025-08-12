const { tasks } = require("../data/taskData")
const getAllTasks = (req, res) => {
  res.json({ success: true, data: tasks, message: "Tasks retrieved successfully" })
}

const getTaskById = (req, res) => {
  const id = Number.parseInt(req.params.id)
  const task = tasks.find((t) => t.id === id)

  if (!task) {
    return res.status(404).json({ success: false, message: "Task not found" })
  }
  res.json({ success: true, data: task, message: "Task retrieved successfully" })
}

const createTask = (req, res) => {
  const { title, completed } = req.body

  if (typeof title !== "string" || typeof completed !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Invalid data format. 'title' must be string, 'completed' must be boolean.",
    })
  }

  const newTask = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
    title,
    completed,
  }

  tasks.push(newTask)
  res.status(201).json({ success: true, data: newTask, message: "Task created successfully" })
}

const updateTask = (req, res) => {
  const id = Number.parseInt(req.params.id)
  const { title, completed } = req.body
  const task = tasks.find((t) => t.id === id)

  if (!task) {
    return res.status(404).json({ success: false, message: "Task not found" })
  }

  if (typeof title !== "string" || typeof completed !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Invalid data format. 'title' must be string, 'completed' must be boolean.",
    })
  }

  task.title = title
  task.completed = completed

  res.json({ success: true, data: task, message: "Task updated successfully" })
}

const deleteTask = (req, res) => {
  const id = Number.parseInt(req.params.id)
  const index = tasks.findIndex((t) => t.id === id)

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Task not found" })
  }

  const deletedTask = tasks.splice(index, 1)
  res.json({ success: true, data: deletedTask[0], message: "Task deleted successfully" })
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
}
