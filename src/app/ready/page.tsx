"use client";

import CameraMicCheck from "@/components/ready/CameraMicCheck";
import DocumentUploadForm from "@/components/ready/DocumentUploadForm";
import JobSelectorForm from "@/components/ready/JobSelectorForm";
import QuestionCountDropdown from "@/components/ready/QuestionCountDropdown";
import ReadyStepBar from "@/components/ready/readyStepBar";
import apiClient from "@/lib/axios";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

// 권한 상태를 나타내는 타입 정의
type PermissionState = "prompt" | "granted" | "denied";

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
  // 파일 요약 상태
  const [fileText, setFileText] = useState<string>("");

  // 질문 갯수 상태
  const [questionCount, setQuestionCount] = useState<number>(3);

  // 카메라 권한 상태
  const [cameraPermission, setCameraPermission] =
    useState<PermissionState>("prompt");

  // 마이크 권한 상태
  const [micPermission, setMicPermission] = useState<PermissionState>("prompt");

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

  // 파일 요약문 핸들러
  const handleFileText = (fileText: string) => {
    setFileText(fileText);
  };

  // 질문 갯수 핸들러
  const handleQuestionCount = (questionCount: number) => {
    setQuestionCount(questionCount);
  };

  // 카메라 권한 핸들러
  const handleCameraCheck = (cameraPermission: PermissionState) => {
    setCameraPermission(cameraPermission);
  };

  // 마이크 권한 핸들러
  const handleMicCheck = (micPermission: PermissionState) => {
    setMicPermission(micPermission);
  };

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

  // 면접 페이지로 이동하는 핸들러
  const goToInterviewPage = async () => {
    if (selectedCategory === "" || selectedJob === "") {
      handleChangeStep(1);
      alert("직군을 입력해주세요.");
      return;
    }
    // TODO: 첫 질문 생성 요청
    console.log(fileText);
    try {
      // body 데이터
      const bodyData = {
        job: selectedJob,
        count: Number(questionCount),
        ocrText: fileText ? fileText : "",
        seq: 1,
      };

      // console.log("보낸 데이터:");
      // console.log(bodyData);

      const res = await apiClient.post(
        "/api/interview/first-question",
        bodyData,
      );
      if (res.status == 200) {
        const data = res.data;

        router.replace(`/interview?data=${data.data}`);
      } else {
        console.error("첫 질문 받기 통신 에러");
      }
    } catch (error) {
      console.error(error);
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
              handleFileText={handleFileText}
            />
            <QuestionCountDropdown
              selectedCount={questionCount}
              onCountChange={handleQuestionCount}
            />
          </div>
        );
      case 3:
        return (
          <CameraMicCheck
            cameraPermission={cameraPermission}
            micPermission={micPermission}
            handleCameraCheck={handleCameraCheck}
            handleMicCheck={handleMicCheck}
          />
        );
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
            onClick={goToInterviewPage}
          >
            면접 시작하기
          </button>
        )}
      </div>
    </div>
  );
};

export default ReadyPage;
