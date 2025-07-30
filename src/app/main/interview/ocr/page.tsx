"use client";

import DocumentUploadForm from "@/components/interview/DocumentUploadForm";
import JobSelectorForm from "@/components/interview/JobSelectorForm";
import { useRouter } from "next/navigation";
import { useState } from "react";

const OcrPage = () => {
  
  const router = useRouter();

  // 직군 상태
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // 세부직군 상태
  const [selectedJob, setSelectedJob] = useState<string>("");

  // 직군 변경 핸들러
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedJob("");
  };

  // 세부 직군 변경 핸들러
  const handleJobChange = (job: string) => {
    setSelectedJob(job);
  };

  // 다음 페이지로 넘어가기 버튼
  const nextButtonHandler = () => {
    router.push("")
  }

  return (
    <div className="w-screen flex flex-col justify-center items-center min-h-screen overflow-y-auto">
      {/** 전송 폼 컨테이너 */}
      <div className="container flex flex-col md:flex-row justify-center items-center gap-5">
        {/** 페이지 단계 */}

        {/** 직무 선택 컴포넌트 */}
        <JobSelectorForm
          selectedCategory={selectedCategory}
          selectedJob={selectedJob}
          onCategoryChange={handleCategoryChange}
          onJobChange={handleJobChange}
        />

        <div className="">
          {/** 문서 업로드 컴포넌트 */}
          <DocumentUploadForm />

          {/** 카메라 & 마이크 권한 + 질문 횟수 컴포넌트 */}

        </div>
      </div>
      <button
      type="button"
        className="cursor-pointer my-10 transition-all bg-blue-500 text-white px-6 py-2 rounded-lg
border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
onClick={}
      >
        다음 단계로
      </button>
    </div>
  );
};

export default OcrPage;
