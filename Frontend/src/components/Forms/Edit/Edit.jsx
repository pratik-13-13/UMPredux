import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserById, updateUser,updateUserInList } from "../../../Store/Slices/userSlice";
//import { updateUserInList } from "../../../Redux/userSlice";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.user);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Fetch user by ID
  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id]);

  // Prefill form when userInfo is available
  useEffect(() => {
    if (userInfo && (userInfo._id === id || userInfo.id === id || String(userInfo.id) === id)) {
      setFormData({
        name: userInfo.name || "",
        email: userInfo.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [userInfo, id]);

  // Handle navigation after successful update
  useEffect(() => {
    if (shouldNavigate) {
      navigate("/");
    }
  }, [shouldNavigate, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const updatedUser = await dispatch(
        updateUser({
          id,
          updatedData: {
            name: formData.name,
            email: formData.email,
            ...(formData.password ? { password: formData.password } : {}),
          },
        })
      ).unwrap();

      // Sync with umSlice
      dispatch(updateUserInList(updatedUser));

      console.log("User updated successfully!");
      setShouldNavigate(true);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Edit User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Name"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New Password"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm New Password"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update "}
          </button>
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            disabled={loading}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
