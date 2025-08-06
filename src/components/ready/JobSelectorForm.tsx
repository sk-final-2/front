"use client";

import { careerData, jobData } from "@/data/jobs";

interface JobSelectorFormProps {
  selectedCategory: string;
  selectedJob: string;
  career: string;
  onCategoryChange: (category: string) => void;
  onJobChange: (job: string) => void;
  onCareerChange: (career: string) => void;
}

const JobSelectorForm = ({
  selectedCategory,
  selectedJob,
  career,
  onCategoryChange,
  onJobChange,
  onCareerChange,
}: JobSelectorFormProps) => {
  const subCategories = jobData[selectedCategory] || [];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(e.target.value);
  };

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onJobChange(e.target.value);
  };

  const handleCareerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCareerChange(e.target.value);
  };

  return (
    <div>
      <div className="w-full min-w-md max-w-lg space-y-6 rounded-lg bg-white p-8 shadow-lg">
        {/** 직무 선택 드롭다운 */}
        <h2 className="text-center text-2xl font-bold text-gray-800">
          직무 & 경력 선택
        </h2>

        <div className="space-y-2">
          <label
            htmlFor="job-category"
            className="block font-semibold text-gray-700"
          >
            직군 선택
          </label>
          <select
            id="job-category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">-- 직군을 선택하세요 --</option>
            {Object.keys(jobData).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/** 세부 직무 드롭다운 */}
        <div className="space-y-2">
          <label
            htmlFor="job-detail"
            className="block font-semibold text-gray-700"
          >
            세부 직무 선택
          </label>
          <select
            id="job-detail"
            value={selectedJob}
            onChange={handleJobChange}
            // 직무가 선택되지 않았다면 비활성화 상태로 만듭니다.
            disabled={!selectedCategory}
            className="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">-- 세부 직무를 선택하세요 --</option>
            {subCategories.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </select>
        </div>

        {/** 경력 드롭다운 */}
        <div>
          <label htmlFor="career" className="block font-semibold text-gray-700">
            경력 선택
          </label>
          <select
            id="career"
            value={career}
            onChange={handleCareerChange}
            className="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">-- 경력을 선택하세요 --</option>
            {careerData.map((career) => (
              <option key={career} value={career}>
                {career}
              </option>
            ))}
          </select>
        </div>

        {/* 최종 선택 결과 표시 */}
        {selectedJob && career && (
          <div className="mt-6 rounded-md bg-blue-50 p-4 text-center">
            <p className="font-semibold text-black">
              선택하신 직무는{" "}
              <span className="text-blue-700 font-bold">{selectedJob}</span>{" "}
              <span className="text-green-700 font-bold">{career}</span> 입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSelectorForm;
