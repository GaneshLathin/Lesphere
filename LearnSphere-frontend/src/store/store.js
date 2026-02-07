import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import courseReducer from './slices/courseSlice'
import topicReducer from './slices/topicSlice'
import materialReducer from './slices/materialSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    topic: topicReducer,
    material: materialReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store