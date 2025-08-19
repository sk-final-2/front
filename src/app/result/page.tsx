"use client";

import AnswerFeedbackComponent from "@/components/result/AnswerFeedbackComponent";
import QuestionAnswerComponent from "@/components/result/QuestionAnswerComponent";
import QuestionListComponent from "@/components/result/QuestionListComponent";
import TotalGraphComponent from "@/components/result/TotalGraphComponent";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * 면접 결과 전역 스토어에 영상 데이터가 없는 경우
 * ㄴ>> 마이페이지에서 면접 결과 재확인하는 경우 ->> 영상 데이터 없이 축약된 페이지
 *
 * 면접 결과가 있는 경우
 * ㄴ>> 면접이 끝나고 확인하는 결과 페이지 (첫 접근) -> 영상은 저장되지 않으므로 두 번째 방문에는 표시되지 않음
 */

const ResultPage = () => {
  // 현재 선택된 질문 id
  const [currentSeq, setCurrentSeq] = useState(1);

  // 면접 결과 store
  const { count, answerAnalyses } = useAppSelector((state) => state.result);

  // 질문 상태
  const [currentQuestion, setCurrentQuestion] = useState("");

  // 질문 상태
  const [currentAnswer, setCurrentAnswer] = useState("");

  const handleCurrentSeq = (seq: number) => {
    setCurrentSeq(seq);
  };

  useEffect(() => {
    const answerAnalyse = answerAnalyses[currentSeq - 1];
    setCurrentQuestion(answerAnalyse?.question);
    setCurrentAnswer(answerAnalyse?.answer);
  }, [currentSeq, answerAnalyses]);

  // if (count == 0 || answerAnalyses.length == 0) {
  //   {
  //     /** TODO: 나중에 오류 페이지 만들어서 띄워줄 것! */
  //   }
  //   return <>오류</>;
  // }

  return (
    <div className="flex-col justify-center overflow-y-scroll overflow-x-hidden">
      <div className="w-full bg-white z-50 shadow-md fixed h-12 flex items-center px-5">
        <Link href="/">
          <Button className="cursor-pointer bg-blue-600 hover:bg-blue-700">
            메인으로 돌아가기
          </Button>
        </Link>
      </div>
      <div className="w-full h-full flex flex-col items-center justify-center mt-20">
        <div className="w-[700px]">
          {/** 질문 번호 리스트 컴포넌트 */}
          <QuestionListComponent
            seq={currentSeq}
            count={count ? count : 10}
            handleCurrentSeq={handleCurrentSeq}
          />

          {/** 질문 & 답변 컴포넌트 */}
          <QuestionAnswerComponent
            question={answerAnalyses[currentSeq - 1]?.question}
            answer={answerAnalyses[currentSeq - 1]?.answer}
          />

          {/** 답변 피드백 컴포넌트 */}
          <AnswerFeedbackComponent />

          {/** 사용자 면접 영상 + 타임 스탬프 컴포넌트 */}

          {/** 그래프 컴포넌트 */}
          <TotalGraphComponent />

          {/** 분석 리포트 컴포넌트 */}
          
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
