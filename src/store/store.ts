import interviewSlice from "./interview/interviewSlice";
import interviewResultSlice from "./interview/resultSlice";
import authSlice from "@/store/auth/authSlice";
import mediaSlice from "./media/mediaSlice";
import { configureStore } from "@reduxjs/toolkit";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authSlice,
      interview: interviewSlice,
      media: mediaSlice,
      result: interviewResultSlice,
    },
  });

// 타입 정의도 함께 export
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export default makeStore;
