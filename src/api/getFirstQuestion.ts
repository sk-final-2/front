import { InterviewType, LanguageType, LevelType } from "@/app/ready/page";
import axios from "axios";

// 요청 body 형식
export type bodyData = {
  job: string;
  count: number;
  ocrText: string;
  career: string;
  interview_type: InterviewType;
  level: LevelType;
  Language: LanguageType;
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

// 첫 질문 생성 통신
const getFirstQuestion = async (
  body: bodyData,
): Promise<FirstQuestionResponse> => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/interview/first-question`,
    body,

    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    },
  );

  return response.data;
};

export default getFirstQuestion;
