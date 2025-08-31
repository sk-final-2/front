"use client";

import Loading from "@/components/loading/Loading";
import DifficultyLevelComponent from "@/components/ready/DifficultyLevelComponent";
import DocumentUploadForm from "@/components/ready/DocumentUploadForm";
import InterviewTypeSelector from "@/components/ready/InterviewTypeSelector";
import JobSelectorForm from "@/components/ready/JobSelectorForm";
import LanguageSelectComponent from "@/components/ready/LanguageSelectComponent";
import QuestionCountDropdown from "@/components/ready/QuestionCountDropdown";
import ReadyStepBar from "@/components/ready/readyStepBar";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";
import {
  firstQuestionBody,
  getFirstQuestion,
} from "@/store/interview/interviewSlice";
import { stopLoading } from "@/store/loading/loadingSlice";
import { Suspense, useEffect, useState } from "react";

// 면접 형식 타입
export type InterviewType = "PERSONALITY" | "TECHNICAL" | "MIXED";

// 레벨 타입
export type LevelType = "상" | "중" | "하";

// 언어 타입
export type LanguageType = "KOREAN" | "ENGLISH";

// 동적 정적 모드 타입
export type ModeType = "STATIC" | "DYNAMIC";

const ReadyPage = () => {
  const dispatch = useAppDispatch();
  const { currentQuestion, status, error, interviewId, currentSeq } =
    useAppSelector((state) => state.interview);

  useEffect(() => {
    dispatch(stopLoading());
  }, [dispatch]);

  // 라우터 커스텀 훅
  const router = useLoadingRouter();

  // 단계 상태
  const [step, setStep] = useState(1);

  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(false);

  // 면접 형식 상태
  const [selectedType, setSelectedType] =
    useState<InterviewType>("PERSONALITY");

  // 경력 상태
  const [career, setCareer] = useState<string>("");
  // 직군 상태
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // 세부직군 상태
  const [selectedJob, setSelectedJob] = useState<string>("");

  // 파일 상태
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  // 파일 요약 상태
  const [fileText, setFileText] = useState<string>("");

  // 질문 갯수 상태
  const [questionCount, setQuestionCount] = useState<number>(3);
  // 동적 정적 모드 상태
  const [interviewMode, setInterviewMode] = useState<ModeType>("DYNAMIC");

  // 난이도 상태
  const [difficulty, setDifficulty] = useState<LevelType>("중");

  // 언어 상태
  const [language, setLanguage] = useState<LanguageType>("KOREAN");

  // 단계 변경 핸들러
  const handleChangeStep = (step: number) => {
    setStep(step);
  };

  // 로딩 변경 핸들러
  const handleLoading = (loading: boolean) => {
    setLoading(loading);
  };

  // 면접 형식 변경 핸들러
  const handleTypeChange = (type: InterviewType) => {
    setSelectedType(type);
  };

  // 직군 변경 핸들러
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedJob("");
  };

  // 세부 직군 변경 핸들러
  const handleJobChange = (job: string) => {
    setSelectedJob(job);
  };

  // 경력 변경 핸들러
  const handleCareerChange = (career: string) => {
    setCareer(career);
  };

  // 파일 업로드 핸들러
  const handleUploadComplete = (file: File) => {
    setUploadedFile(file);
  };

  // 파일 요약문 핸들러
  const handleFileText = (fileText: string) => {
    setFileText(fileText);
  };

  // 질문 갯수 핸들러
  const handleQuestionCount = (questionCount: number) => {
    setQuestionCount(questionCount);
  };

  // 난이도 변경 핸들러
  const handleDifficultyLevel = (difficulty: LevelType) => {
    setDifficulty(difficulty);
  };

  // 언어 변경 핸들러
  const handleLanguageChange = (language: LanguageType) => {
    setLanguage(language);
  };

  // 다음 단계 버튼 핸들러
  const nextStepHandler = () => {
    // 현재 단계에서 유효성 검사를 추가할 수 있습니다
    if (step < 5) {
      setStep((prev) => prev + 1);
    }
  };

  // 이전 단계 버튼 핸들러
  const prevStepHandler = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  // 페이지 이동을 처리하는 useEffect
  useEffect(() => {
    // API 호출이 성공적으로 완료되었고, interviewId가 존재할 때 실행됩니다.
    if (status === "succeeded" && interviewId) {
      const responseData = {
        interviewId,
        question: currentQuestion,
        seq: currentSeq,
      };
      console.log(responseData);

      router.replace(`/media-check`);
    }
  }, [status, interviewId, currentQuestion, currentSeq, error, router]);

  // 면접 페이지로 이동하는 핸들러
  const goToInterviewPage = async () => {
    if (selectedCategory === "" || selectedJob === "" || career === "") {
      handleChangeStep(2);
      alert("직군과 경력을 입력해주세요.");
      return;
    }
    // 첫 질문 생성 요청
    try {
      // body 데이터
      const bodyData: firstQuestionBody = {
        job: selectedJob,
        count: Number(questionCount),
        ocrText: fileText ? fileText : "",
        career: career,
        interviewType: selectedType,
        level: difficulty,
        language: language,
        seq: 1,
      };

      dispatch(getFirstQuestion(bodyData));
    } catch (error) {
      console.error(error);
    }
  };

  // 현재 단계에 맞는 컴포넌트를 렌더링하는 함수
  const renderStepComponent = () => {
    switch (step) {
      case 1:
        return (
          <InterviewTypeSelector
            handleTypeChange={handleTypeChange}
            selectedType={selectedType}
          />
        );

      // 면접 형식 컨테이너
      case 2:
        return (
          <JobSelectorForm
            selectedCategory={selectedCategory}
            selectedJob={selectedJob}
            career={career}
            onCategoryChange={handleCategoryChange}
            onJobChange={handleJobChange}
            onCareerChange={handleCareerChange}
          />
        );
      case 3:
        return (
          <div className="flex flex-col gap-4 items-center">
            {/** 동적 or 정적(질문 수 설정) 선택 */}
            <div className="flex flex-row gap-5 flex-1 min-w-lg min-h-25 mb-4">
              <div
                className={`flex items-center justify-center flex-1 rounded-xl border-2 border-solid cursor-pointer transition duration-200 ${
                  interviewMode === "STATIC"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background"
                }`}
                key={"STATIC"}
                onClick={() => {
                  setInterviewMode("STATIC");
                  setQuestionCount(3);
                }}
              >
                정적 모드
              </div>
              <div
                className={`flex items-center justify-center flex-1 rounded-xl border-2 border-solid cursor-pointer transition duration-200 ${
                  interviewMode === "DYNAMIC"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background"
                }`}
                key={"DYNAMIC"}
                onClick={() => {
                  setInterviewMode("DYNAMIC");
                  setQuestionCount(0);
                }}
              >
                동적 모드
              </div>
            </div>
            {/** 정적 모드인 경우에만 질문 수 드롭 다운 생성 */}
            {interviewMode === "STATIC" ? (
              <QuestionCountDropdown
                selectedCount={questionCount}
                onCountChange={handleQuestionCount}
              />
            ) : (
              <></>
            )}

            {/** 난이도 설정 컴포넌트 */}
            <DifficultyLevelComponent
              difficulty={difficulty}
              handleDifficultyLevel={handleDifficultyLevel}
            />
          </div>
        );
      case 4:
        return (
          <div className="w-4/6">
            {/** 언어 선택 (한국어, 영어) */}
            <LanguageSelectComponent
              language={language}
              handleLanguageChange={handleLanguageChange}
            />
          </div>
        );
      case 5:
        return (
          <DocumentUploadForm
            uploadedFile={uploadedFile}
            onUploadComplete={handleUploadComplete}
            handleFileText={handleFileText}
            loading={loading}
            handleLoading={handleLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Suspense fallback={<Loading message="페이지 불러오는 중..." />}>
      <div className="w-screen bg-background flex flex-col items-center h-screen overflow-y-auto">
        {/** 준비 단계 바 */}
        <ReadyStepBar step={step} handleChangeStep={handleChangeStep} />

        {/** 폼 컨테이너 */}
        <div className="container min-w-xl flex flex-grow flex-col justify-center items-center gap-5">
          {renderStepComponent()}
        </div>

        {/** 이전, 다음 버튼 */}
        <div className="flex w-full max-w-lg justify-between py-10 px-4">
          {step !== 1 ? (
            <Button
              className="flex items-center gap-1 px-4 py-2 cursor-pointer font-semibold tracking-widest rounded-md duration-300 hover:gap-2"
              onClick={prevStepHandler}
            >
              이전
            </Button>
          ) : (
            <div />
          )}

          {step !== 5 ? (
            <Button
              className="flex items-center gap-1 px-4 py-2 cursor-pointer font-semibold tracking-widest rounded-md duration-300 hover:gap-2"
              onClick={nextStepHandler}
            >
              다음
            </Button>
          ) : (
            <button
              className="flex items-center bg-green-500 text-white gap-1 px-4 py-2 cursor-pointer font-semibold tracking-widest rounded-md hover:bg-green-600 duration-300
            disabled:bg-gray-400"
              onClick={goToInterviewPage}
              disabled={loading}
            >
              {loading ? "파일 업로드 중..." : "카메라&마이크 테스트"}
            </button>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default ReadyPage;
