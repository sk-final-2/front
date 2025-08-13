import { InterviewType, LanguageType, LevelType } from "@/app/ready/page";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// 요청 body 형식
export type firstQuestionBody = {
  job: string | null;
  count: number;
  ocrText: string | null;
  career: string | null;
  interviewType: InterviewType;
  level: LevelType;
  language: LanguageType;
  seq: number;
};

// 첫 질문 응답 형식
export interface FirstQuestionResponse {
  status: number;
  code: string;
  message: string;
  data: {
    interviewId: string;
    question: string;
    seq: number;
  };
}

// 초기 상태 타입을 정의합니다.
export interface InterviewState {
  interviewId: string;
  currentQuestion: string;
  currentSeq: number;
  status: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

// 초기 상태
const initialState: InterviewState = {
  interviewId: "",
  currentQuestion: "",
  currentSeq: 1,
  status: "idle",
  error: null,
};

// 첫 질문 받아오기 액션
export const getFirstQuestion = createAsyncThunk<
  FirstQuestionResponse,
  firstQuestionBody,
  { rejectValue: string }
>("get/firstQuestion", async (body: firstQuestionBody, { rejectWithValue }) => {
  try {
    const response = await axios.post<FirstQuestionResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/interview/first-question`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      },
    );
    // 성공 응답 중 code가 "SUCCESS"인 경우에만 성공으로 처리
    if (response.data.code === "SUCCESS") {
      return response.data;
    } else {
      // 서버가 에러 메시지를 포함한 2xx 응답을 보낸 경우
      return rejectWithValue(response.data.message || "API 통신 오류");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // 서버에서 보낸 에러 메시지를 reject 값으로 사용
      return rejectWithValue(error.response.data.message || "알 수 없는 오류");
    }
    // 그 외의 경우 일반 에러 메시지 사용
    return rejectWithValue((error as Error).message);
  }
}); // 첫 질문 가져오기 액션

// 답변 전송 FormData
export interface AnswerType {
  file: File;
  seq: number;
  interviewId: string;
  question: string;
}

// 다음 질문 응답 데이터
export interface ResponseData {
  status: number;
  code: string;
  message: string;
  data: {
    interviewId: string;
    newQuestion: string;
  };
}

// 다음 질문 받아오기 액션
export const getNextQuestion = createAsyncThunk<
  ResponseData,
  FormData,
  { rejectValue: string }
>("get/nextQuestion", async (formData: FormData, { rejectWithValue }) => {
  try {
    const response = await axios.post<ResponseData>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/interview/answer`,
      formData,
      {
        withCredentials: true,
      },
    );

    if (response.data.code === "SUCCESS") {
      return response.data;
    } else {
      // 서버가 에러 메시지를 포함한 2xx 응답을 보낸 경우
      return rejectWithValue(response.data.message || "API 통신 오류");
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

// 면접 슬라이스
const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    // 면접 상태를 초기화하는 액션
    clearInterview: (state) => {
      state.interviewId = "";
      state.currentQuestion = "";
      state.currentSeq = 0;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 다음 질문 받아오기 액션
    builder
      // 첫 질문 받아오기 액션
      .addCase(getFirstQuestion.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      // 청크 성공
      .addCase(
        getFirstQuestion.fulfilled,
        (state, action: PayloadAction<FirstQuestionResponse>) => {
          const data = action.payload.data;

          state.status = "succeeded";
          state.currentQuestion = data.question;
          state.interviewId = data.interviewId;
          state.currentSeq = data.seq;
        },
      )
      .addCase(getFirstQuestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "첫 질문 가져오기 실패";
      })
      // 답변 보내고 다음 질문 받아오기 액션
      .addCase(getNextQuestion.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(
        getNextQuestion.fulfilled,
        (state, action: PayloadAction<ResponseData>) => {
          const data = action.payload.data;

          state.status = "succeeded";
          state.currentQuestion = data.newQuestion;
          state.currentSeq++;
          state.error = null;
          state.interviewId = data.interviewId;
        },
      )
      .addCase(getNextQuestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "다음 질문 가져오기 실패";
      });
  },
});

// 생성된 액션을 export 합니다.
export const { clearInterview: resetInterview } = interviewSlice.actions;

// 슬라이스의 리듀서를 export 합니다.
export default interviewSlice.reducer;
