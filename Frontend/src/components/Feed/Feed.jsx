import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";
import { fetchPosts, toggleLike, addComment, deleteComment, editComment } from "../../Redux/postSlice.js";
import BottomNav from "../BottomNav/BottomNav.jsx";
import { GoCommentDiscussion } from "react-icons/go";
import { IoHeartCircleSharp, IoArrowUpCircle, IoTrashSharp, IoPencilSharp } from "react-icons/io5";

const userInfo = JSON.parse(localStorage.getItem("userInfo"));

const Feed = () => {
  const dispatch = useDispatch();
  const { items: posts, loading } = useSelector((state) => state.posts);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [modalText, setModalText] = useState("");
  const [swipeState, setSwipeState] = useState({}); // { [commentKey]: offsetPx }
  const [editing, setEditing] = useState(null); // { commentId, text }
  const [deletedComments, setDeletedComments] = useState({}); // optimistic hidden ids
  const [toast, setToast] = useState(null); // { message, type }

  const openPost = useMemo(() => posts.find(p => p._id === openCommentsPostId), [posts, openCommentsPostId]);

  // Toast function
  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000); // Auto dismiss after 4 seconds
  };

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  // Demo: briefly showcase swipe gestures on first comment when modal opens
  // useEffect(() => {
  //   if (!openPost || !openPost.comments || openPost.comments.length === 0) return;
  //   const key = openPost.comments[0]._id || openPost.comments[0].createdAt;
  //   let t1, t2, t3, t4;
  //   setSwipeState((s) => ({ ...s, [key]: 0 }));
  //   t1 = setTimeout(() => setSwipeState((s) => ({ ...s, [key]: 90 })), 200);
  //   t2 = setTimeout(() => setSwipeState((s) => ({ ...s, [key]: 0 })), 700);
  //   t3 = setTimeout(() => setSwipeState((s) => ({ ...s, [key]: -90 })), 1100);
  //   t4 = setTimeout(() => setSwipeState((s) => ({ ...s, [key]: 0 })), 1600);
  //   return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  // }, [openPost]);     

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
          {posts.map((post) => {
            const isLiked = (post.likes || []).some((id) => id === userInfo?._id);
            const likeCount = (post.likes || []).length;
            const commentCount = (post.comments || []).length;
            return (
              <div key={post._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-800">{post.userId?.name || "Unknown"}</div>
                  <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-gray-700 whitespace-pre-wrap">{post.content}</div>
                {post.image && (
                  <img src={post.image} alt="post" className="mt-3 rounded max-h-96 object-contain w-full" />
                )}
                <div className="mt-3 flex items-center gap-6 text-sm">
                  <button
                    className={`flex items-center gap-2 ${isLiked ? 'text-red-600' : 'text-gray-600'}`}
                    onClick={() => dispatch(toggleLike(post._id))}
                    aria-label="Like"
                  >
                    <IoHeartCircleSharp className="text-2xl" />
                    <span>{likeCount}</span>
                  </button>
                  <button
                    className="flex items-center gap-2 text-gray-600"
                    onClick={() => setOpenCommentsPostId(post._id)}
                    aria-label="Comments"
                  >
                    <GoCommentDiscussion className="text-2xl" />
                    <span>{commentCount}</span>
                  </button>
                </div>
                <form
                  className="mt-3 flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.elements[`c_${post._id}`];
                    const text = input.value.trim();
                    if (!text) return;
                    dispatch(addComment({ postId: post._id, text }));
                    input.value = '';
                  }}
                >
                </form>
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {post.comments.slice(0, 3).map((c) => (
                      <div key={c._id || c.createdAt} className="text-sm"><span className="font-medium">{c.userId?.name || 'User'}:</span> {c.text}</div>
                    ))}
                    {post.comments.length > 3 && (
                      <div className="text-xs text-gray-500">View all {post.comments.length} comments</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {openPost && (
        <div className="fixed inset-0 z-50 flex flex-col h-full">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenCommentsPostId(null)} />
          <div className="relative mt-auto bg-white rounded-t-2xl max-h-[85vh] w-full overflow-hidden flex flex-col">
            <div className="w-14 h-1.5 bg-gray-300 rounded mx-auto mt-3" />
            <div className="text-center font-medium text-base py-1">Comments</div>
            <div className="px-4 flex-1 overflow-y-auto">
              {(!openPost.comments || openPost.comments.length === 0) && (
                <div className="text-center text-gray-500 py-8">No comments yet</div>
              )}
              {openPost.comments && openPost.comments.filter(c => !deletedComments[c._id]).map((c) => {
                const key = c._id || c.createdAt;
                const offset = swipeState[key] || 0;
                return (
                  <div key={key} className="relative overflow-hidden select-none">
                    {/* Backgrounds for swipe gestures */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Blue edit bg */}
                      <div className="absolute inset-y-0 left-0 w-1/2 bg-blue-50 flex items-center pl-4">
                        <div className="flex items-center gap-2 text-blue-600 transition-transform" style={{ transform: `translateX(${Math.min(0, offset)}px)` }}>
                          {/* <IoPencilSharp className="text-2xl" /> */}
                          <span className="text-sm font-medium">Edit</span>
                        </div>
                      </div>
                      {/* Red delete bg */}
                      <div className="absolute inset-y-0 right-0 w-1/2 bg-red-100 flex items-center justify-end pr-4">
                        <div className="flex items-center gap-2 text-red-500 transition-transform" style={{ transform: `translateX(${Math.max(0, offset)}px)` }}>
                          <span className="text-sm font-medium">Delete</span>
                          {/* <IoTrashSharp className="text-2xl" /> */}
                        </div>
                      </div>
                    </div>
                    {/* Foreground comment that slides */}
                    <div
                      className="py-3 border-b border-gray-100 flex items-start bg-white relative"
                      style={{ transform: `translateX(${offset}px)`, transition: 'transform 0.15s ease-out' }}
                      onTouchStart={(e) => {
                        const startX = e.touches[0].clientX;
                        const startOffset = swipeState[key] || 0;
                        let currentDx = 0;
                        const move = (ev) => {
                          const dx = ev.touches[0].clientX - startX;
                          currentDx = dx;
                          let next = startOffset + dx;
                          next = Math.max(-140, Math.min(140, next));
                          setSwipeState((s) => ({ ...s, [key]: next }));
                        };
                        const end = () => {
                          const final = startOffset + currentDx;
                          if (final >= 90 && c._id) {
                            // swipe left -> right: delete (optimistic)
                            setDeletedComments((m) => ({ ...m, [c._id]: true }));

                            dispatch(deleteComment({
                              postId: openPost._id,
                              commentId: c._id
                            }))
                              .unwrap()
                              .then(() => {
                                // Success toast
                                showToast("Comment deleted", "success");
                              })
                              .catch((err) => {
                                console.error('Delete comment failed:', err);
                                const errorMessage = err?.message || err || 'Not authorized to delete this comment';
                                showToast(errorMessage, 'error');
                                // Revert optimistic update
                                setDeletedComments((m) => {
                                  const n = { ...m };
                                  delete n[c._id];
                                  return n;
                                });
                              });

                          } else if (final <= -90 && c._id) {
                            // swipe right -> left: edit
                            setEditing({ commentId: c._id, text: c.text });
                          }
                          setSwipeState((s) => ({ ...s, [key]: 0 }));
                          window.removeEventListener('touchmove', move);
                          window.removeEventListener('touchend', end);
                        };
                        window.addEventListener('touchmove', move, { passive: true });
                        window.addEventListener('touchend', end);
                      }}
                      onMouseDown={(e) => {
                        const startX = e.clientX;
                        const startOffset = swipeState[key] || 0;
                        let currentDx = 0;
                        const move = (ev) => {
                          const dx = ev.clientX - startX;
                          currentDx = dx;
                          let next = startOffset + dx;
                          next = Math.max(-140, Math.min(140, next));
                          setSwipeState((s) => ({ ...s, [key]: next }));
                        };
                        const end = () => {
                          const final = startOffset + currentDx;
                          if (final >= 90 && c._id) {
                            setDeletedComments((m) => ({ ...m, [c._id]: true }));
                            dispatch(deleteComment({
                              postId: openPost._id,
                              commentId: c._id
                            }))
                              .unwrap()
                              .then(() => {
                                // Success toast
                                showToast("Comment deleted", "success");
                              })
                              .catch((err) => {
                                console.error('Delete comment failed:', err);
                                const errorMessage = err?.message || err || 'Not authorized to delete this comment';
                                showToast(errorMessage, 'error');
                                // Revert optimistic update
                                setDeletedComments((m) => {
                                  const n = { ...m };
                                  delete n[c._id];
                                  return n;
                                });
                              });
                          } else if (final <= -90 && c._id) {
                            setEditing({ commentId: c._id, text: c.text });
                          }
                          setSwipeState((s) => ({ ...s, [key]: 0 }));
                          window.removeEventListener('mousemove', move);
                          window.removeEventListener('mouseup', end);
                        };
                        window.addEventListener('mousemove', move);
                        window.addEventListener('mouseup', end);
                      }}
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center font-semibold text-gray-600 text-sm flex-shrink-0">
                        {c.userId?.name ? c.userId.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{c.userId?.name || 'User'}</span>
                          <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {editing?.commentId === c._id ? (
                          <form
                            className="flex items-center gap-2 mt-1"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const t = editing.text.trim();
                              if (!t) return;
                              dispatch(editComment({ postId: openPost._id, commentId: c._id, text: t }))
                                .unwrap()
                                .then(() => {
                                  // Success toast for edit
                                  showToast("Comment updated", "success");
                                  setEditing(null);
                                })
                                .catch((err) => {
                                  console.error('Edit comment failed:', err);
                                  const errorMessage = err?.message || err || 'Not authorized to edit this comment';
                                  showToast(errorMessage, 'error');
                                });
                            }}
                          >
                            <input
                              className="flex-1 border rounded px-2 py-1 text-sm"
                              value={editing.text}
                              onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                              autoFocus
                            />
                            <button type="button" className="text-xs px-2 py-1" onClick={() => setEditing(null)}>Cancel</button>
                            <button type="submit" className="text-xs px-2 py-1 text-blue-600">Save</button>
                          </form>
                        ) : (
                          <div className="text-gray-900 text-sm mt-0.5 break-words">{c.text}</div>
                        )}
                        <div className="flex items-center gap-4 text-xs mt-1 text-gray-500">
                          <button className="hover:underline">Reply</button>
                          <span>See translation</span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-red-500 ml-2 flex items-center">
                        <IoHeartCircleSharp className="text-xl" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 pt-2 pb-1 flex gap-3 justify-between text-xl">
              {['❤️', '🙌', '🔥', '👏', '😆', '😮', '😢', '🤔'].map(e => (
                <button key={e}>{e}</button>
              ))}
            </div>
            <form
              className="border-t flex items-center gap-2 p-3 bg-white"
              onSubmit={(e) => {
                e.preventDefault();
                const text = modalText.trim();
                if (!text) return;
                dispatch(addComment({ postId: openPost._id, text }))
                  .unwrap()
                  .then(() => {
                    setModalText("");
                    showToast("Comment added", "success");
                  })
                  .catch((err) => {
                    console.error('Add comment failed:', err);
                    showToast("Failed to add comment", "error");
                  });
              }}
            >
              <button type="button" className="text-xl">😊</button>
              <input
                name="modalComment"
                type="text"
                placeholder="What do you think of this?"
                className="flex-1 border rounded px-3 py-2 text-sm"
                autoComplete="off"
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
              />
              {modalText && (
                <button type="button" className="px-2 py-2 text-sm text-gray-600" onClick={() => setModalText("")}>Cancel</button>
              )}
              <button type="submit" aria-label="Send" disabled={!modalText.trim()} className="disabled:opacity-50">
                <IoArrowUpCircle className={`text-3xl ${modalText.trim() ? 'text-blue-600' : 'text-gray-400'}`} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          backgroundColor: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#3b82f6',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {toast.message}
          <button 
            onClick={() => setToast(null)}
            style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'white' }}
          >
            ✕
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Feed;
