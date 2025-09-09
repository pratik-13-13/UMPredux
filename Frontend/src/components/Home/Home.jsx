import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, deleteUser } from "../../Redux/userSlice";
import { FiEdit, FiTrash2, FiPlus, FiLogOut, FiSearch, FiUser } from "react-icons/fi";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users = [], loading, error } = useSelector((state) => state.user || {});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!token) {
      navigate("/login");
    } else if (!userInfo || userInfo.role !== "admin") {
      navigate("/profile"); // non-admin users redirected
    } else if (!users.length) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, navigate, users.length]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-500 text-center p-4">
          <p>Error loading users. Please try again.</p>
          <button
            onClick={() => dispatch(fetchAllUsers())}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <div className="flex items-center space-x-4">
            <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-gray-800">
              <FiLogOut className="mr-1" /> Logout
            </button>
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-15 w-5 text-gray-400" />
            </div>

           

            <input
              type="text"
              placeholder="Search users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link
            to="/addUser"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="mr-2 h-4 w-4" /> Add New User
          </Link>
        </div>
        {/* Professional User List Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow mt-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <Link to={`/edit/${user._id}`} className="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 rounded">
                        <FiEdit className="mr-1" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800 bg-red-50 rounded"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                      <Link to={`/profile/${user._id}`} className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-50 rounded">
                        <FiUser className="mr-1" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>



      </main>
    </div>
  );
};

export default Home;
