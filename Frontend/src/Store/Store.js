import { configureStore } from "@reduxjs/toolkit";
import userSlice from './Slices/userSlice.js'
import postSlice from './Slices/postSlice.js'
import umSlice from './umSlice.js'
import storyReducer from "./Slices/storySlice.js"
import followReducer from './Slices/followSlice.js';


const Store = configureStore({
    reducer : {
        user: userSlice,
        posts: postSlice,
        stories: storyReducer,
         follow: followReducer,
         umSlice: umSlice
    }
})

export default Store