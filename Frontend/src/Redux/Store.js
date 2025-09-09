import { configureStore } from "@reduxjs/toolkit";
import userSlice from './userSlice.js'
import postSlice from './postSlice.js'
//import umSlice from './umSlice.js'

const Store = configureStore({
    reducer : {
        user: userSlice,
        posts: postSlice,
        //um : umSlice,
    }
})

export default Store