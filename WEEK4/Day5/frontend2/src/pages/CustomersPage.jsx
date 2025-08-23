import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  useGetCustomersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useUpdateRoleMutation,
} from "../services/usersApi";
import { Users, Mail, UserX, UserCheck, Shield } from "lucide-react";

const CustomersPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: customers = [], isLoading } = useGetCustomersQuery(undefined, {
    skip: !user,
  });

  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();
  const [updateRole] = useUpdateRoleMutation();

  if (!user && !loading) navigate("/");
  if (loading || isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="animate-pulse text-gray-600">Loading customers...</p>
      </div>
    );

  const toggleBlock = async (customerId, blocked) => {
    if (blocked) await unblockUser(customerId);
    else await blockUser(customerId);
  };

  const promoteToAdmin = async (customerId) => {
    await updateRole({ id: customerId, role: "admin" });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Users className="w-8 h-8 text-blue-600" /> Customers Management
      </h1>

      {customers.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border rounded-lg shadow-sm bg-white">
          <p>No customers found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <div
              key={c._id}
              className="bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between transition transform hover:-translate-y-1 hover:shadow-lg border border-gray-100"
            >
              <div>
                <div className="flex items-center gap-3">
                  <Users className="w-10 h-10 text-blue-500" />
                  <div>
                    <p className="font-semibold text-lg text-gray-800">{c.name}</p>
                    <p className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="w-4 h-4" /> {c.email}
                    </p>
                  </div>
                </div>
                <p
                  className={`mt-3 text-xs font-medium ${
                    c.blocked ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {c.blocked ? "🚫 Blocked" : "✅ Active"}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleBlock(c._id, c.blocked)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1
                    ${
                      c.blocked
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                >
                  {c.blocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                  {c.blocked ? "Unblock" : "Block"}
                </button>
                <button
                  onClick={() => promoteToAdmin(c._id)}
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition flex items-center justify-center gap-1"
                >
                  <Shield className="w-4 h-4" /> Promote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
