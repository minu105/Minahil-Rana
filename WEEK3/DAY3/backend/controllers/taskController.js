const Task = require("../models/Task")

// @desc    Get all tasks for authenticated user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, sortBy = "createdAt", order = "desc", page = 1, limit = 10 } = req.query

    // Build filter object
    const filter = { user: req.user.id }
    if (status) filter.status = status
    if (priority) filter.priority = priority

    // Build sort object
    const sortOrder = order === "asc" ? 1 : -1
    const sort = { [sortBy]: sortOrder }

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Execute query with pagination
    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit))
      .populate("user", "name email")

    // Get total count for pagination info
    const totalTasks = await Task.countDocuments(filter)
    const totalPages = Math.ceil(totalTasks / Number.parseInt(limit))

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalTasks,
          hasNextPage: Number.parseInt(page) < totalPages,
          hasPrevPage: Number.parseInt(page) > 1,
        },
      },
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching tasks",
    })
  }
}

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("user", "name email")

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    res.json({
      success: true,
      data: { task },
    })
  } catch (error) {
    console.error("Get task by ID error:", error)

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching task",
    })
  }
}

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      user: req.user.id,
    })

    const populatedTask = await Task.findById(task._id).populate("user", "name email")

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { task: populatedTask },
    })
  } catch (error) {
    console.error("Create task error:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }))
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating task",
    })
  }
}

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body

    let task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    // Update fields
    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null

    task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user", "name email")

    res.json({
      success: true,
      message: "Task updated successfully",
      data: { task },
    })
  } catch (error) {
    console.error("Update task error:", error)

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      })
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }))
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating task",
    })
  }
}

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    await Task.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Task deleted successfully",
      data: { deletedTask: task },
    })
  } catch (error) {
    console.error("Delete task error:", error)

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error while deleting task",
    })
  }
}

// @desc    Get task statistics for user
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const priorityStats = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ])

    const totalTasks = await Task.countDocuments({ user: req.user.id })

    res.json({
      success: true,
      data: {
        totalTasks,
        statusBreakdown: stats,
        priorityBreakdown: priorityStats,
      },
    })
  } catch (error) {
    console.error("Get task stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching task statistics",
    })
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
}
