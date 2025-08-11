const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = 3000;

// Middleware 
app.use(express.json());


// SWAGGER
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'A simple Task Manager API',
    },
    servers: [
      { url: `http://localhost:${PORT}` }
    ],
  },
  apis: ['./server.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// In-memory "database" joky ram hoti local storage
let tasks = [
  { id: 1, title: "Learn Express", completed: false }
];

// ROUTES WITH SWAGGER DOCS (swagger ky commnts ky saaath)
/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: Successfully retrieved tasks
 */
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, data: tasks, message: "Tasks retrieved successfully" });
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found
 */
app.get('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task) return res.status(404).json({ success: false, message: "Task not found" });
  res.json({ success: true, data: task, message: "Task retrieved successfully" });
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Learn Node.js
 *               completed:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Invalid data
 */
app.post('/api/tasks', (req, res) => {
  const { title, completed } = req.body;

  if (typeof title !== 'string' || typeof completed !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: "Invalid data format. 'title' must be string, 'completed' must be boolean."
    });
  }

  const newTask = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
    title,
    completed
  };

  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask, message: "Task created successfully" });
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Learn Swagger
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Task not found
 */
app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, completed } = req.body;
  const task = tasks.find(t => t.id === id);

  if (!task) return res.status(404).json({ success: false, message: "Task not found" });

  if (typeof title !== 'string' || typeof completed !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: "Invalid data format. 'title' must be string, 'completed' must be boolean."
    });
  }

  task.title = title;
  task.completed = completed;

  res.json({ success: true, data: task, message: "Task updated successfully" });
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) return res.status(404).json({ success: false, message: "Task not found" });

  const deletedTask = tasks.splice(index, 1);
  res.json({ success: true, data: deletedTask[0], message: "Task deleted successfully" });
});


// ERROR HANDLING (middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

//server satrt krein
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});
