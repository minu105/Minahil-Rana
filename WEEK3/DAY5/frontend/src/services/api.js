import axios from "axios"

// Detect environment and set baseURL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || // ✅ use Vite env var if provided
  (process.env.NODE_ENV === "production"
    ? "https://week3-day5-hackathon-backend-minahi.vercel.app/" // replace with deployed backend URL
    : "http://localhost:3000/api") // fallback for local dev

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// ===== Products =====
export const fetchProducts = () => API.get("/products")
export const fetchProductById = (id) => API.get(`/products/${id}`)

// ===== Auth =====
export const register = (userData) => API.post("/auth/register", userData)
export const login = (credentials) => API.post("/auth/login", credentials)

// ===== Cart =====
export const fetchCart = () => API.get("/cart")
export const addToCart = (item) => API.post("/cart", item)
export const removeFromCart = (id) => API.delete(`/cart/${id}`)

export default API
