import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../Store/Slices/userSlice.js";
import { fetchPosts } from "../../Store/Slices/postSlice.js";
import { getFollowers, getFollowing } from "../../Store/Slices/followSlice.js";
import BottomNav from "../../components/Layout/BottomNav/BottomNav.jsx";
import ProfileHeader from "./component/ProfileHeader.jsx";
import ProfileTabs from "./component/ProfileTabs.jsx";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);
  const { items: allPosts, loading: postsLoading } = useSelector((s) => s.posts);

  // Get fresh user data from localStorage to ensure updates
  const [storedUser, setStoredUser] = useState(() => {
    const user = localStorage.getItem("userInfo");
    return user ? JSON.parse(user) : null;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [formValues, setFormValues] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    password: "",
    confirmPassword: "",
  });

  // Add userStats state
  const [userStats, setUserStats] = useState({
    followersCount: 0,
    followingCount: 0,
    postsCount: 0
  });

  // Listen for localStorage changes (when user data updates)
  useEffect(() => {
    const handleStorageChange = () => {
      const user = localStorage.getItem("userInfo");
      if (user) {
        setStoredUser(JSON.parse(user));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  // FIX: Define userPosts BEFORE using it
  const userPosts = useMemo(() => {
    if (!allPosts || !storedUser?._id) return [];
    return allPosts.filter(p => (p.userId?._id || p.userId) === storedUser._id);
  }, [allPosts, storedUser?._id]);

  // FIX: Fetch user stats useEffect (moved after userPosts definition)
  useEffect(() => {
    const fetchUserStats = async () => {
      if (storedUser?._id) {
        try {
          // Fetch real followers and following counts
          const followersResult = await dispatch(getFollowers({ 
            userId: storedUser._id, 
            page: 1, 
            limit: 1 
          })).unwrap();
          
          const followingResult = await dispatch(getFollowing({ 
            userId: storedUser._id, 
            page: 1, 
            limit: 1 
          })).unwrap();

          setUserStats({
            followersCount: followersResult.totalCount || 0,
            followingCount: followingResult.totalCount || 0,
            postsCount: userPosts.length
          });
        } catch (error) {
          console.error('Failed to fetch user stats:', error);
          // Fallback to stored data
          setUserStats({
            followersCount: storedUser?.followers?.length || 0,
            followingCount: storedUser?.following?.length || 0,
            postsCount: userPosts.length
          });
        }
      }
    };

    // Only fetch if we have userPosts data
    if (userPosts.length >= 0) {
      fetchUserStats();
    }
  }, [dispatch, storedUser?._id, userPosts.length]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (formValues.password && formValues.password !== formValues.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const updatedData = {
      name: formValues.name,
      email: formValues.email,
      ...(formValues.password ? { password: formValues.password } : {}),
    };

    const result = await dispatch(updateUser({ id: storedUser._id, updatedData }));

    if (result.meta.requestStatus === "fulfilled") {
      const updatedUser = result.payload;
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setStoredUser(updatedUser);
      setIsEditing(false);
      alert("Profile updated successfully");
    } else {
      alert(result.payload || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <div className="max-w-4xl mx-auto">
        
        {/* Instagram-style Header with Dynamic Counts */}
        <ProfileHeader 
          user={storedUser}
          avatar={avatar}
          isEditing={isEditing}
          onEditClick={() => setIsEditing(true)}
          postsCount={userStats.postsCount}
          followersCount={userStats.followersCount}
          followingCount={userStats.followingCount}
        />

        {/* Edit Form */}
        {isEditing && (
          <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
            <form onSubmit={onSubmit} className="max-w-md space-y-3">
              <input type="text" name="name" placeholder="Full Name" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formValues.name} onChange={onChange} required />
              <input type="email" name="email" placeholder="Email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formValues.email} onChange={onChange} required />
              <input type="password" name="password" placeholder="New Password (optional)" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formValues.password} onChange={onChange} />
              <input type="password" name="confirmPassword" placeholder="Confirm Password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formValues.confirmPassword} onChange={onChange} />
              <div className="flex gap-3">
                <button type="submit" className={`flex-1 py-3 rounded-lg text-white font-medium ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} transition-colors`} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => { setIsEditing(false); setFormValues({ name: storedUser.name, email: storedUser.email, password: "", confirmPassword: "" }); }} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Tabs */}
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-0.5 bg-white">
          {activeTab === 'posts' && (
            <>
              {(postsLoading && userPosts.length === 0) && (
                <div className="col-span-3 flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              {!postsLoading && userPosts.length === 0 && (
                <div className="col-span-3 flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg font-light">No posts yet</p>
                </div>
              )}
              {userPosts.map((post) => (
                <div key={post._id} className="relative aspect-square bg-gray-100 group cursor-pointer">
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt="post" 
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 p-2 text-center bg-gray-100">
                      {post.content}
                    </div>
                  )}
                  
                  {/* Multiple photos indicator */}
                  {post.images && post.images.length > 1 && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-5 h-5 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17l2.5-3.21L14 17H9zm3.5-4.5L14 14h5l-2.5-3.5-1.5 2z"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Hover overlay with stats */}
                  <div className="absolute inset-0 bg-black bg-opacity-25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center space-x-6 text-white">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span className="font-semibold">{post.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-semibold">{post.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
          {activeTab === 'tagged' && (
            <div className="col-span-3 flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-light">No tagged posts yet</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="px-4 py-6 border-t border-gray-200 mt-8">
          <button 
            onClick={() => { 
              localStorage.removeItem("userInfo"); 
              localStorage.removeItem("authToken"); 
              navigate("/login"); 
            }} 
            className="w-full bg-red-50 text-red-600 py-3 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200"
          >
            Logout
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
