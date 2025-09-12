"use client";

import AuthAlertDialog from "@/app/auth/AuthAlertDialog";
import AnswerEvaluateBarChart from "@/components/result/AnswerEvaluateBarChart";
import TotalGraphComponent from "@/components/result/TotalGraphComponent";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";
import { stopLoading } from "@/store/loading/loadingSlice";
import { House } from "lucide-react";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import {
  Briefcase,
  BriefcaseBusiness,
  User,
  Languages,
  ArrowUpRight,
  ListOrdered,
} from "lucide-react";

const Item = ({
  icon,
  label,
  value,
  tone = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null;
  tone?: "primary" | "success";
}) => {
  const toneBg =
    tone === "success"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-blue-50 text-blue-600";
  return (
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${toneBg}`}>{icon}</div>
      <div className="ml-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ?? "-"}</p>
      </div>
    </div>
  );
};

export default function UserInterviewResultPage({
  params,
}: {
  params: Promise<{ interviewId: string }>;
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
  const resolveParams = use(params);
  const { interviewId } = resolveParams;

  // 면접 결과 리스트
  const { interviews } = useAppSelector((state) => state.user_details);

  // 현재 선택된 면접 상태
  const [currentInterviewIndex, setCurrentInterviewIndex] = useState<number>(1);

  // 면접 결과 받아오기
  useEffect(() => {
    const currentIndex = interviews.findIndex(
      (item) => item.uuid == interviewId,
    );
    setCurrentInterviewIndex(currentIndex);

    dispatch(stopLoading());
  }, [dispatch, interviews, interviewId]);

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
              {interviews[currentInterviewIndex]?.answerAnalyses.map((item) => (
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
          <div className="mt-10">
            <div className="grid grid-cols-2 grid-rows-2 grid-flow-col gap-16">
              <Card className="m-10 w-full border-border row-span-2">
                <CardContent className="pl-10">
                  <div className="flex flex-col row-span-1">
                    <div className="text-2xl text-left font-bold mb-5">
                      면접 정보
                    </div>
                    <div className="py-5 space-y-8">
                      <Item
                        icon={<Briefcase className="w-5 h-5" />}
                        label="지원 직무"
                        value={interviews[currentInterviewIndex]?.job}
                        tone="primary"
                      />
                      <Item
                        icon={<BriefcaseBusiness className="w-5 h-5" />}
                        label="경력"
                        value={interviews[currentInterviewIndex]?.career}
                        tone="success"
                      />
                      <Item
                        icon={<User className="w-5 h-5" />}
                        label="면접 유형"
                        value={interviews[currentInterviewIndex]?.type}
                        tone="primary"
                      />
                      <Item
                        icon={<ArrowUpRight className="w-5 h-5" />}
                        label="난이도"
                        value={interviews[currentInterviewIndex]?.level}
                        tone="success"
                      />
                      <Item
                        icon={<Languages className="w-5 h-5" />}
                        label="언어"
                        value={interviews[currentInterviewIndex]?.language}
                        tone="primary"
                      />
                      <Item
                        icon={<ListOrdered className="w-5 h-5" />}
                        label="질문 수"
                        value={interviews[currentInterviewIndex]?.count}
                        tone="success"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/** 그래프 컴포넌트 */}
              <div className="w-full row-span-2">
                <TotalGraphComponent
                  avgScore={interviews[currentInterviewIndex]?.avgScore[0]}
                  answerScore={
                    interviews[currentInterviewIndex]?.answerAnalyses[
                      currentQuestionIndex - 1
                    ]
                  }
                />
              </div>
            </div>

            {/** 답변 분석 결과 */}
            <div className="mt-5 mb-20 flex flex-col">
              <Card className="ml-10 border-border">
                <CardContent>
                  <div className="flex flex-col">
                    <span className="text-2xl font-semibold mb-6">
                      답변 분석 결과
                    </span>
                    <div className="flex flex-col gap-6">
                      {/* 질문 */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2">질문</h3>
                        <p className="text-foreground bg-muted rounded-lg p-4">
                          {interviews[currentInterviewIndex]?.answerAnalyses[
                            currentQuestionIndex - 1
                          ]?.question || "질문이 없습니다."}
                        </p>
                      </div>

                      {/* 답변 */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2">답변</h3>
                        <p className="text-foreground bg-primary/10 rounded-lg p-4 leading-relaxed">
                          {interviews[currentInterviewIndex]?.answerAnalyses[
                            currentQuestionIndex - 1
                          ]?.answer || "답변이 없습니다."}
                        </p>
                      </div>

                      {/* 피드백 */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2">피드백</h3>
                        <p className="text-foreground bg-muted rounded-lg p-4">
                          {interviews[currentInterviewIndex]?.answerAnalyses[
                            currentQuestionIndex - 1
                          ]?.good || "피드백이 없습니다."}
                        </p>
                      </div>

                      {/* 개선점 */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2">개선점</h3>
                        <p className="text-foreground bg-primary/10 rounded-lg p-4">
                          {interviews[currentInterviewIndex]?.answerAnalyses[
                            currentQuestionIndex - 1
                          ]?.bad || "개선점이 없습니다."}
                        </p>
                      </div>

                      {/* 감정 평가 */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2">감정 평가</h3>
                        <p className="text-foreground bg-muted rounded-lg p-4">
                          {interviews[currentInterviewIndex]?.answerAnalyses[
                            currentQuestionIndex - 1
                          ]?.emotionText || "감정 평가 없음"}
                        </p>
                      </div>

                      {/* 동작 감지 */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2">동작 감지</h3>
                        <p className="text-foreground bg-primary/10 rounded-lg p-4">
                          {interviews[currentInterviewIndex]?.answerAnalyses[
                            currentQuestionIndex - 1
                          ]?.mediapipeText || "동작 감지 없음"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/** Bar Chart 답변 점수 */}
              <AnswerEvaluateBarChart
                score={
                  interviews[currentInterviewIndex]?.answerAnalyses[
                    currentQuestionIndex - 1
                  ]?.score
                    ? interviews[currentInterviewIndex]?.answerAnalyses[
                        currentQuestionIndex - 1
                      ].score
                    : 0.0
                }
                emotionScore={
                  interviews[currentInterviewIndex]?.answerAnalyses[
                    currentQuestionIndex - 1
                  ]?.emotionScore
                    ? interviews[currentInterviewIndex]?.answerAnalyses[
                        currentQuestionIndex - 1
                      ].emotionScore
                    : 0.0
                }
                blinkScore={
                  interviews[currentInterviewIndex]?.answerAnalyses[
                    currentQuestionIndex - 1
                  ]?.blinkScore
                    ? interviews[currentInterviewIndex]?.answerAnalyses[
                        currentQuestionIndex - 1
                      ].blinkScore
                    : 0.0
                }
                eyeScore={
                  interviews[currentInterviewIndex]?.answerAnalyses[
                    currentQuestionIndex - 1
                  ]?.eyeScore
                    ? interviews[currentInterviewIndex]?.answerAnalyses[
                        currentQuestionIndex - 1
                      ].eyeScore
                    : 0.0
                }
                headScore={
                  interviews[currentInterviewIndex]?.answerAnalyses[
                    currentQuestionIndex - 1
                  ]?.headScore
                    ? interviews[currentInterviewIndex]?.answerAnalyses[
                        currentQuestionIndex - 1
                      ].headScore
                    : 0.0
                }
                handScore={
                  interviews[currentInterviewIndex]?.answerAnalyses[
                    currentQuestionIndex - 1
                  ]?.handScore
                    ? interviews[currentInterviewIndex]?.answerAnalyses[
                        currentQuestionIndex - 1
                      ].handScore
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
