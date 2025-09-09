import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";
import { fetchPosts } from "../../Redux/postSlice.js";
import BottomNav from "../BottomNav/BottomNav.jsx";

const userInfo = JSON.parse(localStorage.getItem("userInfo"));

const Feed = () => {
  const dispatch = useDispatch();
  const { items: posts, loading } = useSelector((state) => state.posts);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-400 pb-20 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Feed List */}
        <div className="space-y-4">
          {loading && posts.length === 0 && (
            <div className="text-center text-gray-500">Loading feed...</div>
          )}
          {!loading && posts.length === 0 && (
            <div className="text-center text-gray-500">No posts yet</div>
          )}
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-800">{post.userId?.name || "Unknown"}</div>
                <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">{post.content}</div>
              {post.image && (
                <img src={post.image} alt="post" className="mt-3 rounded max-h-96 object-contain w-full" />
              )}
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Feed;



