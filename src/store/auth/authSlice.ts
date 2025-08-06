import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  loginAPI,
  User,
  SignupPayload,
  kakaoSignupAPI,
  googleSignupAPI,
} from "@/api/authAPI";
import axios from "axios";

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

// 기본 로그인 액션
export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const user = await loginAPI(email, password);
    return user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || "로그인 실패");
    }
    return rejectWithValue("알 수 없는 에러가 발생했습니다.");
  }
});

// 카카오 로그인 액션
export const kakaoSignup = createAsyncThunk<
  User,
  SignupPayload,
  { rejectValue: string }
>("auth/kakaoSignup", async (payload, { rejectWithValue }) => {
  try {
    return await kakaoSignupAPI(payload);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "카카오 회원가입 실패",
      );
    }
    return rejectWithValue("알 수 없는 에러가 발생했습니다.");
  }
});

// 구글 로그인 액션
export const googleSignup = createAsyncThunk<
  User,
  SignupPayload,
  { rejectValue: string }
>("auth/googleSignup", async (payload, { rejectWithValue }) => {
  try {
    return await googleSignupAPI(payload);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "구글 회원가입 실패",
      );
    }
    return rejectWithValue("알 수 없는 에러가 발생했습니다.");
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
    setInitialAuth: (state, action: PayloadAction<string>) => {
      state.isLoggedIn = true;
      state.user = null; // accessToken만 있는 초기 상태
      state.state = "successed";
      state.error = null;
      // 필요하다면 아래에 accessToken 저장하는 필드 따로 만들 수도 있음
      // state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 기본 로그인
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
      })

      // 카카오 회원가입 처리
      .addCase(kakaoSignup.pending, (state) => {
        state.state = "loading";
        state.error = null;
      })
      .addCase(kakaoSignup.fulfilled, (state, action) => {
        state.state = "successed";
        state.isLoggedIn = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(kakaoSignup.rejected, (state, action) => {
        state.state = "failed";
        state.error = action.payload || "카카오 회원가입 실패";
      })

      // 구글 회원가입 처리
      .addCase(googleSignup.pending, (state) => {
        state.state = "loading";
        state.error = null;
      })
      .addCase(googleSignup.fulfilled, (state, action) => {
        state.state = "successed";
        state.isLoggedIn = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(googleSignup.rejected, (state, action) => {
        state.state = "failed";
        state.error = action.payload || "구글 회원가입 실패";
      });
  },
});

export const { logout, setInitialAuth } = authSlice.actions;
export default authSlice.reducer;
