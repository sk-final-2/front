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
        <Button className="cursor-pointer" onClick={() => router.push("/")}>
          메인으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-secondary min-h-screen">
      <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold">면접 결과</h1>
          <Button className="cursor-pointer" onClick={() => router.push("/")}>
            메인으로 돌아가기
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <InterviewInfoComponent
            createdAt={createdAt}
            job={job}
            career={career}
            type={type}
            level={level}
            language={language}
          />

          <span>질문 및 답변</span>
          <QuestionAnswerComponent
            question={answerAnalyses[currentSeq - 1]?.question}
            answer={answerAnalyses[currentSeq - 1]?.answer}
          />

          <span>답변 피드백</span>
          <AnswerFeedbackComponent
            good={answerAnalyses[currentSeq - 1]?.good}
            bad={answerAnalyses[currentSeq - 1]?.bad}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24">
          <Card>
            <CardHeader>
              <CardTitle>질문 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionListComponent
                seq={currentSeq}
                seqList={seqList}
                handleCurrentSeq={handleCurrentSeq}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>면접 영상</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<p>Loading video...</p>}>
                <InterviewVideoComponent
                  interviewId={interviewId}
                  currentSeq={currentSeq}
                  timestamp={answerAnalyses[currentSeq - 1]?.timestamp}
                />
              </Suspense>
            </CardContent>
          </Card>

          <TotalGraphComponent
            score={avgScore[0]?.score ?? 0.0}
            emotionScore={avgScore[0]?.emotionScore ?? 0.0}
            blinkScore={avgScore[0]?.blinkScore ?? 0.0}
            eyeScore={avgScore[0]?.eyeScore ?? 0.0}
            headScore={avgScore[0]?.headScore ?? 0.0}
            handScore={avgScore[0]?.handScore ?? 0.0}
          />

          {/* <TotalEvaluationComponent /> */}
        </div>
      </main>
    </div>
  );
};

export default ResultPage;
