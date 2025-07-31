"use client";

import CameraMicCheck from "@/components/interview/CameraMicCheck";
import DocumentUploadForm from "@/components/interview/DocumentUploadForm";
import JobSelectorForm from "@/components/interview/JobSelectorForm";
import QuestionCountDropdown from "@/components/interview/QuestionCountDropdown";
import ReadyStepBar from "@/components/interview/readyStepBar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ReadyPage = () => {
  // 리다이렉션 라우터
  const router = useRouter();

  // 단계 상태
  const [step, setStep] = useState(1);

  // 직군 상태
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // 세부직군 상태
  const [selectedJob, setSelectedJob] = useState<string>("");

  // 파일 상태
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // 질문 갯수 상태
  const [questionCount, setQuestionCount] = useState<number>(3);

  // 파일 상세 정보 확인 useEffect
  useEffect(() => {
    if (uploadedFile) {
      console.log(uploadedFile.name);
      console.log(uploadedFile.type);
    }
  }, [uploadedFile]);

  // 단계 변경 핸들러
  const handleChangeStep = (step: number) => {
    setStep(step);
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

  // 파일 업로드 핸들러
  const handleUploadComplete = (file: File) => {
    setUploadedFile(file);
  };

  // 질문 갯수 핸들러
  const handleQuestionCount = (questionCount: number) => {
    setQuestionCount(questionCount);
  }

  // 다음 단계 버튼 핸들러
  const nextStepHandler = () => {
    // 현재 단계에서 유효성 검사를 추가할 수 있습니다
    if (step < 3) {
      setStep((prev) => prev + 1);
    }
  };

  // 이전 단계 버튼 핸들러
  const prevStepHandler = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  // 현재 단계에 맞는 컴포넌트를 렌더링하는 함수
  const renderStepComponent = () => {
    switch (step) {
      case 1:
        return (
          <JobSelectorForm
            selectedCategory={selectedCategory}
            selectedJob={selectedJob}
            onCategoryChange={handleCategoryChange}
            onJobChange={handleJobChange}
          />
        );
      case 2:
        return (
          <div className="flex flex-col gap-4 items-center">
            <DocumentUploadForm
              uploadedFile={uploadedFile}
              onUploadComplete={handleUploadComplete}
            />
            <QuestionCountDropdown 
              selectedCount={questionCount}
              onCountChange={handleQuestionCount}
            />
          </div>
        );
      case 3:
        return <CameraMicCheck />;
      default:
        return null;
    }
  };

  return (
    <div className="w-screen flex flex-col items-center h-screen overflow-y-auto">
      {/** 준비 단계 바 */}
      <ReadyStepBar step={step} handleChangeStep={handleChangeStep} />

      {/** 폼 컨테이너 */}
      <div className="container flex flex-grow flex-col justify-center items-center gap-5">
        {renderStepComponent()}
      </div>

      {/** 이전, 다음 버튼 */}
      <div className="flex w-full max-w-lg justify-between py-10 px-4">
        {step !== 1 ? (
          <button
            className="flex items-center bg-white border-[1px] border-black text-gray-600 gap-1 px-4 py-2 cursor-pointer font-semibold tracking-widest rounded-md hover:bg-gray-100 duration-300 hover:gap-2 hover:-translate-x-2"
            onClick={prevStepHandler}
          >
            이전
          </button>
        ) : (
          <div />
        )}

        {step !== 3 ? (
          <button
            className="flex items-center bg-blue-500 text-white gap-1 px-4 py-2 cursor-pointer font-semibold tracking-widest rounded-md hover:bg-blue-400 duration-300 hover:gap-2 hover:translate-x-2"
            onClick={nextStepHandler}
          >
            다음
          </button>
        ) : (
          <button
            className="flex items-center bg-green-500 text-white gap-1 px-4 py-2 cursor-pointer font-semibold tracking-widest rounded-md hover:bg-green-600 duration-300"
            onClick={() => router.push("/")}
          >
            면접 시작하기
          </button>
        )}
      </div>
    </div>
  );
};

export default ReadyPage;
