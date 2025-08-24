import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Users, Shield } from "lucide-react" 

const UsersLandingPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    if (user.role === "admin") {
      navigate("/users/customers")
    }
  }, [user, navigate])

  const goToCustomers = () => navigate("/users/customers")
  const goToAdmins = () => navigate("/users/admins")

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      {user?.role === "superadmin" && (
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl w-full">
          
          {/* Customers Card */}
          <button
            onClick={goToCustomers}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-100"
          >
            <Users className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Customers</h2>
            <p className="text-sm text-gray-500 mt-1">Manage all registered customers</p>
          </button>

          {/* Admins Card */}
          <button
            onClick={goToAdmins}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-100"
          >
            <Shield className="w-12 h-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Admins</h2>
            <p className="text-sm text-gray-500 mt-1">View and manage admin accounts</p>
          </button>
        </div>
      )}
    </div>
  )
}

export default UsersLandingPage
