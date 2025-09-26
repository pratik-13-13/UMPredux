import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://api-umpredux.onrender.com/api/stories";
//const API_URL = "http://192.168.1.154:5000/api/stories";

// Fetch all stories grouped by user
export const fetchStoriesByUser = createAsyncThunk(
    "stories/fetchByUser",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${API_URL}/by-user`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Create a new story
export const createStory = createAsyncThunk(
    'stories/create',
    async ({ content, image }, { rejectWithValue, getState }) => {
        try {
            const token = getState().user.token;

            if (!token) {
                throw new Error('Please login to create stories');
            }

            // Use FormData for file upload
            const formData = new FormData();
            if (content) formData.append('content', content);
            if (image instanceof File) {
                formData.append('image', image);
            } else if (typeof image === 'string' && image.trim()) {
                formData.append('image', image);
            }

            const response = await fetch(`${API_URL}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create story');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// View a story
export const viewStory = createAsyncThunk(
    "stories/view",
    async (storyId, { rejectWithValue, getState }) => {
        try {
            const token = getState().user.token;
            const config = token
                ? { headers: { Authorization: `Bearer ${token}` } }
                : {};
            const res = await axios.post(`${API_URL}/${storyId}/view`, {}, config);

            // ✅ RETURN: Updated story data with current view count
            return {
                storyId,
                story: res.data.story,
                viewCount: res.data.viewCount
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// ✅ ALREADY EXISTS: Delete story thunk - this was already properly implemented
export const deleteStory = createAsyncThunk(
    "stories/delete",
    async (storyId, { rejectWithValue, getState }) => {
        try {
            const token = getState().user.token;
            const config = token
                ? { headers: { Authorization: `Bearer ${token}` } }
                : {};
            await axios.delete(`${API_URL}/${storyId}`, config);
            return storyId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

const storySlice = createSlice({
    name: "stories",
    initialState: {
        userStories: [], // Stories grouped by user
        loading: false,
        error: null,
        creating: false,
        deleting: false, // ✅ ADDED: Loading state for delete operation
        viewing: null // Currently viewing story
    },
    reducers: {
        setViewingStory: (state, action) => {
            state.viewing = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch stories by user
            .addCase(fetchStoriesByUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStoriesByUser.fulfilled, (state, action) => {
                state.loading = false;
                // Add null checks for the response
                if (Array.isArray(action.payload)) {
                    state.userStories = action.payload.filter(group =>
                        group && group._id && group._id._id
                    );
                } else {
                    console.warn('Invalid stories payload received:', action.payload);
                    state.userStories = [];
                }
            })
            .addCase(fetchStoriesByUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create story - WITH PROPER NULL CHECKS
            .addCase(createStory.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createStory.fulfilled, (state, action) => {
                state.creating = false;
                const newStory = action.payload;

                // Add null checks before accessing nested properties
                if (!newStory || !newStory.userId || !newStory.userId._id) {
                    console.warn('Invalid story payload received:', newStory);
                    return;
                }

                // Safe access with proper checks
                const existingUserGroup = state.userStories.find(
                    group => group && group._id && group._id._id === newStory.userId._id
                );

                if (existingUserGroup) {
                    existingUserGroup.stories.unshift(newStory);
                    existingUserGroup.latestStory = newStory;
                } else {
                    state.userStories.unshift({
                        _id: newStory.userId, // Use the full user object
                        stories: [newStory],
                        latestStory: newStory
                    });
                }
            })
            .addCase(createStory.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            // View story
            .addCase(viewStory.fulfilled, (state, action) => {
                const { storyId, story, viewCount } = action.payload;

                // ✅ UPDATE: Story in all user groups with new view data
                state.userStories.forEach(userGroup => {
                    // Update in stories array
                    const storyIndex = userGroup.stories.findIndex(s => s._id === storyId);
                    if (storyIndex !== -1) {
                        userGroup.stories[storyIndex] = story;
                    }

                    // Update latest story if it's the viewed story
                    if (userGroup.latestStory && userGroup.latestStory._id === storyId) {
                        userGroup.latestStory = story;
                    }
                });

            })


            // ✅ ENHANCED: Delete story reducers with loading states
            .addCase(deleteStory.pending, (state) => {
                state.deleting = true;
                state.error = null;
            })
            .addCase(deleteStory.fulfilled, (state, action) => {
                state.deleting = false;
                const deletedStoryId = action.payload;

                // Remove story from all user groups
                state.userStories.forEach(userGroup => {
                    userGroup.stories = userGroup.stories.filter(s => s._id !== deletedStoryId);

                    // Update latestStory if the deleted story was the latest
                    if (userGroup.latestStory && userGroup.latestStory._id === deletedStoryId) {
                        userGroup.latestStory = userGroup.stories[0] || null;
                    }
                });

                // Remove user groups with no stories
                state.userStories = state.userStories.filter(group => group.stories.length > 0);
            })
            .addCase(deleteStory.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload;
            });
    },
});

export const { setViewingStory, clearError } = storySlice.actions;
export default storySlice.reducer;
