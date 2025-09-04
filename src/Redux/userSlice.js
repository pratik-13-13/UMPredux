import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

<<<<<<< HEAD
const API_URL = "http://localhost:3000/user"; // Base API URL
=======
const API_URL = "https://server-1-pwpn.onrender.com/user"; // Base API URL
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418

// ✅ Register User
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      const existingUser = response.data.find((u) => u.email === email);

      if (existingUser) {
        return rejectWithValue("User already exists with this email!");
      }

      const newUser = { name, email, password };
      const res = await axios.post(API_URL, newUser);
      return res.data;
    } catch (error) {
<<<<<<< HEAD
      return rejectWithValue(error.response?.data?.message || error.message || "Registration failed!");
=======
      return rejectWithValue(error.response?.data || "Registration failed!");
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
    }
  }
);

// ✅ Fetch user by ID
export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
<<<<<<< HEAD
      return rejectWithValue(error.response?.data?.message || error.message || "User not found!");
=======
      return rejectWithValue(error.response?.data || "User not found!");
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
    }
  }
);

// ✅ Update user
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, updatedData);
      return response.data;
    } catch (error) {
<<<<<<< HEAD
      return rejectWithValue(error.response?.data?.message || error.message || "Update failed!");
    }
  }
);

// ✅ Delete user
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id; // Return the deleted user's ID
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Delete failed!");
=======
      return rejectWithValue(error.response?.data || "Update failed!");
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
    }
  }
);

// ✅ Login User
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      const user = response.data.find((u) => u.email === email && u.password === password);

      if (!user) {
        return rejectWithValue("Invalid email or password!");
      }

      const fakeToken = "fake-jwt-token"; // Simulating authentication
      return { user, token: fakeToken };
    } catch (error) {
<<<<<<< HEAD
      return rejectWithValue(error.message || "Login failed! Please try again.");
=======
      return rejectWithValue("Login failed! Please try again.");
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
    }
  }
);

<<<<<<< HEAD
// ✅ Add User (Made password optional for admin adding users)
=======
// ✅ Add User
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
export const addUser = createAsyncThunk(
  "user/addUser",
  async (userData, { rejectWithValue }) => {
    try {
<<<<<<< HEAD
      // Check if user already exists
      const existingUsersResponse = await axios.get(API_URL);
      const existingUser = existingUsersResponse.data.find((u) => u.email === userData.email);
      
      if (existingUser) {
        return rejectWithValue("User already exists with this email!");
      }

      // Add default password if not provided
      const userToAdd = {
        ...userData,
        password: userData.password || "defaultPassword123"
      };

      const response = await axios.post(API_URL, userToAdd);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "User creation failed!");
    }
  }
);

// ✅ Fetch all users
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch users!");
=======
      const response = await axios.post(API_URL, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "User creation failed!");
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: JSON.parse(localStorage.getItem("userInfo")) || null,
    token: localStorage.getItem("authToken") || null,
    users: [],
    loading: false,
    error: null,
  },

  reducers: {
    logout: (state) => {
      state.userInfo = null;
      state.token = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
    },
<<<<<<< HEAD
    clearError: (state) => {
      state.error = null;
    },
=======
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
  },

  extraReducers: (builder) => {
    builder
      // ✅ Login User
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

      // ✅ Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

<<<<<<< HEAD
      // ✅ Fetch User by ID - Fixed error handling
=======
      // ✅ Fetch User by ID (Fix: Store in `userInfo`, not `users`)
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
<<<<<<< HEAD
        state.error = action.payload; // Fixed: use action.payload instead of action.error.message
      })

      // ✅ Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
=======
        state.error = action.error.message;
      })

      // ✅ Update User (Fix: Update `userInfo`, not `users`)
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
<<<<<<< HEAD
        // Also update in users array if it exists
        const userIndex = state.users.findIndex(user => user.id === action.payload.id);
        if (userIndex !== -1) {
          state.users[userIndex] = action.payload;
        }
=======
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

<<<<<<< HEAD
      // ✅ Add User
=======
      // ✅ Add User (Fix: Ensure `users` list updates correctly)
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = [...state.users, action.payload];
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
<<<<<<< HEAD
      })

      // ✅ Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
=======
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
      });
  },
});

<<<<<<< HEAD
export const { logout, clearError } = userSlice.actions;
export default userSlice.reducer;
=======
export const { logout } = userSlice.actions;
export default userSlice.reducer;
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
