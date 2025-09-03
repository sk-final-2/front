import userDetailsSlice from "./user-details/userDetailsSlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import interviewSlice from "@/store/interview/interviewSlice";
import interviewResultSlice from "@/store/interview/resultSlice";
import authSlice from "@/store/auth/authSlice";
import mediaSlice from "@/store/media/mediaSlice";
import socketSlice from "@/store/socket/socketSlice";
import loadingSlice from "@/store/loading/loadingSlice";
import { listenerMiddleware } from "@/store/socket/socketMiddleware";

const rootReducer = combineReducers({
  auth: authSlice,
  interview: interviewSlice,
  media: mediaSlice,
  result: interviewResultSlice,
  socket: socketSlice,
  loading: loadingSlice,
  user_details: userDetailsSlice,
});

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

export default makeStore;
