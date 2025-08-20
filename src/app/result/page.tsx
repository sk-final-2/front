"use client";

import AnswerFeedbackComponent from "@/components/result/AnswerFeedbackComponent";
import InterviewInfoComponent from "@/components/result/InterviewInfoComponent";
import InterviewVideoComponent from "@/components/result/InterviewVideoComponent";
import QuestionAnswerComponent from "@/components/result/QuestionAnswerComponent";
import QuestionListComponent from "@/components/result/QuestionListComponent";
import TotalEvaluationComponent from "@/components/result/TotalEvaluationComponent";
import TotalGraphComponent from "@/components/result/TotalGraphComponent";
import SpeechComponent from "@/components/tts/TTSComponent";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { getInterviewResult } from "@/store/interview/resultSlice";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * 면접 결과 전역 스토어에 영상 데이터가 없는 경우
 * ㄴ>> 마이페이지에서 면접 결과 재확인하는 경우 ->> 영상 데이터 없이 축약된 페이지
 *
 * 면접 결과가 있는 경우
 * ㄴ>> 면접이 끝나고 확인하는 결과 페이지 (첫 접근) -> 영상은 저장되지 않으므로 두 번째 방문에는 표시되지 않음
 */

const ResultPage = ({ interviewId }: { interviewId: string }) => {
  // 면접 결과 store
  const {
    status,
    error,
    uuid,
    memberId,
    createdAt,
    job,
    career,
    type,
    level,
    language,
    count,
    answerAnalyses,
    avgScore,
  } = useAppSelector((state) => state.result);
  const dispatch = useAppDispatch();

  // 로딩 상태
  const [loading, setLoading] = useState(true);

  // 현재 선택된 질문 id
  const [currentSeq, setCurrentSeq] = useState(1);

  const handleCurrentSeq = (seq: number) => {
    setCurrentSeq(seq);
  };

  useEffect(() => {
    try {
      setLoading(true);
      // 결과 받기
      dispatch(getInterviewResult({ interviewId }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    {
      /** TODO: 로딩 처리 */
    }
    return <>로딩중...</>;
  }

  // if (status === "failed") {
  //   {
  //     /** TODO: 나중에 오류 페이지 만들어서 띄워줄 것! */
  //   }
  //   return <>{error}</>;
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
          {/** 면접 정보 컴포넌트 */}
          <InterviewInfoComponent
            createdAt={createdAt}
            job={job}
            career={career}
            type={type}
            level={level}
            language={language}
          />

          {/** 질문 번호 리스트 컴포넌트 */}
          <QuestionListComponent
            seq={currentSeq}
            count={count ? count : 0}
            handleCurrentSeq={handleCurrentSeq}
          />

          {/** 질문 & 답변 컴포넌트 */}
          <QuestionAnswerComponent
            question={answerAnalyses[currentSeq - 1]?.question}
            answer={answerAnalyses[currentSeq - 1]?.answer}
          />

          {/** 답변 피드백 컴포넌트 */}
          <AnswerFeedbackComponent
            good={answerAnalyses[currentSeq - 1]?.good}
            bad={answerAnalyses[currentSeq - 1]?.bad}
          />

          {/** 사용자 면접 영상 + 타임 스탬프 컴포넌트 */}
          <InterviewVideoComponent />

          {/** 그래프 컴포넌트 */}
          <TotalGraphComponent
            score={avgScore[0].score}
            emotionScore={avgScore[0].emotionScore}
            blinkScore={avgScore[0].blinkScore}
            eyeScore={avgScore[0].eyeScore}
            headScore={avgScore[0].headScore}
            handScore={avgScore[0].handScore}
          />

          {/** 분석 리포트 컴포넌트 */}
          <TotalEvaluationComponent />

          {/** TTS 테스트 컴포넌트 */}
          <SpeechComponent
            text={
              "협업을 해야 하는 과제와 혼자 해야 하는 과제가 이렇게 있다고 하였을 때 지원자님께서 더 선호하시는 과제는 무엇인지 이유와 함께 설명해 주십시오"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
