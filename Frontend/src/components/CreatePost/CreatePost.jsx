import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../Redux/postSlice.js";
import BottomNav from "../BottomNav/BottomNav.jsx";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.posts);
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    const res = await dispatch(createPost({ content: content.trim(), image: image || null }));
    if (!res.error) {
      navigate('/feed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Create Post</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <textarea
            className="w-full border rounded p-3 focus:outline-none"
            rows="4"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <input
            type="url"
            className="w-full border rounded p-2"
            placeholder="Optional image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
              {loading ? 'Posting…' : 'Post'}
            </button>
            <button type="button" className="px-4 py-2 border rounded" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default CreatePost;


