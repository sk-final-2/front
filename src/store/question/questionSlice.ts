import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface QuestionState {
  question: string;
}

const initialState: QuestionState = {
  question: "",
};

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    // 질문 수정 액션
    modify: (state, action: PayloadAction<string>) => {
      state.question = action.payload;
    },
  },
});

export const { modify } = questionSlice.actions;

export default questionSlice.reducer;
