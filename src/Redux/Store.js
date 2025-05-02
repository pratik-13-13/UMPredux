import { configureStore } from "@reduxjs/toolkit";
import userSlice from './userSlice.js'
import umSlice from './umSlice.js'

const Store = configureStore({
    reducer : {
        user: userSlice,
        um : umSlice,
    }
})

export default Store