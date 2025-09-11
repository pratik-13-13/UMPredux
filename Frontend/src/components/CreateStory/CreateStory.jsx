import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStory } from "../../Redux/storySlice.js";
import { useNavigate } from "react-router-dom";
import { 
  IoClose, 
  IoCameraOutline, 
  IoImageOutline,
  IoSend 
} from "react-icons/io5";

const CreateStory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { creating, error } = useSelector((state) => state.stories);
  const { userInfo } = useSelector((state) => state.user);

  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [toast, setToast] = useState(null); // ✅ ADDED: Toast for feedback
  const fileInputRef = useRef(null);

  // ✅ ADDED: Toast helper function
  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    
    console.log('Selected file:', file); // Debug log
     
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for stories
        showToast('Image size must be less than 10MB', 'error');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      showToast('Please select an image for your story', 'error');
      return;
    }
    
    // ✅ ENHANCED: Debug logs for troubleshooting
    console.log('imageFile:', imageFile);
    console.log('imageFile type:', typeof imageFile);
    console.log('imageFile instanceof File:', imageFile instanceof File);
    console.log('imageFile size:', imageFile.size);
    console.log('imageFile name:', imageFile.name);

    try {
      const result = await dispatch(createStory({
        content: content.trim(),
        image: imageFile
      })).unwrap();
      
      console.log('Story created successfully:', result);
      showToast('Story created successfully!', 'success');
      
      // Navigate after a short delay to show success message
      setTimeout(() => navigate('/feed'), 1000);
      
    } catch (err) {
      console.error('Failed to create story:', err);
      showToast(err.message || 'Failed to create story. Please try again.', 'error');
    }
  };

  // Generate user avatar
  const generateAvatar = (user) => {
    if (!user) return { initials: 'U', color: 'from-gray-400 to-gray-500' };
    const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'U';
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600', 
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600'
    ];
    const colorIndex = user._id ? user._id.charCodeAt(user._id.length - 1) % colors.length : 0;
    return { initials, color: colors[colorIndex] };
  };

  const userAvatar = generateAvatar(userInfo);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-md z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="text-white p-2"
            disabled={creating}
          >
            <IoClose size={24} />
          </button>
          <h1 className="text-white font-semibold">Your Story</h1>
          <button 
            onClick={handleSubmit}
            disabled={creating || !imageFile}
            className="text-blue-400 font-semibold disabled:opacity-50 transition-opacity"
          >
            {creating ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-screen">
        {imagePreview ? (
          <div className="relative h-full">
            <img
              src={imagePreview}
              alt="Story preview"
              className="w-full h-full object-cover"
            />
            
            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <div className="mb-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a caption..."
                  className="w-full bg-transparent text-white placeholder-white/70 text-lg resize-none outline-none"
                  rows="3"
                  maxLength={200}
                />
                <div className="text-white/60 text-sm mt-1">
                  {content.length}/200 characters
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${userAvatar.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-semibold text-sm">
                    {userAvatar.initials}
                  </span>
                </div>
                <span className="text-white font-semibold">
                  {userInfo?.name || 'You'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
            <div className="text-white text-center">
              <h2 className="text-xl font-semibold mb-2">Create Your Story</h2>
              <p className="text-gray-300">Share a moment that disappears in 24 hours</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 text-white hover:bg-white/30 transition-colors"
              >
                <IoCameraOutline size={24} />
                <span>Camera</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 text-white hover:bg-white/30 transition-colors"
              >
                <IoImageOutline size={24} />
                <span>Gallery</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* ✅ ENHANCED: Toast Notifications */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium flex items-center space-x-2 ${
            toast.type === 'error' ? 'bg-red-500' : 
            toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
          }`}>
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <IoClose size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Legacy error display */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default CreateStory;
