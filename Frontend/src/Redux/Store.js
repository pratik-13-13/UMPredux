import { configureStore } from "@reduxjs/toolkit";
import userSlice from './userSlice.js'
import postSlice from './postSlice.js'
//import umSlice from './umSlice.js'
import storyReducer from "./storySlice.js"
const Store = configureStore({
    reducer : {
        user: userSlice,
        posts: postSlice,
        stories: storyReducer
    }
})

export default Store