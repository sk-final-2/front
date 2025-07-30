"use client";

import { useState } from "react";
import { FiUpload } from "react-icons/fi";

const DocumentUploadForm = () => {
  const [fileName, setFileName] = useState<string>("");

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 파일이 선택되면 파일명을 상태에 저장
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
  };

  return (
    <div className="min-w-md">
      <label
        htmlFor="file-upload"
        className="group flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-white px-6 py-10 transition-colors hover:border-blue-500 hover:bg-blue-50"
      >
        <div className="space-y-4 text-center">
          <FiUpload className="mx-auto h-10 w-10 text-zinc-400 transition-colors group-hover:text-blue-500" />
          <div className="space-y-1">
            <p className="font-semibold text-zinc-700">
              파일을 드래그하거나 클릭하여 업로드하세요
            </p>
            <p className="text-sm text-zinc-500 ">PDF, DOCS, TXT up to 10MB</p>
          </div>
        </div>
      </label>
      <input
        id="file-upload"
        name="file-upload"
        type="file"
        accept=".pdf, .docs, .txt"
        className="sr-only"
        onChange={handleFileChange}
      />

      {fileName && (
        <div className="mt-4 rounded-md bg-zinc-100 p-3 text-sm font-medium text-zinc-700">
          <p>선택된 파일: {fileName}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadForm;
