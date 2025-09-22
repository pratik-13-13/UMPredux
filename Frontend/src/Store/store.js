import { configureStore } from "@reduxjs/toolkit";
import userSlice from './Slices/userSlice.js'
import postSlice from './Slices/postSlice'
//import umSlice from './umSlice.js'
import storyReducer from "./Slices/storySlice.js"
import followReducer from './Slices/followSlice';


const Store = configureStore({
    reducer : {
        user: userSlice,
        posts: postSlice,
        stories: storyReducer,
         follow: followReducer,
    }
})

export default Store