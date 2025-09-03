"use client";

import AuthAlertDialog from "@/app/auth/AuthAlertDialog";
import AnswerEvaluateBarChart from "@/components/result/AnswerEvaluateBarChart";
import TotalGraphComponent from "@/components/result/TotalGraphComponent";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";
import { stopLoading } from "@/store/loading/loadingSlice";
import { getUserInterview } from "@/store/user-details/userDetailsSlice";
import { House } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function UserInterviewResultPage({
  params,
}: {
  params: string;
}) {
  // 로딩 라우터
  const router = useLoadingRouter();
  const dispatch = useAppDispatch();

  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const [showLoginAlert, setShowLoginAlert] = useState<boolean>(false);

  useEffect(() => {
    dispatch(stopLoading());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginAlert(true);
    }
  }, [router, isLoggedIn]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsSidebarCollapsed(window.innerWidth < 1024);
    };

    checkScreenWidth();

    window.addEventListener("resize", checkScreenWidth);

    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);

  const sidebarWidth = isSidebarCollapsed ? "w-20" : "w-64";

  // interviewId 받아오기
  const interviewId = params;

  // 면접 결과 리스트
  const { interview } = useAppSelector((state) => state.user_details);

  // 면접 결과 받아오기
  useEffect(() => {
    dispatch(getUserInterview({ interviewId }));
    dispatch(stopLoading());
  }, [dispatch, interviewId]);

  // 현재 선택된 질문
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);

  return (
    <div>
      <div
        className={`
        flex flex-row
        bg-background
        min-w-[1200px]
        min-h-screen
      `}
      >
        {/** 로그인 필요 경고창 */}
        <AuthAlertDialog
          showLoginAlert={showLoginAlert}
          setShowLoginAlert={setShowLoginAlert}
        />

        {/** 커스텀 사이드 바 */}
        <div
          className={`
                fixed
                bg-background h-screen
                ${sidebarWidth}
                md:block
                transition-all duration-300 ease-in-out
                border-[1px] border-border z-10
                overflow-y-auto
            `}
        >
          <div className={`flex justify-center mt-5`}>
            {isSidebarCollapsed ? (
              <House className="h-[2.5rem] w-[2.5rem] p-2 rounded-2xl cursor-pointer hover:bg-muted"></House>
            ) : (
              <Image
                src="/REAI.png"
                alt="icon"
                width={60}
                height={20}
                onClick={() => router.push("/")}
                className="cursor-pointer bg-transparent"
              ></Image>
            )}
          </div>

          {/** 네비게이션 메뉴 리스트 */}
          <div className="w-full h-full mt-10">
            <div className=" h-full w-full">
              {interview?.answerAnalyses.map((item) => (
                <div
                  className={`h-14 w-full
                    font-semibold
                    mt-4 text-center flex justify-center items-center
                    cursor-pointer rounded-xl transition-all duration-200 ${
                      currentQuestionIndex == item.seq
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  key={item.seq}
                  onClick={() => setCurrentQuestionIndex(item.seq)}
                >
                  {isSidebarCollapsed ? (
                    <span>{item.seq}</span>
                  ) : (
                    <span className="p-2 truncate">{item.question}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`
            h-screen w-5xl transition-all duration-200 ease-in-out
            ${isSidebarCollapsed ? "ml-20" : "ml-64"}`}
        >
          {/** 면접 정보 */}
          <div className="mt-20">
            <div className="grid grid-cols-2 grid-rows-2 grid-flow-col gap-16">
              <Card className="m-10 w-full border-border row-span-2">
                <CardContent className="pl-10">
                  <div className="flex flex-col row-span-1">
                    <div className="text-2xl text-center font-bold mb-5">
                      면접 정보
                    </div>
                    <div className="text-lg font-semibold mb-2">
                      직무: {interview?.job}
                    </div>
                    <div className="text-lg font-semibold mb-2">
                      경력: {interview?.career}
                    </div>
                    <div className="text-lg font-semibold mb-2">
                      유형: {interview?.type}
                    </div>
                    <div className="text-lg font-semibold mb-2">
                      난이도: {interview?.level}
                    </div>
                    <div className="text-lg font-semibold mb-2">
                      언어: {interview?.language}
                    </div>
                    <div className="text-lg font-semibold mb-2">
                      질문 수: {interview?.count}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/** 그래프 컴포넌트 */}
              <div className="w-full row-span-2">
                <TotalGraphComponent
                  score={
                    interview?.avgScore[0]?.score
                      ? interview?.avgScore[0].score
                      : 0.0
                  }
                  emotionScore={
                    interview?.avgScore[0]?.emotionScore
                      ? interview?.avgScore[0].emotionScore
                      : 0.0
                  }
                  blinkScore={
                    interview?.avgScore[0]?.blinkScore
                      ? interview?.avgScore[0].blinkScore
                      : 0.0
                  }
                  eyeScore={
                    interview?.avgScore[0]?.eyeScore
                      ? interview?.avgScore[0].eyeScore
                      : 0.0
                  }
                  headScore={
                    interview?.avgScore[0]?.headScore
                      ? interview?.avgScore[0].headScore
                      : 0.0
                  }
                  handScore={
                    interview?.avgScore[0]?.handScore
                      ? interview?.avgScore[0].handScore
                      : 0.0
                  }
                />
              </div>
            </div>

            {/** 답변 분석 결과 */}
            <div className="mt-5 mb-20 flex flex-col">
              <Card className="ml-10 border-border">
                <CardContent>
                  <div className="flex flex-col">
                    <span className="text-2xl font-semibold text-primary">
                      답변 분석 결과
                    </span>
                    <div className="mt-5 flex flex-col gap-4">
                      <div>
                        질문 :{" "}
                        <span className="font-semibold">
                          {
                            interview?.answerAnalyses[currentQuestionIndex - 1]
                              .question
                          }
                        </span>
                      </div>
                      <div>
                        답변 :{" "}
                        <span className="font-semibold">
                          {
                            interview?.answerAnalyses[currentQuestionIndex - 1]
                              .answer
                          }
                        </span>
                      </div>
                      <div>
                        피드백 :{" "}
                        <span className="font-semibold">
                          {
                            interview?.answerAnalyses[currentQuestionIndex - 1]
                              .good
                          }
                        </span>
                      </div>
                      <div>
                        개선점 :{" "}
                        <span className="font-semibold">
                          {
                            interview?.answerAnalyses[currentQuestionIndex - 1]
                              .bad
                          }
                        </span>
                      </div>
                      <div>
                        감정 평가 :{" "}
                        <span className="font-semibold">
                          {
                            interview?.answerAnalyses[currentQuestionIndex - 1]
                              .emotionText
                          }
                        </span>
                      </div>
                      <div>
                        말투 평가 :{" "}
                        <span className="font-semibold">
                          {
                            interview?.answerAnalyses[currentQuestionIndex - 1]
                              .mediapipeText
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/** Bar Chart 답변 점수 */}
              <AnswerEvaluateBarChart
                score={
                  interview?.answerAnalyses[currentQuestionIndex - 1].score
                    ? interview?.answerAnalyses[currentQuestionIndex - 1].score
                    : 0.0
                }
                emotionScore={
                  interview?.answerAnalyses[currentQuestionIndex - 1]
                    .emotionScore
                    ? interview?.answerAnalyses[currentQuestionIndex - 1]
                        .emotionScore
                    : 0.0
                }
                blinkScore={
                  interview?.answerAnalyses[currentQuestionIndex - 1].blinkScore
                    ? interview?.answerAnalyses[currentQuestionIndex - 1]
                        .blinkScore
                    : 0.0
                }
                eyeScore={
                  interview?.answerAnalyses[currentQuestionIndex - 1].eyeScore
                    ? interview?.answerAnalyses[currentQuestionIndex - 1]
                        .eyeScore
                    : 0.0
                }
                headScore={
                  interview?.answerAnalyses[currentQuestionIndex - 1].headScore
                    ? interview?.answerAnalyses[currentQuestionIndex - 1]
                        .headScore
                    : 0.0
                }
                handScore={
                  interview?.answerAnalyses[currentQuestionIndex - 1].handScore
                    ? interview?.answerAnalyses[currentQuestionIndex - 1]
                        .handScore
                    : 0.0
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
