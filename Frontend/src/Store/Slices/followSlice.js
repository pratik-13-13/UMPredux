import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = "https://api-umpredux.onrender.com/api/follow";
//const API_URL = 'http://localhost:5000/api/follow';

// Get token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Follow a user (existing - keep as is)
export const followUser = createAsyncThunk(
  'follow/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.post(
        `${API_URL}/follow/${userId}`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      return { userId, ...response.data };
    } catch (error) {
      console.error('Follow user error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
    }
  }
);

// Unfollow a user (existing - keep as is)
export const unfollowUser = createAsyncThunk(
  'follow/unfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.delete(
        `${API_URL}/unfollow/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { userId, ...response.data };
    } catch (error) {
      console.error('Unfollow user error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
    }
  }
);

// Send follow request

// NEW: Send follow request (UPDATED)
export const sendFollowRequest = createAsyncThunk(
  'follow/sendFollowRequest',
  async (userId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      // Use /request/ endpoint instead of /follow/
      const response = await axios.post(
        `${API_URL}/request/${userId}`,  // This should send request
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return { userId, ...response.data };
    } catch (error) {
      console.error('Send follow request error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to send follow request');
    }
  }
);


// NEW: Accept follow request
export const acceptFollowRequest = createAsyncThunk(
  'follow/acceptFollowRequest',
  async (userId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.post(
        `${API_URL}/accept/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return { userId, ...response.data };
    } catch (error) {
      console.error('Accept follow request error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to accept follow request');
    }
  }
);

// NEW: Reject follow request
export const rejectFollowRequest = createAsyncThunk(
  'follow/rejectFollowRequest',
  async (userId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.post(
        `${API_URL}/reject/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return { userId, ...response.data };
    } catch (error) {
      console.error('Reject follow request error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to reject follow request');
    }
  }
);

// NEW: Cancel follow request
export const cancelFollowRequest = createAsyncThunk(
  'follow/cancelFollowRequest',
  async (userId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      await axios.delete(
        `${API_URL}/cancel/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return userId;
    } catch (error) {
      console.error('Cancel follow request error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel follow request');
    }
  }
);

// NEW: Get follow requests
export const getFollowRequests = createAsyncThunk(
  'follow/getFollowRequests',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get(
        `${API_URL}/requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data.requests;
    } catch (error) {
      console.error('Get follow requests error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to get follow requests');
    }
  }
);

// Get follow suggestions (existing - keep as is)
export const getFollowSuggestions = createAsyncThunk(
  'follow/getFollowSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get(
        `${API_URL}/suggestions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.suggestions;
    } catch (error) {
      console.error('Get suggestions error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to get suggestions');
    }
  }
);

// Get followers list (existing - keep as is)
export const getFollowers = createAsyncThunk(
  'follow/getFollowers',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get(
        `${API_URL}/followers/${userId}?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Get followers error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to get followers');
    }
  }
);

// Get following list (existing - keep as is)
export const getFollowing = createAsyncThunk(
  'follow/getFollowing',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get(
        `${API_URL}/following/${userId}?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Get following error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to get following');
    }
  }
);

// Check follow status (existing - keep as is)
export const checkFollowStatus = createAsyncThunk(
  'follow/checkFollowStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get(
        `${API_URL}/status/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { userId, ...response.data };
    } catch (error) {
      console.error('Check follow status error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to check status');
    }
  }
);

// NEW: Get follow status for follow requests
export const getFollowStatus = createAsyncThunk(
  'follow/getFollowStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await axios.get(
        `${API_URL}/status/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { userId, status: response.data.status };
    } catch (error) {
      console.error('Get follow status error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to get status');
    }
  }
);

const followSlice = createSlice({
  name: 'follow',
  initialState: {
    // Existing state
    suggestions: [],
    followers: {
      list: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
    },
    following: {
      list: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
    },
    followStatus: {},
    loading: false,
    error: null,
    followLoading: {},
    
    // NEW: Follow request state
    followRequests: [],
    followStatuses: {}, // userId -> status (follow, requested, following)
    requestsLoading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearFollowData: (state) => {
      state.followers = { list: [], totalCount: 0, currentPage: 1, totalPages: 1 };
      state.following = { list: [], totalCount: 0, currentPage: 1, totalPages: 1 };
    },
    // NEW: Update follow status
    updateFollowStatus: (state, action) => {
      const { userId, status } = action.payload;
      state.followStatuses[userId] = status;
    },
  },
  extraReducers: (builder) => {
    builder
      // Follow User (existing - keep as is)
      .addCase(followUser.pending, (state, action) => {
        state.followLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.followLoading[userId] = false;
        state.followStatus[userId] = { isFollowing: true, isFollowedBy: false };
        state.followStatuses[userId] = 'following';
        state.suggestions = state.suggestions.filter(user => user._id !== userId);
      })
      .addCase(followUser.rejected, (state, action) => {
        const userId = action.meta.arg;
        state.followLoading[userId] = false;
        state.error = action.payload;
      })
      
      // Unfollow User (existing - keep as is)
      .addCase(unfollowUser.pending, (state, action) => {
        state.followLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.followLoading[userId] = false;
        if (state.followStatus[userId]) {
          state.followStatus[userId].isFollowing = false;
        }
        state.followStatuses[userId] = 'follow';
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        const userId = action.meta.arg;
        state.followLoading[userId] = false;
        state.error = action.payload;
      })
      
      // NEW: Send follow request
      .addCase(sendFollowRequest.pending, (state, action) => {
        state.followLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(sendFollowRequest.fulfilled, (state, action) => {
        const { userId, status } = action.payload;
        state.followLoading[userId] = false;
        state.followStatuses[userId] = status;
      })
      .addCase(sendFollowRequest.rejected, (state, action) => {
        const userId = action.meta.arg;
        state.followLoading[userId] = false;
        state.error = action.payload;
      })
      
      // NEW: Accept follow request
      .addCase(acceptFollowRequest.pending, (state) => {
        state.requestsLoading = true;
      })
      .addCase(acceptFollowRequest.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.followRequests = state.followRequests.filter(
          req => req.user._id !== action.payload.userId
        );
      })
      .addCase(acceptFollowRequest.rejected, (state, action) => {
        state.requestsLoading = false;
        state.error = action.payload;
      })
      
      // NEW: Reject follow request
      .addCase(rejectFollowRequest.pending, (state) => {
        state.requestsLoading = true;
      })
      .addCase(rejectFollowRequest.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.followRequests = state.followRequests.filter(
          req => req.user._id !== action.payload.userId
        );
      })
      .addCase(rejectFollowRequest.rejected, (state, action) => {
        state.requestsLoading = false;
        state.error = action.payload;
      })
      
      // NEW: Cancel follow request
      .addCase(cancelFollowRequest.fulfilled, (state, action) => {
        const userId = action.payload;
        state.followStatuses[userId] = 'follow';
        state.followLoading[userId] = false;
      })
      
      // NEW: Get follow requests
      .addCase(getFollowRequests.pending, (state) => {
        state.requestsLoading = true;
      })
      .addCase(getFollowRequests.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.followRequests = action.payload;
      })
      .addCase(getFollowRequests.rejected, (state, action) => {
        state.requestsLoading = false;
        state.error = action.payload;
      })
      
      // NEW: Get follow status
      .addCase(getFollowStatus.fulfilled, (state, action) => {
        const { userId, status } = action.payload;
        state.followStatuses[userId] = status;
      })
      
      // Get Suggestions (existing - keep as is)
      .addCase(getFollowSuggestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFollowSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload;
      })
      .addCase(getFollowSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Followers (existing - keep as is)
      .addCase(getFollowers.fulfilled, (state, action) => {
        state.followers = action.payload;
      })
      
      // Get Following (existing - keep as is)
      .addCase(getFollowing.fulfilled, (state, action) => {
        state.following = action.payload;
      })
      
      // Check Follow Status (existing - keep as is)
      .addCase(checkFollowStatus.pending, (state, action) => {
        const userId = action.meta.arg;
        if (!state.followStatus[userId]) {
          state.followStatus[userId] = { isFollowing: false, isFollowedBy: false, loading: true };
        }
      })
      .addCase(checkFollowStatus.fulfilled, (state, action) => {
        const { userId, isFollowing, isFollowedBy, isMutualFollow } = action.payload;
        state.followStatus[userId] = { isFollowing, isFollowedBy, isMutualFollow, loading: false };
      })
      .addCase(checkFollowStatus.rejected, (state, action) => {
        const userId = action.meta.arg;
        if (state.followStatus[userId]) {
          state.followStatus[userId].loading = false;
        }
      });
  },
});

export const { clearError, clearFollowData, updateFollowStatus } = followSlice.actions;
export default followSlice.reducer;
