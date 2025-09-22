import React from "react";
import { IoClose } from "react-icons/io5";

const Toast = ({ 
  toast,
  setToast
}) => {
  if (!toast) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
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
  );
};

export default Toast;
