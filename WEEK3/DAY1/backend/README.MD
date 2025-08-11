*Task Manager API*

A simple Node.js + Express based Task Manager API with Swagger documentation.
Features

    -CRUD operations for tasks (Create, Read, Update, Delete)

    -In-memory task storage (no database required)

    -API documentation with Swagger UI

    -JSON-based request and response handling

    -Error handling middleware

The API will run at:

http://localhost:3000

Swagger API docs will be available at:

http://localhost:3000/api-docs

API Endpoints
Method	Endpoint	    Description
GET	    /api/tasks	    Get all tasks
GET	    /api/tasks/:id	Get task by ID
POST	/api/tasks	    Create a new task
PUT	    /api/tasks/:id	Update an existing task
DELETE	/api/tasks/:id	Delete a task
