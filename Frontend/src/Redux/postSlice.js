import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://api-umpredux.onrender.com/api/posts";

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(API_URL);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async ({ content, image }, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token;
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const res = await axios.post(API_URL, { content, image }, config);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const toggleLike = createAsyncThunk(
  "posts/toggleLike",
  async (postId, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token;
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const res = await axios.post(`${API_URL}/${postId}/like`, {}, config);
      return res.data; // updated post
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, text }, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token;
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const res = await axios.post(`${API_URL}/${postId}/comments`, { text }, config);
      return res.data; // updated post with new comment
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  "posts/deleteComment",
  async ({ postId, commentId }, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token;
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const res = await axios.delete(`${API_URL}/${postId}/comments/${commentId}`, config);
      return res.data; // updated post
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const editComment = createAsyncThunk(
  "posts/editComment",
  async ({ postId, commentId, text }, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token;
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const res = await axios.put(`${API_URL}/${postId}/comments/${commentId}`, { text }, config);
      return res.data; // updated post
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((p) => p._id === updated._id);
        if (idx !== -1) state.items[idx] = updated;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((p) => p._id === updated._id);
        if (idx !== -1) state.items[idx] = updated;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((p) => p._id === updated._id);
        if (idx !== -1) state.items[idx] = updated;
      })
      .addCase(editComment.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((p) => p._id === updated._id);
        if (idx !== -1) state.items[idx] = updated;
      });
  },
});

export default postSlice.reducer;


