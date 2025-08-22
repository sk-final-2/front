import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  analysisComplete: boolean;
  error: string | null;
}

// 초기 상태
const initialState: SocketState = {
  isConnected: false,
  isConnecting: false,
  analysisComplete: false,
  error: null,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    startConnecting: (
      state,
      action: PayloadAction<{ interviewId: string }>,
    ) => {
      state.isConnecting = true;
      state.isConnected = false;
      state.error = null;
    },
    // 연결 성공 액션
    connectionEstablished: (state) => {
      state.isConnected = true;
      state.isConnecting = false;
    },
    // 연결 실패 또는 오류 액션
    connectionError: (state, action: PayloadAction<string>) => {
      state.isConnected = false;
      state.isConnecting = false;
      state.error = action.payload;
    },
    // 연결 해제 액션 (미들웨어에서 감지하여 소켓 해제)
    disconnect: (state) => {
      // 상태를 초기화
      state.isConnected = false;
      state.isConnecting = false;
      state.error = null;
    },
    setAnalysisComplete: (state) => {
      state.analysisComplete = true;
    },
  },
});

export const {
  startConnecting,
  connectionEstablished,
  connectionError,
  disconnect,
  setAnalysisComplete,
} = socketSlice.actions;

export default socketSlice.reducer;
