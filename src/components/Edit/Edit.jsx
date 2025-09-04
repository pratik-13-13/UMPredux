import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserById, updateUser } from "../../Redux/userSlice";
<<<<<<< HEAD
import { updateUserInList } from "../../Redux/umSlice";
=======
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
<<<<<<< HEAD
  const { userInfo, loading, error } = useSelector((state) => state.user);
  const [shouldNavigate, setShouldNavigate] = useState(false);
=======
  const { user, loading, error } = useSelector((state) => state.user);
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
<<<<<<< HEAD
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (userInfo && (userInfo.id === Number(id) || userInfo.id === id)) {
      setFormData({
        name: userInfo.name || "",
        email: userInfo.email || "",
      });
    }
  }, [userInfo, id]);

  // Handle navigation after successful user update
  useEffect(() => {
    if (shouldNavigate) {
      navigate("/");
    }
  }, [shouldNavigate, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await dispatch(updateUser({ id, updatedData: formData })).unwrap();
      // Update the user list in umSlice to keep it in sync
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
=======
    console.log("Fetching User ID:", id); // Debugging
    dispatch(fetchUserById(id)).then((res) => {
      console.log("API Response:", res);
    });
  }, [dispatch, id]);

  useEffect(() => {
    console.log("Fetched User:", user); // Debugging
    if (user && user.id) {
      setFormData({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUser({ id, updatedData: formData })).then(() => {
      alert("User updated successfully!");
      navigate("/");
    });
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Edit User</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter Name"
          className="w-full p-2 border border-gray-300 rounded"
<<<<<<< HEAD
            required
        />
        </div>
        <div>
=======
        />
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter Email"
          className="w-full p-2 border border-gray-300 rounded"
<<<<<<< HEAD
            required
        />
        </div>
        <div className="flex gap-2">
          <button 
            type="submit" 
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update User'}
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
=======
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Update User
        </button>
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
      </form>
    </div>
  );
};

export default EditUser;
