# Tea E-commerce Frontend

This is the React frontend for the tea e-commerce website built for the hackathon.

## Features

- **Landing Page** - Hero section with featured collections
- **Collections Page** - Product listing with advanced filtering
- **Product Detail Page** - Complete product information with variants
- **Shopping Cart** - Add/remove items, quantity management
- **User Authentication** - Login/Register with JWT
- **Responsive Design** - Mobile-first approach with Tailwind CSS

## Tech Stack

- React 18
- React Router DOM
- Tailwind CSS
- Axios for API calls
- Context API for state management

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Update the API URL in `.env`:
\`\`\`
REACT_APP_API_URL=http://localhost:5000/api
\`\`\`

4. Start the development server:
\`\`\`bash
npm start
\`\`\`

The app will be available at `http://localhost:3000`

## Project Structure

\`\`\`
src/
├── components/          # Reusable components
│   ├── Navbar.js
│   ├── Footer.js
│   └── CartPopup.js
├── context/            # React Context providers
│   ├── AuthContext.js
│   └── CartContext.js
├── pages/              # Page components
│   ├── LandingPage.js
│   ├── CollectionsPage.js
│   ├── ProductPage.js
│   ├── CartPage.js
│   ├── LoginPage.js
│   └── RegisterPage.js
├── App.js              # Main app component
└── index.js            # Entry point
\`\`\`

## API Integration

The frontend integrates with the Node.js backend through:

- **Authentication**: Login/Register with JWT tokens
- **Products**: Fetch products, collections, and individual product details
- **Cart**: Add/remove items, update quantities (requires authentication)

## Deployment

Build the project for production:

\`\`\`bash
npm run build
\`\`\`

The build folder can be deployed to any static hosting service like Vercel, Netlify, or AWS S3.

## Environment Variables

- `REACT_APP_API_URL` - Backend API base URL
