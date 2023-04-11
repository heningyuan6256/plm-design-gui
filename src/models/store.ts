import {configureStore} from '@reduxjs/toolkit'
import counterReducer from './count'
import userReducer from './user'

export default configureStore({
    reducer: {
        counter: counterReducer,
        user: userReducer
    }
})
