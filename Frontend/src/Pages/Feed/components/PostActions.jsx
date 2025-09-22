import React from "react";
import { 
  IoHeartOutline, 
  IoHeart, 
  IoChatbubbleOutline, 
  IoPaperPlaneOutline,
  IoBookmarkOutline 
} from "react-icons/io5";

const PostActions = ({ 
  post, 
  userInfo, 
  dispatch, 
  toggleLike, 
  setOpenCommentsPostId, 
  token 
}) => {
  const isLiked = (post.likes || []).some((id) => id === userInfo?._id);
  
  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => dispatch(toggleLike(post._id))}
            className="transition-transform active:scale-125"
            disabled={!token}
          >
            {isLiked ? (
              <IoHeart size={24} className="text-red-500" />
            ) : (
              <IoHeartOutline size={24} className="text-gray-900" />
            )}
          </button>
          <button onClick={() => setOpenCommentsPostId(post._id)}>
            <IoChatbubbleOutline size={24} className="text-gray-900" />
          </button>
          <button>
            <IoPaperPlaneOutline size={24} className="text-gray-900" />
          </button>
        </div>
        <button>
          <IoBookmarkOutline size={24} className="text-gray-900" />
        </button>
      </div>
    </div>
  );
};

export default PostActions;
