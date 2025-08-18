# 🍃 Tea E-commerce Backend API

A comprehensive Node.js + Express + MongoDB backend API for a premium tea e-commerce website, built following modern development practices and hackathon requirements.

## 🚀 Features

- **🔐 Authentication**: JWT-based user registration and login with secure password hashing
- **📦 Product Management**: Full CRUD operations with advanced filtering and search
- **🛒 Cart System**: Complete shopping cart functionality with user authentication
- **✅ Input Validation**: Express-validator for comprehensive input sanitization
- **📚 API Documentation**: Interactive Swagger/OpenAPI documentation
- **🗄️ Database**: MongoDB with Mongoose ODM and proper indexing
- **🔒 Security**: CORS protection, rate limiting, and secure headers
- **📁 Clean Architecture**: Organized folder structure with separation of concerns

## 📋 Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **Validation**: express-validator
- **Documentation**: Swagger UI + swagger-jsdoc
- **Security**: CORS, helmet, rate limiting

## 🏗️ Project Structure

\`\`\`
tea-ecommerce-backend/
├── src/
│   ├── controllers/          # Business logic controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── cartController.js
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Cart.js
│   ├── routes/              # API route definitions
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── cartRoutes.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   └── validateRequest.js
│   ├── docs/               # API documentation
│   │   └── swagger.js
│   └── config/             # Configuration files
│       └── db.js
├── scripts/                # Database scripts
│   └── seed-products.js
├── public/                 # Static assets (tea images)
├── server.js              # Main server file
├── package.json
├── .env
└── README.md
\`\`\`

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone & Install
\`\`\`bash
git clone <repository-url>
cd tea-ecommerce-backend
npm install
\`\`\`

### 2. Environment Configuration
\`\`\`bash
cp .env.example .env
\`\`\`

Update the `.env` file with your configuration:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tea-ecommerce
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-characters
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
\`\`\`

### 3. Database Setup
Make sure MongoDB is running, then seed sample data:
\`\`\`bash
node scripts/seed-products.js
\`\`\`

### 4. Start the Server
\`\`\`bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
\`\`\`

## 📚 API Documentation

Once running, access the interactive documentation:
- **Swagger UI**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/api/health
- **API Base**: http://localhost:5000/api

## 🔗 API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | User login | ❌ |
| GET | `/profile` | Get user profile | ✅ |

### 📦 Products (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all products (with filters) | ❌ |
| GET | `/:id` | Get single product | ❌ |
| POST | `/` | Create new product | ✅ (Admin) |
| PUT | `/:id` | Update product | ✅ (Admin) |
| DELETE | `/:id` | Delete product | ✅ (Admin) |

### 🛒 Cart (`/api/cart`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user's cart | ✅ |
| POST | `/add` | Add item to cart | ✅ |
| PUT | `/update` | Update item quantity | ✅ |
| DELETE | `/remove/:productId` | Remove item from cart | ✅ |
| DELETE | `/clear` | Clear entire cart | ✅ |

## 🔍 Advanced Product Filtering

The products API supports comprehensive filtering and search:

\`\`\`bash
GET /api/products?category=green-tea&collection=premium&origin=China&caffeineLevel=medium&minPrice=20&maxPrice=50&search=jasmine&page=1&limit=12&sortBy=price&sortOrder=asc
\`\`\`

**Available Filters:**
- `category`: black-tea, green-tea, herbal-tea, oolong-tea, white-tea, chai
- `collection`: premium, classic, organic, seasonal
- `origin`: Filter by country/region (case-insensitive)
- `caffeineLevel`: high, medium, low, none
- `minPrice` & `maxPrice`: Price range filtering
- `search`: Full-text search in name, description, and tags
- `page` & `limit`: Pagination (default: page=1, limit=12)
- `sortBy`: createdAt, price, name (default: createdAt)
- `sortOrder`: asc, desc (default: desc)

## 🔐 Authentication Flow

### Registration
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com", 
    "password": "securepassword123"
  }'
\`\`\`

### Login & Token Usage
\`\`\`bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'

# Use token for protected routes
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

## 📊 Database Models

### User Schema
\`\`\`javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  role: String (enum: ["customer", "admin"], default: "customer"),
  timestamps: true
}
\`\`\`

### Product Schema
\`\`\`javascript
{
  name: String (required, max 100 chars),
  description: String (required, max 500 chars),
  price: Number (required, min 0),
  image: String (required, URL),
  category: String (enum: tea categories, required),
  collection: String (enum: collections, default: "classic"),
  origin: String (required),
  caffeineLevel: String (enum: levels, default: "medium"),
  stock: Number (required, min 0, default: 0),
  isActive: Boolean (default: true),
  tags: [String],
  timestamps: true
}
\`\`\`

### Cart Schema
\`\`\`javascript
{
  user: ObjectId (required, unique, ref: "User"),
  items: [{
    product: ObjectId (required, ref: "Product"),
    quantity: Number (required, min 1),
    price: Number (required, min 0)
  }],
  totalAmount: Number (auto-calculated),
  timestamps: true
}
\`\`\`

## 🚀 Deployment

### Environment Variables for Production
\`\`\`env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tea-ecommerce
JWT_SECRET=super-secure-production-secret-min-32-characters
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
\`\`\`

### Deployment Platforms
- **Vercel**: Serverless deployment with MongoDB Atlas
- **Railway**: Full-stack deployment with built-in MongoDB
- **Render**: Web service deployment
- **Heroku**: Container-based deployment

### Pre-deployment Checklist
- [ ] Set secure JWT_SECRET (min 32 characters)
- [ ] Configure production MongoDB URI
- [ ] Set correct CORS_ORIGINS
- [ ] Enable NODE_ENV=production
- [ ] Test all endpoints in production environment

## 🧪 Testing Examples

### Using curl
\`\`\`bash
# Health check
curl http://localhost:5000/api/health

# Get products with filtering
curl "http://localhost:5000/api/products?category=green-tea&limit=5"

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Tea Lover","email":"tea@example.com","password":"password123"}'
\`\`\`

### Using JavaScript/Fetch
\`\`\`javascript
// Get products
const products = await fetch('http://localhost:5000/api/products?category=black-tea')
  .then(res => res.json());

// Add to cart (with auth)
const cartResponse = await fetch('http://localhost:5000/api/cart/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    productId: '507f1f77bcf86cd799439011',
    quantity: 2
  })
});
\`\`\`

## 🎯 Hackathon Requirements ✅

**Backend Requirements:**
- ✅ **Node.js + Express + MongoDB**: Complete tech stack implementation
- ✅ **Product APIs**: Full CRUD with advanced filtering and search
- ✅ **Cart APIs**: Complete cart management system
- ✅ **User Authentication**: JWT-based auth with registration/login
- ✅ **Input Validation**: Express-validator for all endpoints
- ✅ **Swagger Documentation**: Interactive API documentation
- ✅ **Dynamic Data**: All data served from MongoDB (no hardcoding)
- ✅ **Clean Architecture**: Organized folder structure with MVC pattern

**Additional Features:**
- ✅ **Security**: Password hashing, CORS, input sanitization
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **Database Indexing**: Optimized queries with text search
- ✅ **Pagination**: Efficient data loading
- ✅ **Sample Data**: 10 premium tea products with images
- ✅ **Health Monitoring**: API health check endpoint

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

---

**Ready for frontend integration!** 🎉

The backend provides a complete, production-ready API for your tea e-commerce frontend. All endpoints are documented, validated, and optimized for performance.
