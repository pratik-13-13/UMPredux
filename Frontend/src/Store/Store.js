import { configureStore } from "@reduxjs/toolkit";
import userSlice from './Slices/userSlice.js'
import postSlice from './Slices/postSlice.js'
import storyReducer from "./Slices/storySlice.js"
import followReducer from './Slices/followSlice.js';
import chatReducer from './Slices/chatSlice';

const Store = configureStore({
    reducer: {
        user: userSlice,
        posts: postSlice,
        stories: storyReducer,
        follow: followReducer,
        chat: chatReducer,
    }
})

export default Store