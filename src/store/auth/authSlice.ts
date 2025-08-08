import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  loginAPI,
  User,
  LoginResponse,
  SignupPayload,
  kakaoSignupAPI,
  googleSignupAPI,
  logoutServerAPI,
  fetchUserInfo,
} from "@/api/authAPI";
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";

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
  LoginResponse, // ✅ fulfilled action.payload
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    return await loginAPI(email, password);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || "로그인 실패");
    }
    return rejectWithValue("알 수 없는 에러가 발생했습니다.");
  }
});

// 카카오 로그인 액션
export const kakaoSignup = createAsyncThunk<
  LoginResponse,
  SignupPayload,
  { rejectValue: string }
>("auth/kakaoSignup", async (payload, { rejectWithValue }) => {
  try {
    return await kakaoSignupAPI(payload);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "카카오 로그인 실패",
      );
    }
    return rejectWithValue("알 수 없는 에러가 발생했습니다.");
  }
});

// 구글 로그인 액션
export const googleSignup = createAsyncThunk<
  LoginResponse,
  SignupPayload,
  { rejectValue: string }
>("auth/googleSignup", async (payload, { rejectWithValue }) => {
  try {
    return await googleSignupAPI(payload);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "구글 로그인 실패",
      );
    }
    return rejectWithValue("알 수 없는 에러가 발생했습니다.");
  }
});

// 사용자 정보 불러오기
export const fetchAndSetUser = createAsyncThunk<
  User, // fulfilled payload
  void,
  { rejectValue: string }
>("auth/fetchUser", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchUserInfo();
    return res.data; // 여기엔 email, name만 있음
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      try {
        await axiosInstance.post("/api/auth/reissue"); // 👈 직접 요청
        const retry = await fetchUserInfo(); // 👈 재시도
        return retry.data;
      } catch (reissueErr) {
        return rejectWithValue("accessToken 만료 + reissue 실패");
      }
    }
    return rejectWithValue("사용자 정보 가져오기 실패");
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutServerAPI(); // ✅ 백엔드에도 로그아웃 요청
    } catch (err) {
      return rejectWithValue("백엔드 로그아웃 실패");
    }
  },
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
    setInitialAuth: (state, action: PayloadAction<string>) => {
      state.isLoggedIn = true;
      state.user = null; // accessToken만 있는 초기 상태
      state.state = "successed";
      state.error = null;
      // 필요하다면 아래에 accessToken 저장하는 필드 따로 만들 수도 있음
      // state.accessToken = action.payload;
    },
    setUserFromSocial: (
      state,
      action: PayloadAction<{
        email: string;
        name: string;
        loginType: "default" | "google" | "kakao";
      }>,
    ) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.state = "successed";
      state.error = null;
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

        const rawUser = action.payload.data;

        state.user = {
          email: rawUser.email,
          name: rawUser.name,
          loginType:
            rawUser.provider === "LOCAL"
              ? "default"
              : (rawUser.provider.toLowerCase() as "google" | "kakao"),
        };

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
        const rawUser = action.payload.data;

        state.state = "successed";
        state.isLoggedIn = true;
        state.user = {
          email: rawUser.email,
          name: rawUser.name,
          loginType:
            rawUser.provider === "LOCAL"
              ? "default"
              : (rawUser.provider.toLowerCase() as "google" | "kakao"),
        };
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
        const rawUser = action.payload.data;

        state.state = "successed";
        state.isLoggedIn = true;
        state.user = {
          email: rawUser.email,
          name: rawUser.name,
          loginType:
            rawUser.provider === "LOCAL"
              ? "default"
              : (rawUser.provider.toLowerCase() as "google" | "kakao"),
        };
        state.error = null;
      })
      .addCase(googleSignup.rejected, (state, action) => {
        state.state = "failed";
        state.error = action.payload || "구글 회원가입 실패";
      })

      //새로고침할 때 유저 정보 불러오기
      .addCase(fetchAndSetUser.fulfilled, (state, action) => {
        state.user = {
          email: action.payload.email,
          name: action.payload.name,
          loginType: "default", //다시 요청해서 불러올 때는 provider 정보가 없기 때문에 기본값 처리
        };
        state.isLoggedIn = true;
        state.state = "successed";
        state.error = null;
      })
      .addCase(fetchAndSetUser.rejected, (state, action) => {
        state.user = null;
        state.state = "failed";
        state.error = action.payload || "유저 정보 불러오기 실패";
      })

      //로그아웃
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.state = "idle";
        state.error = null;
      });
  },
});

export const { logout, setInitialAuth, setUserFromSocial } = authSlice.actions;
export default authSlice.reducer;
