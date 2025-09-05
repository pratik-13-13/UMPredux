import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser } from "../../Redux/umSlice.js";
import { FiEdit, FiTrash2, FiPlus, FiLogOut, FiSearch, FiUser } from "react-icons/fi";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userList = [], loading, error } = useSelector((state) => state.um || {});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    } else if (!userList.length) {
      dispatch(fetchUsers());
    }
  }, [dispatch, navigate, userList.length]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
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

  const filteredUsers = userList.filter(
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
            onClick={() => dispatch(fetchUsers())}
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
              <FiSearch className="h-5 w-5 text-gray-400" />
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

        <div className="bg-white shadow overflow-hidden rounded-lg">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <FiUser className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Try a different search term." : "Get started by adding a new user."}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Link
                    to="/addUser"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiPlus className="mr-2 h-4 w-4" /> Add User
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <li key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name || "Unnamed User"}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email || "No email provided"}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link to={`/edit/${user.id}`} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50" title="Edit">
                        <FiEdit className="h-5 w-5" />
                      </Link>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50" title="Delete">
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;


