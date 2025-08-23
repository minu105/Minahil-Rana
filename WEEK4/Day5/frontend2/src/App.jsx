import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ThemeProvider"
import { AuthProvider } from "./context/AuthContext.jsx"
import { CartProvider } from "./context/CartContext.jsx"
import Navbar from "./components/Navbar.jsx"
import LandingPage from "./pages/LandingPage.jsx"
import CollectionsPage from "./pages/CollectionsPage.jsx"
import ProductPage from "./pages/ProductPage.jsx"
import CartPage from "./pages/CartPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import RegisterPage from "./pages/RegisterPage.jsx"
import UserLandingPage from "./pages/UsersLandingPage.jsx"
import CustomersPage from "./pages/CustomersPage.jsx"
import AdminsPage from "./pages/AdminsPage.jsx"
import Footer from "./components/Footer.jsx"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="tea-app-theme">
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/collections" element={<CollectionsPage />} />
                  <Route path="/collections/:category" element={<CollectionsPage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/users" element={<UserLandingPage />} />
                  <Route path="/users/customers" element={<CustomersPage />} />
                  <Route path="/users/admins" element={<AdminsPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
