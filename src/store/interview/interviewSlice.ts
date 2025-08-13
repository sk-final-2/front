import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance"; // ✅ 통일: 인터셉터/쿠키 사용
import type { InterviewType, LanguageType, LevelType } from "@/app/ready/page";
import type { AxiosRequestHeaders } from "axios";
import { isAxiosError } from "axios";

// 서버 에러 바디 타입(프로젝트 응답 규격에 맞게 필요시 확장)
interface ApiErrorBody {
  status?: number;
  code?: string;
  message?: string;
  data?: unknown;
}

// 요청 body 형식
export type bodyData = {
  job: string | null;
  count: number; //이거를 InterviewState에 넣기
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
    keepGoing: boolean; // false면 end 호출해서 면접 종료하기
  };
}

// ✅ end 요청/응답 타입
export interface EndRequestBody {
  interviewId: string;
  lastSeq: number;
}

export interface EndResponse {
  status: number;
  code: string;
  message: string;
  data: string; // 사양상 문자열
}

// 상태 타입
export interface InterviewState {
  interviewId: string;
  currentQuestion: string;
  currentSeq: number;
  /** 전체 질문 개수(ready에서 사용자가 선택한 개수). 없을 수 있으니 optional로 시작 */
  totalCount?: number | null;
  /** 질문 히스토리(첫 질문 포함). 화면에서 진행 상황/리뷰용으로 활용 */
  questionHistory: string[];
  status: "idle" | "pending" | "succeeded" | "failed"; // 질문 로딩 상태(첫/다음 공용)
  uploadStatus: "idle" | "loading" | "succeeded" | "failed"; // 업로드 상태 분리
  error: string | null;
  isFinished?: boolean;
  lastSeqSentToEnd?: number | null;
}

const initialState: InterviewState = {
  interviewId: "",
  currentQuestion: "",
  currentSeq: 1,
  totalCount: null,
  questionHistory: [],
  status: "idle",
  uploadStatus: "idle",
  error: null,
  isFinished: false,
  lastSeqSentToEnd: null,
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
      { withCredentials: true, signal },
    );
    if (res.data.code === "SUCCESS") return res.data;
    return rejectWithValue(res.data.message || "API 통신 오류");
  } catch (err: unknown) {
    let msg = "첫 질문 실패";
    if (isAxiosError<ApiErrorBody>(err)) {
      msg = err.response?.data?.message ?? err.message ?? msg;
    } else if (err instanceof Error) {
      msg = err.message;
    }
    return rejectWithValue(msg);
  }
});

// 답변 업로드 + 다음 질문 받기 (서버 명세: file, seq, interviewId, question)
export const getNextQuestion = createAsyncThunk<
  ResponseData,
  FormData,
  { rejectValue: string }
>(
  "interview/getNextQuestion",
  async (formData, { rejectWithValue, signal }) => {
    try {
      const res = await axiosInstance.post<ResponseData>(
        "/api/interview/answer",
        formData,
        {
          withCredentials: true,
          signal,
          headers: {
            // 인터셉터가 FormData면 자동으로 삭제 → boundary 포함 헤더 설정
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (res.data.code === "SUCCESS") return res.data;
      return rejectWithValue(res.data.message || "API 통신 오류");
    } catch (err: unknown) {
      // 타입 안전한 로깅 & 메시지 추출
      if (isAxiosError<ApiErrorBody>(err)) {
        const status = err.response?.status;
        const data = err.response?.data;
        const headers = err.response?.headers as
          | Record<string, unknown>
          | undefined;
        const reqHeaders = err.config?.headers as
          | AxiosRequestHeaders
          | undefined;

        console.error("❌ [answer:error] status:", status); // [DELETE-ME LOG]
        console.error("❌ [answer:error] data:", data); // [DELETE-ME LOG]
        console.error("❌ [answer:error] headers:", headers); // [DELETE-ME LOG]
        console.error("❌ [answer:error] reqHeaders:", reqHeaders); // [DELETE-ME LOG]

        const msg = data?.message ?? err.message ?? "다음 질문 실패";
        return rejectWithValue(msg);
      }

      if (err instanceof Error) {
        console.error("❌ [answer:error] non-axios:", err); // [DELETE-ME LOG]
        return rejectWithValue(err.message);
      }

      return rejectWithValue("다음 질문 실패");
    }
  },
);

export const endInterview = createAsyncThunk<
  EndResponse,
  EndRequestBody,
  { rejectValue: string }
>("interview/endInterview", async (body, { rejectWithValue, signal }) => {
  try {
    const res = await axiosInstance.post<EndResponse>(
      "/api/interview/end",
      body,
      { withCredentials: true, signal },
    );
    if (res.data.code === "SUCCESS") return res.data;
    return rejectWithValue(res.data.message || "면접 종료 API 오류");
  } catch (err) {
    const msg =
      (isAxiosError(err) && (err.response?.data as any)?.message) ||
      (err as Error).message ||
      "면접 종료 실패";
    return rejectWithValue(msg);
  }
});

export const submitAnswerAndMaybeEnd = createAsyncThunk<
  void,
  FormData,
  { state: { interview: InterviewState }; rejectValue: string }
>(
  "interview/submitAnswerAndMaybeEnd",
  async (formData, { dispatch, getState, rejectWithValue }) => {
    try {
      // ✅ 업로드 전의 seq = 방금 "답한" 질문 번호
      const { interview } = getState();
      const seqBefore = interview.currentSeq;
      const { interviewId, totalCount } = interview;

      // 1) 업로드 + 다음 질문 수신(로컬 상태는 위 1) 수정으로 항상 전진)
      const res = await dispatch(getNextQuestion(formData)).unwrap();

      // 2) 종료 여부 판단: 클라 개수 > 서버 keepGoing
      const shouldEnd =
        totalCount != null ? seqBefore >= totalCount : !res.data.keepGoing;

      if (shouldEnd) {
        await dispatch(
          endInterview({ interviewId, lastSeq: seqBefore }) // ✅ 마지막으로 "답한" 번호
        ).unwrap();
      }
    } catch (e: any) {
      return rejectWithValue(e?.message || "업로드/종료 처리 실패");
    }
  }
);

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    resetInterview: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // 첫 질문
      .addCase(getFirstQuestion.pending, (state, action) => {
        state.status = "pending";
        state.error = null;
        state.totalCount = action.meta.arg.count ?? null;
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
        },
      )
      .addCase(getFirstQuestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "첫 질문 가져오기 실패";
      })

      // 답변 업로드(업로드 상태) + 다음 질문(질문 상태)
      .addCase(getNextQuestion.pending, (state) => {
        state.uploadStatus = "loading"; // ✅ 업로드 상태만 로딩으로
        state.error = null;
      })
      .addCase(getNextQuestion.fulfilled, (state, action: PayloadAction<ResponseData>) => {
  state.uploadStatus = "succeeded";
  state.status = "succeeded";

  const { interviewId, newQuestion /*, keepGoing*/ } = action.payload.data;
  state.interviewId = interviewId;

  // ✅ 서버의 keepGoing 여부와 상관없이, 일단 다음 라운드로 전진
  state.currentSeq += 1;
  state.currentQuestion = newQuestion;
  state.questionHistory.push(newQuestion);
})

      .addCase(getNextQuestion.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.status = "failed";
        state.error = action.payload || "다음 질문 가져오기 실패";
      })

      // 면접 종료
      .addCase(endInterview.fulfilled, (state) => {
        state.isFinished = true; // 페이지에서 '/'로 이동
        state.lastSeqSentToEnd = state.currentSeq;
      })
      .addCase(endInterview.rejected, (state, action) => {
        state.error = action.payload || "면접 종료 실패";
      });
  },
});

export const { resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
