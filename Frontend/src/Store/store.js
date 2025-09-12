import { configureStore } from "@reduxjs/toolkit";
import userSlice from './Slices/userSlice.js'
import postSlice from './Slices/postSlice'
//import umSlice from './umSlice.js'
import storyReducer from "./Slices/storySlice.js"
const Store = configureStore({
    reducer : {
        user: userSlice,
        posts: postSlice,
        stories: storyReducer
    }
})

export default Store