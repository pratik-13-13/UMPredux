import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
//const API_URL = "https://api-umpredux.onrender.com/api/users"; // Base API URL
 const API_URL = "http://localhost:5000/api/posts";

// ✅ Register User
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const newUser = { name, email, password, role: role || "user" };
      const res = await axios.post(`${API_URL}/register`, newUser);
      return res.data; // created user (no token)
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || "Registration failed!");
    }
  }
);

// ✅ Login User
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      return res.data; // { user, token }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || "Login failed!");
    }
  }
);

// ✅ Fetch user by ID
export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (id, { rejectWithValue, getState }) => {
    try {
      if (!id) {
        return rejectWithValue("Invalid user id");
      }
      
      const token = getState().user.token;
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } : {};
      
      const response = await axios.get(`${API_URL}/${id}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || "User not found!");
    }
  }
);

// ✅ Fetch all users (with authentication)
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token;
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } : {};
      
      const response = await axios.get(API_URL, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || "Failed to fetch users!");
    }
  }
);

// ✅ Add User
export const addUser = createAsyncThunk(
  "user/addUser",
  async (userData, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token;
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } : {};
      
      // Check if user already exists
      const existingUsersResponse = await axios.get(API_URL, config);
      const existingUser = existingUsersResponse.data.find((u) => u.email === userData.email);

      if (existingUser) {
        return rejectWithValue("User already exists with this email!");
      }

      const userToAdd = {
        ...userData,
        password: userData.password || "defaultPassword123",
      };

      const response = await axios.post(API_URL, userToAdd, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || "User creation failed!");
    }
  }
);

// ✅ Update user
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ id, updatedData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token;
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } : {};
      
      const response = await axios.put(`${API_URL}/${id}`, updatedData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || "Update failed!");
    }
  }
);

// ✅ Delete user
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token;
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } : {};
      
      await axios.delete(`${API_URL}/${id}`, config);
      return id; // return deleted user's _id
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || "Delete failed!");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    // Current logged-in user info
    userInfo: JSON.parse(localStorage.getItem("userInfo")) || null,
    token: localStorage.getItem("authToken") || null,
    
    // All users list (for admin/management purposes)
    users: [],
    
    // Loading and error states
    loading: false,
    error: null,
  },
  reducers: {
    // Logout action
    logout: (state) => {
      state.userInfo = null;
      state.token = null;
      state.users = []; // Clear users list on logout
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Manual user list management actions
    updateUserInList: (state, action) => {
      const updatedUser = action.payload;
      const index = state.users.findIndex((user) => user._id === updatedUser._id);
      if (index !== -1) {
        state.users[index] = updatedUser;
      }
    },
    
    addUserToList: (state, action) => {
      const existingUser = state.users.find(user => user._id === action.payload._id);
      if (!existingUser) {
        state.users.push(action.payload);
      }
    },
    
    removeUserFromList: (state, action) => {
      state.users = state.users.filter((user) => user._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("authToken", action.payload.token);
        localStorage.setItem("userInfo", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // Do NOT log the user in on register
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        // Only update userInfo if fetching current user
        if (state.userInfo && state.userInfo._id === action.payload._id) {
          state.userInfo = action.payload;
        }
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        console.log("Fetched users:", action.payload);
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add User
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        // Add to users list if not already present
        const existingUser = state.users.find(user => user._id === action.payload._id);
        if (!existingUser) {
          state.users.push(action.payload);
        }
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update userInfo if it's the current user
        if (state.userInfo && state.userInfo._id === action.payload._id) {
          state.userInfo = action.payload;
          localStorage.setItem("userInfo", JSON.stringify(action.payload));
        }
        
        // Update in users list
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) {
          state.users[idx] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
        
        // If user deleted themselves, logout
        if (state.userInfo && state.userInfo._id === action.payload) {
          state.userInfo = null;
          state.token = null;
          localStorage.removeItem("authToken");
          localStorage.removeItem("userInfo");
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  logout, 
  clearError, 
  updateUserInList, 
  addUserToList, 
  removeUserFromList 
} = userSlice.actions;

// Export fetchAllUsers as fetchUsers for backward compatibility
export const fetchUsers = fetchAllUsers;

export default userSlice.reducer;