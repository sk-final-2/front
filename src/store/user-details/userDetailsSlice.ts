import { AvgScoreType } from "../interview/resultSlice";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axiosInstance";
import axios from "axios";

// 사용자 기본 정보 응답 data
interface GetUserBaseInfoResponseData {
  id: number;
  email: string;
  name: string;
  postcode: string;
  address1: string;
  address2: string;
  gender: string;
  birth: string;
  provider: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// 사용자 기본 정보 응답 형식
export interface GetUserBaseInfoResponse {
  status: number;
  code: string;
  message: string;
  data: GetUserBaseInfoResponseData;
}

// 사용자 기본 정보 불러오기 액션
export const getUserBaseInfo = createAsyncThunk<
  GetUserBaseInfoResponse,
  null,
  { rejectValue: string }
>("/get/user/details", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<GetUserBaseInfoResponse>(`/api/mypage`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    const bodyData = response.data;

    // 성공 응답 중 code가 "SUCCESS"인 경우에만 성공으로 처리
    if (response.status === 200) {
      return bodyData;
    } else {
      // 서버가 에러 메시지를 포함한 2xx 응답을 보낸 경우
      return rejectWithValue(bodyData.message || "API 통신 오류");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // 서버에서 보낸 에러 메시지를 reject 값으로 사용
      return rejectWithValue(error.response.data.message || "알 수 없는 오류");
    }
    // 그 외의 경우 일반 에러 메시지 사용
    return rejectWithValue((error as Error).message);
  }
});

export interface AnswerAnalysesArrayType {
  seq: number;
  question: string;
  answer: string;
  good: string;
  bad: string;
  score: number;
  emotionText: string;
  mediapipeText: string;
  emotionScore: number;
  blinkScore: number;
  eyeScore: number;
  headScore: number;
  handScore: number;
}

export interface GetUserInterviewListResponseData {
  uuid: string;
  memberId: number;
  createdAt: string;
  job: string;
  career: string;
  type: string;
  level: string;
  language: string;
  count: number;
  answerAnalyses: Array<AnswerAnalysesArrayType>;
  avgScore: Array<AvgScoreType>;
}

// 사용자 참여 면접 기록 불러오기 응답 형식
export interface GetUserInterviewListResponse {
  status: number;
  code: string;
  message: string;
  data: Array<GetUserInterviewListResponseData>;
}

// 사용자 참여 interviewID 로 기록 불러오기 응답 형식
export interface GetUserInterviewResponse {
  status: number;
  code: string;
  message: string;
  data: GetUserInterviewListResponseData;
}

// 사용자 참여 면접 기록 불러오기 액션
export const getUserInterviewList = createAsyncThunk<
  GetUserInterviewListResponse,
  null,
  { rejectValue: string }
>("/get/user/interviews", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<GetUserInterviewListResponse>(
      `/api/interview-results`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      },
    );
    const bodyData = response.data;

    // 성공 응답 중 code가 "SUCCESS"인 경우에만 성공으로 처리
    if (response.status === 200) {
      return bodyData;
    } else {
      // 서버가 에러 메시지를 포함한 2xx 응답을 보낸 경우
      return rejectWithValue(bodyData.message || "API 통신 오류");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // 서버에서 보낸 에러 메시지를 reject 값으로 사용
      return rejectWithValue(error.response.data.message || "알 수 없는 오류");
    }
    // 그 외의 경우 일반 에러 메시지 사용
    return rejectWithValue((error as Error).message);
  }
});

// interviewId 로 하나의 면접 결과 받아오기 액션
export const getUserInterview = createAsyncThunk<
  GetUserInterviewResponse,
  { interviewId: string },
  { rejectValue: string }
>("/get/user/interview", async (data, { rejectWithValue }) => {
  try {
    console.log(data.interviewId);
    const response = await api.get<GetUserInterviewResponse>(
      `/api/interview-results/${data.interviewId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      },
    );
    const bodyData = response.data;

    // 성공 응답 중 code가 "SUCCESS"인 경우에만 성공으로 처리
    if (response.status === 200) {
      return bodyData;
    } else {
      // 서버가 에러 메시지를 포함한 2xx 응답을 보낸 경우
      return rejectWithValue(bodyData.message || "API 통신 오류");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // 서버에서 보낸 에러 메시지를 reject 값으로 사용
      return rejectWithValue(error.response.data.message || "알 수 없는 오류");
    }
    // 그 외의 경우 일반 에러 메시지 사용
    return rejectWithValue((error as Error).message);
  }
});

// 초기 상태 정의
export interface UserDetailStateType {
  status: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
  base: GetUserBaseInfoResponseData | null;
  interviews: Array<GetUserInterviewListResponseData>;
  interview: GetUserInterviewListResponseData | null;
}

const initialState: UserDetailStateType = {
  status: "idle",
  error: null,
  base: null,
  interviews: [],
  interview: null,
};

// 사용자 상세 정보 슬라이스
const userDetailsSlice = createSlice({
  name: "user-details",
  initialState,
  reducers: {
    clearUserDetails: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(getUserBaseInfo.pending, (state, action) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(
        getUserBaseInfo.fulfilled,
        (state, action: PayloadAction<GetUserBaseInfoResponse>) => {
          const data = action.payload.data;
          state.base = data;
        },
      )
      .addCase(getUserBaseInfo.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "사용자 정보 가져오기 실패";
      })
      // 사용자 면접 기록 전체 가져오기
      .addCase(getUserInterviewList.pending, (state, action) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(
        getUserInterviewList.fulfilled,
        (state, action: PayloadAction<GetUserInterviewListResponse>) => {
          const data = action.payload.data;

          state.interviews = data;
        },
      )
      .addCase(getUserInterviewList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "사용자 면접 정보 가져오기 실패";
      })
      // 사용자 면접 기록 1개 가져오기
      .addCase(getUserInterview.pending, (state, action) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(
        getUserInterview.fulfilled,
        (state, action: PayloadAction<GetUserInterviewResponse>) => {
          const data = action.payload.data;
          console.log(data);

          state.interview = data;
        },
      )
      .addCase(getUserInterview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "사용자 면접 정보 가져오기 실패";
      });
  },
});

export const { clearUserDetails } = userDetailsSlice.actions;

export default userDetailsSlice.reducer;
