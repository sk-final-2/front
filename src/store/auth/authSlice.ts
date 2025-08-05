import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginAPI, User } from "@/api/authAPI";
import type { AxiosError } from "axios";

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
export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const user = await loginAPI(email, password);
    return user;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return rejectWithValue(axiosError.response?.data?.message || "로그인 실패");
  }
});

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
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.state = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.state = "successed";
        state.isLoggedIn = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.state = "failed";
        state.error = action.payload || "로그인 실패";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
