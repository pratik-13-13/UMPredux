import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../Redux/postSlice.js";
import BottomNav from "../BottomNav/BottomNav.jsx";
import { useNavigate } from "react-router-dom";
import { IoImageOutline, IoCloseOutline, IoCameraOutline } from "react-icons/io5";

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { creating, error } = useSelector((state) => state.posts);

  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState('upload'); // 'upload' or 'url'
  
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setImageFile(file);
      setImageUrl(''); // Clear URL input
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url) => {
    setImageUrl(url);
    setImageFile(null); // Clear file input
    setImagePreview(url);
  };

  const removeImage = () => {
    setImageFile(null);
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
// In your CreatePost component, in the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!content.trim()) return;
  
  const postData = {
    content: content.trim(),
    image: imageFile || imageUrl || null  // File takes priority, then URL
  };

  try {
    const res = await dispatch(createPost(postData));
    if (!res.error) {
      // Reset form and navigate
      setContent('');
      setImageFile(null);
      setImageUrl('');
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      navigate('/feed');
    }
  } catch (err) {
    console.error('Failed to create post:', err);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Create Post</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          
          {/* Content Input */}
          <textarea
            className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          {/* Image Mode Toggle */}
          <div className="flex space-x-3 mb-4">
            <button
              type="button"
              onClick={() => setImageMode('upload')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                imageMode === 'upload' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <IoCameraOutline />
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                imageMode === 'url' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <IoImageOutline />
              Image URL
            </button>
          </div>

          {/* Image Upload */}
          {imageMode === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max size: 5MB. Supported formats: JPG, PNG, GIF, WebP
              </p>
            </div>
          )}

          {/* Image URL Input */}
          {imageMode === 'url' && (
            <input
              type="url"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste image URL here..."
              value={imageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
            />
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-64 object-contain rounded-lg border"
                  onError={() => {
                    setImagePreview('');
                    alert('Failed to load image. Please check the URL.');
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <IoCloseOutline size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
              disabled={creating || !content.trim()}
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
            <button 
              type="button" 
              className="px-4 py-2 border rounded hover:bg-gray-50" 
              onClick={() => navigate(-1)}
              disabled={creating}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default CreatePost;
