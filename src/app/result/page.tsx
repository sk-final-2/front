"use client";

import AnswerFeedbackComponent from "@/components/result/AnswerFeedbackComponent";
import InterviewInfoComponent from "@/components/result/InterviewInfoComponent";
import InterviewVideoComponent from "@/components/result/InterviewVideoComponent";
import QuestionAnswerComponent from "@/components/result/QuestionAnswerComponent";
import QuestionListComponent from "@/components/result/QuestionListComponent";
import TotalGraphComponent from "@/components/result/TotalGraphComponent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { stopLoading } from "@/store/loading/loadingSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Suspense, useEffect, useState, useMemo } from "react";

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

  const [openConfirm, setOpenConfirm] = useState(false);

  // ✅ 메인으로 이동 (새로고침 + 뒤로가기 방지)
  const goHomeWithHardReload = () => {
    /**
     * TODO: 영상 삭제 요청 API 호출 {process.env.NEXT_PUBLIC_API_URL}/api/interview/media/ack post
     * @params { interviewId: string }
     */

    // 필요시 Redux 정리 로직이 있으면 여기서 dispatch(...)
    window.location.replace("/"); // 히스토리 대체 + 풀 리로드
  };

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

  // ✅ 뒤로가기(popstate) 발생 시 메인으로 강제 새로고침 이동
  useEffect(() => {
    // 🔹 이 줄이 핵심: 더미 히스토리 한 번 쌓기
    history.pushState(null, "", location.href);

    const onPopState = () => {
      // 강제 새로고침 + 히스토리 덮기
      window.location.replace("/");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <p className="text-2xl font-bold text-destructive mb-4">Error</p>
        <p>{error}</p>
        <Button onClick={() => setOpenConfirm(true)}>메인으로 돌아가기</Button>
        <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>메인으로 이동</AlertDialogTitle>
              <AlertDialogDescription>
                메인으로 이동하면 결과 페이지로 되돌아올 수 없어요. 이동할까요?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={goHomeWithHardReload}>
                이동
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* 헤더: 그대로 */}
      <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">면접 결과</h1>
          <Button onClick={() => setOpenConfirm(true)}>
            메인으로 돌아가기
          </Button>
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
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Loading video...</p>
            }
          >
            <InterviewVideoComponent
              interviewId={interviewId}
              currentSeq={currentSeq}
              timestamp={answerAnalyses[currentSeq - 1]?.timestamp}
            />
          </Suspense>
        </Card>

        {/* 7) 육각형 그래프 (그대로) */}
        <TotalGraphComponent
          avgScore={avgScore[0]}
          answerScore={answerAnalyses[currentSeq - 1]}
        />

        {/* 8) 최종 평가 (내용 나중 연결) */}
        {/* <TotalEvaluationComponent /> */}
      </main>

      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>메인으로 이동</AlertDialogTitle>
            <AlertDialogDescription>
              메인으로 이동하면 결과 페이지로 되돌아올 수 없어요. 이동할까요?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={goHomeWithHardReload}>
              이동
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResultPage;
