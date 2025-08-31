import { createSlice } from "@reduxjs/toolkit";

interface LoadingState {
  isLoading: boolean;
}

// 초기 상태
const initialState: LoadingState = {
  isLoading: false,
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    // 로딩 시작 액션
    startLoading: (state) => {
      state.isLoading = true;
    },
    // 로딩 종료 액션
    stopLoading: (state) => {
      state.isLoading = false;
    },
  },
});

export const { startLoading, stopLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
