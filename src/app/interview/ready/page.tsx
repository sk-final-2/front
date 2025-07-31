"use client";

import DocumentUploadForm from "@/components/interview/DocumentUploadForm";
import JobSelectorForm from "@/components/interview/JobSelectorForm";
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

  // 파일 상세 정보 확인 useEffect
  useEffect(() => {
    console.log(uploadedFile?.name);
    console.log(uploadedFile?.type);
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

  // 파일 업로드 핸들
  const handleUploadComplete = (file: File) => {
    setUploadedFile(file);
  };

  // 다음 단계 버튼 핸들러
  const nextStepHandler = () => {
    setStep((prev) => prev + 1);
  };

  // 이전 단계 버튼 핸들러
  const prevStepHandler = () => {
    setStep((prev) => prev - 1);
  };

  return (
    <div className="w-screen flex flex-col justify-center items-center min-h-screen overflow-y-auto">
      {/** 준비 단계 바 */}
      <ReadyStepBar step={step} handleChangeStep={handleChangeStep} />

      {/** 폼 컨테이너 */}
      <div className="container flex flex-col md:flex-row justify-center items-center gap-5">
        {/** 직무 선택 컴포넌트 */}
        <JobSelectorForm
          selectedCategory={selectedCategory}
          selectedJob={selectedJob}
          onCategoryChange={handleCategoryChange}
          onJobChange={handleJobChange}
        />

        {/** 문서 업로드 컴포넌트 */}
        <DocumentUploadForm onUploadComplete={handleUploadComplete} />

        {/** 카메라 & 마이크 권한 컴포넌트 */}
      </div>

      {/** 이전, 다음 버튼 */}
      <div className="flex mt-20 justify-between gap-4">
        {step != 1 ? <button className="flex items-center bg-white border-[1px] border-black text-gray-600 gap-1 px-4 py-2 cursor-pointer  font-semibold tracking-widest rounded-md hover:bg-gray-100 duration-300 hover:gap-2 hover:-translate-x-2" onClick={prevStepHandler}>이전</button> : <></>}
        {step != 3 ? <button className="flex items-center bg-blue-500 text-white gap-1 px-4 py-2 cursor-pointer font-semibold tracking-widest rounded-md hover:bg-blue-400 duration-300 hover:gap-2 hover:translate-x-2" onClick={nextStepHandler}>다음</button> : <></>}
      </div>
    </div>
  );
};

export default ReadyPage;
