import questionSlice from "@/store/question/questionSlice";
import authSlice from "@/store/auth/authSlice";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: {
    auth: authSlice,
    question: questionSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;