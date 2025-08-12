# Task Manager API v2.0

A robust REST API for task management with JWT authentication, MongoDB persistence, and comprehensive documentation.

## 🚀 Features

- **JWT Authentication** - Secure user registration and login
- **Task CRUD Operations** - Complete task management with filtering and pagination
- **MongoDB Integration** - Persistent data storage with Mongoose ODM
- **Input Validation** - Comprehensive request validation with express-validator
- **API Documentation** - Interactive Swagger UI documentation
- **Error Handling** - Detailed error responses and logging
- **Security** - Password hashing, JWT tokens, and CORS protection

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: express-validator
- **Documentation**: swagger-ui-express + swagger-jsdoc
- **Security**: CORS, helmet (recommended for production)

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd task-manager-api
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   Create a `.env` file in the root directory:
   \`\`\`env
   # Database
   MONGODB_URI=mongodb://localhost:27017/taskmanager
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   \`\`\`

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   \`\`\`bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   \`\`\`

5. **Run the application**
   \`\`\`bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   \`\`\`

## 📚 API Documentation

Once the server is running, visit:
- **Interactive Documentation**: http://localhost:5000/api/docs
- **API Specification (JSON)**: http://localhost:5000/api/docs/json
- **Health Check**: http://localhost:5000/health

## 🔐 Authentication

### Register a new user
\`\`\`bash
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
\`\`\`

### Login
\`\`\`bash
POST /api/users/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
\`\`\`

### Get user profile
\`\`\`bash
GET /api/users/profile
Authorization: Bearer <your-jwt-token>
\`\`\`

## 📋 Task Management

### Get all tasks (with filtering and pagination)
\`\`\`bash
GET /api/tasks?status=pending&priority=high&page=1&limit=10
Authorization: Bearer <your-jwt-token>
\`\`\`

### Create a new task
\`\`\`bash
POST /api/tasks
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "pending",
  "priority": "high",
  "dueDate": "2024-02-01T23:59:59.000Z"
}
\`\`\`

### Update a task
\`\`\`bash
PUT /api/tasks/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "status": "completed",
  "priority": "medium"
}
\`\`\`

### Delete a task
\`\`\`bash
DELETE /api/tasks/:id
Authorization: Bearer <your-jwt-token>
\`\`\`

### Get task statistics
\`\`\`bash
GET /api/tasks/stats
Authorization: Bearer <your-jwt-token>
\`\`\`

## 🧪 Testing with Postman

1. **Import the API collection**
   - Use the Swagger JSON specification at `/api/docs/json`
   - Or manually create requests using the examples above

2. **Authentication Flow**
   - Register a new user or login with existing credentials
   - Copy the JWT token from the response
   - Add it to the Authorization header: `Bearer <token>`

3. **Test CRUD Operations**
   - Create tasks with different priorities and statuses
   - Test filtering and pagination
   - Update task statuses
   - Delete completed tasks

## 🔧 API Endpoints

### Authentication Routes
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)

### Task Routes (All protected)
- `GET /api/tasks` - Get all user tasks (with filtering/pagination)
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

### Utility Routes
- `GET /` - API information
- `GET /health` - Health check
- `GET /api/docs` - Interactive API documentation

## 📊 Query Parameters

### Task Filtering & Sorting
- `status` - Filter by task status (pending, in-progress, completed)
- `priority` - Filter by priority (low, medium, high)
- `sortBy` - Sort field (createdAt, updatedAt, title, dueDate, priority)
- `order` - Sort order (asc, desc)
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 10, max: 100)

## 🛡️ Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - express-validator for all inputs
- **CORS Protection** - Configurable cross-origin requests
- **Error Handling** - No sensitive data in error responses
- **Rate Limiting** - Recommended for production (not implemented)

## 🚀 Production Deployment

1. **Environment Variables**
   \`\`\`env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
   JWT_SECRET=your-production-secret-key
   PORT=5000
   \`\`\`

2. **Additional Security** (Recommended)
   \`\`\`bash
   npm install helmet express-rate-limit
   \`\`\`

3. **Process Management**
   \`\`\`bash
   npm install -g pm2
   pm2 start server.js --name "task-manager-api"
   \`\`\`

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the health check endpoint at `/health`
