import { combineReducers, configureStore } from "@reduxjs/toolkit";
import interviewSlice from "./interview/interviewSlice";
import interviewResultSlice from "./interview/resultSlice";
import authSlice from "@/store/auth/authSlice";
import mediaSlice from "./media/mediaSlice";
import socketSlice from "./socket/socketSlice";
import { listenerMiddleware } from "./socket/socketMiddleware";

const rootReducer = combineReducers({
  auth: authSlice,
  interview: interviewSlice,
  media: mediaSlice,
  result: interviewResultSlice,
  socket: socketSlice,
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