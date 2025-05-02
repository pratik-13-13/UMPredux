import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser } from "../../Redux/umSlice.js";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetching user list from Redux store
  const { userList = [], loading, error } = useSelector((state) => state.um || {});

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
    navigate("/login");
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Dashboard Card */}
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Portal</h2>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
          <Link
            to="/addUser"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Add User
          </Link>
        </div>
        
      </div>

      {/* User List */}
      <div className="mt-8 w-full max-w-2xl">
        <h3 className="text-2xl font-bold text-gray-800 mb-5">User List</h3>

        {/* Loading and Error Messages */}
        {loading && <p className="text-gray-500 text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {userList.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No users found</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {userList.map((user) => (
                <li key={user.id} className="flex items-center gap-6 p-4 hover:bg-gray-100 transition">
                  {/* User Image Placeholder */}
                  <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">📷</span>
                  </div>

                  {/* User Details */}
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">{user.name || "Unnamed User"}</p>
                    <p className="text-sm text-gray-500">{user.email || "No email provided"}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      to={`/edit/${user.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
