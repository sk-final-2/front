import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User } from "@/api/authAPI";

interface AuthType {
  isLoggedIn: boolean;
  user: User | null;
  state: "idle" | "loading" | "successed" | "failed";
  error: string | null;
}

// 초기 인증 상태
const initialState: AuthType = {
  isLoggedIn: false,
  user: null,
  state: "idle",
  error: null,
};

// 로그인 액션
const loginUser = createAsyncThunk<User, { rejectValue: string }>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {},
);

// 인증 슬라이스
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.state = "idle";
      state.error = null;
    },
  },
});

export const { logout } = authSlice.actions;
