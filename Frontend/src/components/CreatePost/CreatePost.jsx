import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../Redux/postSlice.js";
import BottomNav from "../BottomNav/BottomNav.jsx";
import { useNavigate } from "react-router-dom";
import { 
  IoImageOutline, 
  IoCloseOutline, 
  IoCameraOutline,
  IoArrowBack,
  IoLocationOutline,
  IoHappyOutline  
} from "react-icons/io5";

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { creating, error } = useSelector((state) => state.posts);

  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const maxChars = 500;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleContentChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setContent(text);
      setCharCount(text.length);
      
      // Auto-expand textarea
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      
      if (!isExpanded && text.length > 0) {
        setIsExpanded(true);
      }
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setImageFile(file);
      setImageUrl('');
      setShowImageOptions(false);
      
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url) => {
    setImageUrl(url);
    setImageFile(null);
    setImagePreview(url);
    setShowImageOptions(false);
  };

  const removeImage = () => {
    setImageFile(null);
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    const postData = {
      content: content.trim(),
      image: imageFile || imageUrl || null
    };

    try {
      const res = await dispatch(createPost(postData));
      if (!res.error) {
        setContent('');
        setImageFile(null);
        setImageUrl('');
        setImagePreview('');
        setCharCount(0);
        setIsExpanded(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={creating}
            >
              <IoArrowBack size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Create Post</h1>
          </div>
          <button 
            type="submit" 
            form="post-form"
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105" 
            disabled={creating || !content.trim()}
          >
            {creating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Posting...</span>
              </div>
            ) : (
              'Share'
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4 pb-24">
        <form id="post-form" onSubmit={handleSubmit} className="space-y-4">
          
          {/* Main Post Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* User Info Section (you can customize this) */}
            <div className="p-4 border-b border-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">U</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">You</p>
                  <p className="text-xs text-gray-500">Posting publicly</p>
                </div>
              </div>
            </div>

            {/* Content Input */}
            <div className="p-4">
              <textarea
                ref={textareaRef}
                className="w-full border-none resize-none focus:outline-none text-lg placeholder-gray-400 leading-relaxed"
                placeholder="What's on your mind?"
                value={content}
                onChange={handleContentChange}
                rows="3"
                style={{ minHeight: '80px' }}
                required
              />
              
              {/* Character Counter */}
              <div className={`text-right text-sm mt-2 transition-colors ${
                charCount > maxChars * 0.8 ? 'text-orange-500' : 'text-gray-400'
              }`}>
                {charCount}/{maxChars}
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="px-4 pb-4">
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-80 object-cover rounded-xl border border-gray-200"
                    onError={() => {
                      setImagePreview('');
                      alert('Failed to load image. Please check the URL.');
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <IoCloseOutline size={18} />
                  </button>
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors rounded-xl"></div>
                </div>
              </div>
            )}

            {/* Image Options Panel */}
            {showImageOptions && (
              <div className="px-4 pb-4 space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-medium text-gray-700">Add an image</h3>
                  
                  {/* Upload Option */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-3 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-center space-x-2 text-gray-500 group-hover:text-blue-500">
                      <IoCameraOutline size={24} />
                      <span>Upload from device</span>
                    </div>
                  </button>
                  
                  {/* URL Option */}
                  <input
                    type="url"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Or paste image URL here..."
                    value={imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowImageOptions(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowImageOptions(!showImageOptions)}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      showImageOptions || imagePreview 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <IoImageOutline size={20} />
                  </button>
                  
                  <button
                    type="button"
                    className="p-3 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
                  >
                    <IoHappyOutline   size={20} />
                  </button>
                  
                  <button
                    type="button"
                    className="p-3 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
                  >
                    <IoLocationOutline size={20} />
                  </button>
                </div>
                
                <span className="text-sm text-gray-500">
                  {content.trim() ? '✨ Ready to share!' : 'Start typing...'}
                </span>
              </div>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </form>
      </div>

      <BottomNav />
    </div>
  );
};

export default CreatePost;
