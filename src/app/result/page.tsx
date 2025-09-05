"use client";

import AnswerFeedbackComponent from "@/components/result/AnswerFeedbackComponent";
import InterviewInfoComponent from "@/components/result/InterviewInfoComponent";
import InterviewVideoComponent from "@/components/result/InterviewVideoComponent";
import QuestionAnswerComponent from "@/components/result/QuestionAnswerComponent";
import QuestionListComponent from "@/components/result/QuestionListComponent";
import TotalEvaluationComponent from "@/components/result/TotalEvaluationComponent";
import TotalGraphComponent from "@/components/result/TotalGraphComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import Link from "next/link";
import { stopLoading } from "@/store/loading/loadingSlice";
import { Suspense, useEffect, useState, useMemo } from "react";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";

const ResultPage = () => {
  const {
    status,
    error,
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

  const router = useLoadingRouter();

  const [currentSeq, setCurrentSeq] = useState(1);
  const handleCurrentSeq = (seq: number) => {
    setCurrentSeq(seq);
  };

  const seqList = useMemo(() => {
    if (count && count > 0) {
      return Array.from({ length: count }, (_, i) => i + 1);
    }
    const seqs = (answerAnalyses ?? [])
      .map((a) => a?.seq)
      .filter((n): n is number => typeof n === "number");
    return Array.from(new Set(seqs)).sort((a, b) => a - b);
  }, [count, answerAnalyses]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(stopLoading());
  }, [dispatch]);

  useEffect(() => {
    if (seqList.length === 0) return;
    if (!seqList.includes(currentSeq)) {
      setCurrentSeq(seqList[0]);
    }
  }, [seqList, currentSeq]);

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <p className="text-2xl font-bold text-destructive mb-4">Error</p>
        <p>{error}</p>
        <Button onClick={() => router.push("/")}>메인으로 돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* 헤더: 그대로 */}
      <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">면접 결과</h1>
          <Button onClick={() => router.push("/")}>메인으로 돌아가기</Button>
        </div>
      </header>

      {/* 메인: 단일 컬럼으로 순서만 재배치 */}
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* 1) 면접 정보 */}
        <InterviewInfoComponent
          createdAt={createdAt}
          job={job}
          career={career}
          type={type}
          level={level}
          language={language}
        />

        {/* 2) 질문 번호 버튼 */}
        <Card className="p-4 md:p-5 border-border">
          <h2 className="text-base font-semibold mb-3">질문 목록</h2>
          <QuestionListComponent
            seq={currentSeq}
            seqList={seqList}
            handleCurrentSeq={handleCurrentSeq}
          />
        </Card>

        {/* 3) 질문 & 답변 */}
        <section className="space-y-4">
          
          <QuestionAnswerComponent
            question={answerAnalyses[currentSeq - 1]?.question}
            answer={answerAnalyses[currentSeq - 1]?.answer}
          />
        </section>

        {/* 4) 피드백 */}
        <section className="space-y-4">
          
          <AnswerFeedbackComponent
            good={answerAnalyses[currentSeq - 1]?.good}
            bad={answerAnalyses[currentSeq - 1]?.bad}
          />
        </section>

        {/* 5) 영상 (컴포넌트 내부 구조/스타일 그대로, 6) 타임스탬프는 내부에서 영상 아래에 표시됨) */}
        <Card className="p-4 md:p-5 border-border">
          <h2 className="text-base font-semibold mb-3">면접 영상</h2>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading video...</p>}>
            <InterviewVideoComponent
              interviewId={interviewId}
              currentSeq={currentSeq}
              timestamp={answerAnalyses[currentSeq - 1]?.timestamp}
            />
          </Suspense>
        </Card>

        {/* 7) 육각형 그래프 (그대로) */}
        <TotalGraphComponent
          score={avgScore[0]?.score ?? 0.0}
          emotionScore={avgScore[0]?.emotionScore ?? 0.0}
          blinkScore={avgScore[0]?.blinkScore ?? 0.0}
          eyeScore={avgScore[0]?.eyeScore ?? 0.0}
          headScore={avgScore[0]?.headScore ?? 0.0}
          handScore={avgScore[0]?.handScore ?? 0.0}
        />

        {/* 8) 최종 평가 (내용 나중 연결) */}
        <TotalEvaluationComponent />
      </main>
    </div>
  );
};

export default ResultPage;
