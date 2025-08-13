import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance"; // ✅ 통일: 인터셉터/쿠키 사용
import type { InterviewType, LanguageType, LevelType } from "@/app/ready/page";

// 요청 body 형식
export type bodyData = {
  job: string | null;
  count: number;
  ocrText: string | null;
  career: string | null;
  interviewType: InterviewType;
  level: LevelType;
  language: LanguageType;
  seq: number; // 항상 1로 시작(첫 질문)
};

// 첫 질문 응답 형식
export interface FirstQuestionResponse {
  status: number;
  code: string; // "SUCCESS"
  message: string;
  data: {
    interviewId: string;
    question: string;
    seq: number; // 보통 1
  };
}

// 다음 질문 응답 데이터
export interface ResponseData {
  status: number;
  code: string; // "SUCCESS"
  message: string;
  data: {
    interviewId: string;
    newQuestion: string;
  };
}

// 상태 타입
export interface InterviewState {
  interviewId: string;
  currentQuestion: string;
  currentSeq: number;
  /** 질문 히스토리(첫 질문 포함). 화면에서 진행 상황/리뷰용으로 활용 */
  questionHistory: string[];
  status: "idle" | "pending" | "succeeded" | "failed"; // 질문 로딩 상태(첫/다음 공용)
  uploadStatus: "idle" | "loading" | "succeeded" | "failed"; // 업로드 상태 분리
  error: string | null;
}

const initialState: InterviewState = {
  interviewId: "",
  currentQuestion: "",
  currentSeq: 1,
  questionHistory: [],
  status: "idle",
  uploadStatus: "idle",
  error: null,
};

// 첫 질문 받아오기
export const getFirstQuestion = createAsyncThunk<
  FirstQuestionResponse,
  bodyData,
  { rejectValue: string }
>("interview/getFirstQuestion", async (body, { rejectWithValue, signal }) => {
  try {
    const res = await axiosInstance.post<FirstQuestionResponse>(
      "/api/interview/first-question",
      body,
      { withCredentials: true, signal }
    );
    if (res.data.code === "SUCCESS") return res.data;
    return rejectWithValue(res.data.message || "API 통신 오류");
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || "첫 질문 실패";
    return rejectWithValue(msg);
  }
});

// 답변 업로드 + 다음 질문 받기 (서버 명세: file, seq, interviewId, question)
export const getNextQuestion = createAsyncThunk<
  ResponseData,
  FormData,
  { rejectValue: string }
>("interview/getNextQuestion", async (formData, { rejectWithValue, signal }) => {
  try {
    const res = await axiosInstance.post<ResponseData>(
      "/api/interview/answer",
      formData,
      { withCredentials: true, signal }
    );
    if (res.data.code === "SUCCESS") return res.data;
    return rejectWithValue(res.data.message || "API 통신 오류");
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || "다음 질문 실패";
    return rejectWithValue(msg);
  }
});

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    resetInterview: () => initialState,
  },
  extraReducers: (builder) => {
    // 첫 질문
    builder
      .addCase(getFirstQuestion.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(
        getFirstQuestion.fulfilled,
        (state, action: PayloadAction<FirstQuestionResponse>) => {
          const d = action.payload.data;
          state.status = "succeeded";
          state.interviewId = d.interviewId;
          state.currentQuestion = d.question;
          state.currentSeq = d.seq;
          state.questionHistory = [d.question];
        }
      )
      .addCase(getFirstQuestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "첫 질문 가져오기 실패";
      });

    // 답변 업로드(업로드 상태) + 다음 질문(질문 상태)
    builder
      .addCase(getNextQuestion.pending, (state) => {
        state.uploadStatus = "loading"; // ✅ 업로드 상태만 로딩으로
        state.error = null;
      })
      .addCase(
        getNextQuestion.fulfilled,
        (state, action: PayloadAction<ResponseData>) => {
          state.uploadStatus = "succeeded";
          state.status = "succeeded"; // 새 질문 확보 완료
          const { interviewId, newQuestion } = action.payload.data;
          state.interviewId = interviewId; // 서버가 갱신해주면 동기화
          state.currentSeq += 1;
          state.currentQuestion = newQuestion;
          state.questionHistory.push(newQuestion);
        }
      )
      .addCase(getNextQuestion.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.status = "failed";
        state.error = action.payload || "다음 질문 가져오기 실패";
      });
  },
});

export const { resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
