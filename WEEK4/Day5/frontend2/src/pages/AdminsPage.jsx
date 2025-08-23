import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  useGetAdminsQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useUpdateRoleMutation,
} from "../services/usersApi";
import { Shield, Mail, UserX, UserCheck } from "lucide-react";

const AdminsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: admins = [], isLoading } = useGetAdminsQuery(undefined, {
    skip: !user || user.role !== "superadmin",
  });

  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();
  const [updateRole] = useUpdateRoleMutation();

  if (!user && !loading) navigate("/");
  if (loading || isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="animate-pulse text-gray-600">Loading admins...</p>
      </div>
    );

  const toggleBlock = async (adminId, blocked) => {
    if (blocked) await unblockUser(adminId);
    else await blockUser(adminId);
  };

  const revertToCustomer = async (adminId) => {
    await updateRole({ id: adminId, role: "customer" });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Shield className="w-8 h-8 text-green-600" /> Admins Management
      </h1>

      {admins.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border rounded-lg shadow-sm bg-white">
          <p>No admins found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {admins.map((a) => (
            <div
              key={a._id}
              className="bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between transition transform hover:-translate-y-1 hover:shadow-lg border border-gray-100"
            >
              <div>
                <div className="flex items-center gap-3">
                  <Shield className="w-10 h-10 text-green-500" />
                  <div>
                    <p className="font-semibold text-lg text-gray-800">{a.name}</p>
                    <p className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="w-4 h-4" /> {a.email}
                    </p>
                  </div>
                </div>
                <p
                  className={`mt-3 text-xs font-medium ${
                    a.blocked ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {a.blocked ? "🚫 Blocked" : "✅ Active"}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleBlock(a._id, a.blocked)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1
                    ${
                      a.blocked
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                >
                  {a.blocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                  {a.blocked ? "Unblock" : "Block"}
                </button>
                <button
                  onClick={() => revertToCustomer(a._id)}
                  className="flex-1 px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium transition"
                >
                  Revert
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminsPage;
