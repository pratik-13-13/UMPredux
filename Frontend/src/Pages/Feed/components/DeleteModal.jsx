import React from "react";


//import "../../../Styles"


const DeleteModal = ({ 
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleDeletePost,
  deleting
}) => {
  if (!showDeleteConfirm) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Delete post?</h3>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 text-center">
          <p className="text-gray-500 text-sm leading-relaxed">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
        </div>
        
        {/* Actions - Instagram style vertical buttons */}
        <div className="border-t border-gray-100">
          <button
            onClick={() => handleDeletePost(showDeleteConfirm)}
            disabled={deleting}
            className="w-full px-6 py-4 text-red-500 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(null)}
            className="w-full px-6 py-4 text-gray-900 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
