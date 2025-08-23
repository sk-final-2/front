"use client";

import AnswerFeedbackComponent from "@/components/result/AnswerFeedbackComponent";
import InterviewInfoComponent from "@/components/result/InterviewInfoComponent";
import InterviewVideoComponent from "@/components/result/InterviewVideoComponent";
import QuestionAnswerComponent from "@/components/result/QuestionAnswerComponent";
import QuestionListComponent from "@/components/result/QuestionListComponent";
import TotalEvaluationComponent from "@/components/result/TotalEvaluationComponent";
import TotalGraphComponent from "@/components/result/TotalGraphComponent";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { getInterviewResult } from "@/store/interview/resultSlice";
import Link from "next/link";
import { Suspense, useEffect, useState, useMemo } from "react";

/**
 * 면접 결과 전역 스토어에 영상 데이터가 없는 경우
 * ㄴ>> 마이페이지에서 면접 결과 재확인하는 경우 ->> 영상 데이터 없이 축약된 페이지
 *
 * 면접 결과가 있는 경우
 * ㄴ>> 면접이 끝나고 확인하는 결과 페이지 (첫 접근) -> 영상은 저장되지 않으므로 두 번째 방문에는 표시되지 않음
 */

const ResultPage = () => {
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

  const { interviewId } = useAppSelector((state) => state.interview);

  // 현재 선택된 질문 id
  const [currentSeq, setCurrentSeq] = useState(1);
  const handleCurrentSeq = (seq: number) => {
    setCurrentSeq(seq);
  };

  // if (status === "failed" ) {
  //   {
  //     /** TODO: 나중에 오류 페이지 만들어서 띄워줄 것! */
  //   }
  //   return <>{error}</>;
  // }

  // ✅ 번호 리스트 생성 로직
  const seqList = useMemo(() => {
    // 정적: count가 양수면 1..count
    if (count && count > 0) {
      return Array.from({ length: count }, (_, i) => i + 1);
    }

    // 동적: answerAnalyses의 seq 기반 (결과가 없으면 빈 배열)
    const seqs = (answerAnalyses ?? [])
      .map((a) => a?.seq)
      .filter((n): n is number => typeof n === "number");
    // 유니크 + 정렬
    return Array.from(new Set(seqs)).sort((a, b) => a - b);
  }, [count, answerAnalyses]);

  // ✅ 현재 선택된 seq가 리스트 범위를 벗어나지 않도록 클램프
  useEffect(() => {
    if (seqList.length === 0) return;
    if (!seqList.includes(currentSeq)) {
      setCurrentSeq(seqs => (seqList.includes(seqs) ? seqs : seqList[0]));
    }
  }, [seqList, currentSeq]);

  // 현재 seq에 해당하는 분석 찾기 (동적에서도 안전)
  const currentAnalysis = useMemo(() => {
    if (!answerAnalyses || answerAnalyses.length === 0) return undefined;
    // 우선 seq로 찾고, 없으면 인덱스 폴백
    return (
      answerAnalyses.find((a) => a?.seq === currentSeq) ||
      answerAnalyses[seqList.indexOf(currentSeq)]
    );
  }, [answerAnalyses, currentSeq, seqList]);

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
            seqList={seqList}
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
          <Suspense fallback={<p>Loading video...</p>}>
            <InterviewVideoComponent
              interviewId={interviewId}
              currentSeq={currentSeq}
              timestamp={answerAnalyses[currentSeq - 1]?.timestamp}
            />
          </Suspense>

          {/** 그래프 컴포넌트 */}
          <TotalGraphComponent
            score={avgScore[0]?.score ? avgScore[0].score : 0.0}
            emotionScore={
              avgScore[0]?.emotionScore ? avgScore[0].emotionScore : 0.0
            }
            blinkScore={avgScore[0]?.blinkScore ? avgScore[0].blinkScore : 0.0}
            eyeScore={avgScore[0]?.eyeScore ? avgScore[0].eyeScore : 0.0}
            headScore={avgScore[0]?.headScore ? avgScore[0].headScore : 0.0}
            handScore={avgScore[0]?.handScore ? avgScore[0].handScore : 0.0}
          />

          {/** 분석 리포트 컴포넌트 */}
          <TotalEvaluationComponent />
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
