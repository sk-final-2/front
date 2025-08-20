import { InterviewType, LanguageType, LevelType } from "@/app/ready/page";
import api from "@/lib/axiosInstance";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// 면접 결과 요청 형식
export type InterviewResultRequest = {
  interviewId: string;
};

// 개별 답변 분석 결과
export type AnswerAnalyseType = {
  seq: number; // 순서
  question: string; // 질문
  answer: string; // 답변
  good: string; // 피드백 (긍정적)
  bad: string; // 개선점 (부정적)
  score: number; // 점수 (1.0 ~ 5.0)
  emotionText: string; // 표정 피드백
  mediapipeText: string; // 눈 깜빡임
  emotionScore: number; // 표정 점수
  blinkScore: number; // 눈 깜빡임 점수
  eyeScore: number; // 시선처리 점수
  headScore: number; // 머리 움직임 점수
  handScore: number; // 손 움직임 점수
  timestamp: Array<TimeStampListType>;
};

export type TimeStampListType = {
  time: string; // 감지 타임 스탬프
  reason: string; // Description
};

export type AvgScoreType = {
  score: number;
  emotionScore: number;
  blinkScore: number;
  eyeScore: number;
  headScore: number;
  handScore: number;
};

// 면접 전체 결과 응답 형식
export interface InterviewResultResponse {
  status: number;
  code: string;
  message: string;
  data: {
    uuid: string;
    memberId: number;
    createdAt: string;
    job: string;
    career: string;
    type: InterviewType;
    level: LevelType;
    language: LanguageType;
    count: number;
    answerAnalyses: Array<AnswerAnalyseType>; // 답변 결과 리스트
    avgScore: Array<AvgScoreType>;
  };
}

// 면접 결과 받아오기 액션
export const getInterviewResult = createAsyncThunk<
  InterviewResultResponse,
  InterviewResultRequest,
  { rejectValue: string }
>("get/result", async (body: InterviewResultRequest, { rejectWithValue }) => {
  try {
    const response = await api.post<InterviewResultResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/interview/result`,
      body,
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

// 초기 결과 상태 타입
export interface InterviewStateType {
  status: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
  uuid: string | null;
  memberId: number | null;
  createdAt: string | null;
  job: string | null;
  career: string | null;
  type: InterviewType | null;
  level: LevelType | null;
  language: LanguageType | null;
  count: number | null;
  answerAnalyses: Array<AnswerAnalyseType>;
  avgScore: Array<AvgScoreType>;
}

// 초기 결과 상태
const initialState: InterviewStateType = {
  status: "idle",
  error: null,
  uuid: null,
  memberId: null,
  createdAt: null,
  job: null,
  career: null,
  type: null,
  level: null,
  language: null,
  count: null,
  answerAnalyses: [],
  avgScore: [],
};

// 면접 결과 슬라이스
const interviewResultSlice = createSlice({
  name: "result",
  initialState,
  reducers: {
    // 면접 결과 초기화 액션
    clearResult: (state) => {
      state.uuid = null;
      state.memberId = null;
      state.createdAt = null;
      state.job = null;
      state.career = null;
      state.type = null;
      state.level = null;
      state.language = null;
      state.count = null;
      state.answerAnalyses = [];
      state.avgScore = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // 면접 결과 가져오기
      .addCase(getInterviewResult.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(
        getInterviewResult.fulfilled,
        (state, action: PayloadAction<InterviewResultResponse>) => {
          const data = action.payload.data;

          state.status = "succeeded";
          state.uuid = data.uuid;
          state.memberId = data.memberId;
          state.createdAt = data.createdAt;
          state.job = data.job;
          state.career = data.career;
          state.type = data.type;
          state.level = data.level;
          state.language = data.language;
          state.count = data.count;
          state.answerAnalyses = data.answerAnalyses;
          state.avgScore = data.avgScore;
        },
      )
      .addCase(getInterviewResult.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "면접 결과 가져오기 실패";
      });
  },
});

export const { clearResult } = interviewResultSlice.actions;

export default interviewResultSlice.reducer;
