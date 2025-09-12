import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../Store/Slices/userSlice.js";
import { fetchPosts } from "../../Store/Slices/postSlice.js";
import BottomNav from "../../components/Layout/BottomNav/BottomNav.jsx";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);
  const { items: allPosts, loading: postsLoading } = useSelector((s) => s.posts);

  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("userInfo")),
    []
  );

  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    password: "",
    confirmPassword: "",
  });

  // If not logged in, redirect to login
  if (!storedUser) {
    navigate("/login");
    return null;
  }

  // Generate avatar fallback
  const avatar = storedUser?.name?.charAt(0).toUpperCase() || "U";

  // Load posts for counts/grid
  useEffect(() => {
    if (!allPosts || allPosts.length === 0) {
      dispatch(fetchPosts());
    }
  }, [allPosts, dispatch]);

  const userPosts = (allPosts || []).filter(p => (p.userId?._id || p.userId) === storedUser._id);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Password validation
    if (formValues.password && formValues.password !== formValues.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const updatedData = {
      name: formValues.name,
      email: formValues.email,
      ...(formValues.password ? { password: formValues.password } : {}),
    };

    const result = await dispatch(
      updateUser({ id: storedUser._id, updatedData })
    );

    if (result.meta.requestStatus === "fulfilled") {
      const updatedUser = result.payload;
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setIsEditing(false);
      alert("Profile updated successfully");
    } else {
      alert(result.payload || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-4">
      <div className="w-full max-w-3xl mx-auto">
        {/* Top Section */}
        <div className="flex items-center gap-4 pt-6">
          <div className="w-20 h-20 rounded-full bg-white border flex items-center justify-center text-indigo-600 text-3xl font-bold">
            {avatar}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{storedUser.name}</h2>
            <p className="text-sm text-gray-500">{storedUser.email}</p>
            <div className="flex gap-6 mt-2 text-sm">
              <span className="font-semibold">{userPosts.length}</span>
              <span className="text-gray-500">posts</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Edit profile
            </button>
          ) : null}
          <Link to="/create" className="px-4 py-2 border rounded-lg">New Post</Link>
        </div>

        {/* About */}
        <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">About section coming soon.</div>

        {/* Edit form */}
        {isEditing ? (
          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 text-left max-w-md">
            <input type="text" name="name" placeholder="Full Name" className="p-2 border rounded-lg" value={formValues.name} onChange={onChange} required />
            <input type="email" name="email" placeholder="Email" className="p-2 border rounded-lg" value={formValues.email} onChange={onChange} required />
            <input type="password" name="password" placeholder="New Password (optional)" className="p-2 border rounded-lg" value={formValues.password} onChange={onChange} />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" className="p-2 border rounded-lg" value={formValues.confirmPassword} onChange={onChange} />
            <div className="flex gap-2">
              <button type="submit" className={`flex-1 py-2 rounded-lg text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600"}`} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
              <button type="button" onClick={() => { setIsEditing(false); setFormValues({ name: storedUser.name, email: storedUser.email, password: "", confirmPassword: "" }); }} className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition">Cancel</button>
            </div>
          </form>
        ) : null}

        {/* Grid of user's posts */}
        <div className="mt-6 grid grid-cols-3 gap-1">
          {(postsLoading && userPosts.length === 0) && (
            <div className="col-span-3 text-center text-gray-500 py-6">Loading posts…</div>
          )}
          {!postsLoading && userPosts.length === 0 && (
            <div className="col-span-3 text-center text-gray-500 py-6">No posts yet</div>
          )}
          {userPosts.map((p) => (
            <div key={p._id} className="aspect-square bg-gray-100 overflow-hidden">
              {p.image ? (
                <img src={p.image} alt="post" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 p-2 text-center">{p.content}</div>
              )}
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="mt-6">
          <button onClick={() => { localStorage.removeItem("userInfo"); localStorage.removeItem("authToken"); navigate("/login"); }} className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition">Logout</button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
