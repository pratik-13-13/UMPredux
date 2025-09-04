import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch users
export const fetchUsers = createAsyncThunk("users/fetchUsers", async (_, { rejectWithValue }) => {
  try {
<<<<<<< HEAD
    const response = await axios.get("http://localhost:3000/user");
=======
    const response = await axios.get("https://server-1-pwpn.onrender.com/user");
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Async thunk to delete user
export const deleteUser = createAsyncThunk("users/deleteUser", async (id, { rejectWithValue }) => {
  try {
<<<<<<< HEAD
    await axios.delete(`http://localhost:3000/user/${id}`);
=======
    await axios.delete(`https://server-1-pwpn.onrender.com/user/${id}`);
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
    return id; // Returning the deleted user's ID
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const umSlice = createSlice({
  name: "um",
  initialState: {
    userList: [],
    loading: false,
    error: null,
  },
<<<<<<< HEAD
  reducers: {
    updateUserInList: (state, action) => {
      const updatedUser = action.payload;
      const userIndex = state.userList.findIndex(user => user.id === updatedUser.id);
      if (userIndex !== -1) {
        state.userList[userIndex] = updatedUser;
      }
    },
    addUserToList: (state, action) => {
      state.userList.push(action.payload);
    },
    removeUserFromList: (state, action) => {
      state.userList = state.userList.filter(user => user.id !== action.payload);
    }
  },
=======
  reducers: {},
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418

  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.userList = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userList = state.userList.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

<<<<<<< HEAD
export const { updateUserInList, addUserToList, removeUserFromList } = umSlice.actions;
=======
>>>>>>> 5ccc88ea502ee668f10462c4875600b02c907418
export default umSlice.reducer;
