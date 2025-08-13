"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";

interface DocumentUploadFormProps {
  uploadedFile: File | null;
  onUploadComplete: (file: File) => void;
  handleFileText: (fileText: string) => void;
  loading: boolean;
  handleLoading: (loading: boolean) => void;
}

const DocumentUploadForm = ({
  uploadedFile,
  onUploadComplete,
  handleFileText,
  loading,
  handleLoading,
}: DocumentUploadFormProps) => {
  // 파일 이름 상태
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    if (uploadedFile) {
      setFileName(uploadedFile?.name);
    }
  }, [uploadedFile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLoading(true);
      const allowedExtensions = ["pdf", "docx", "txt"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      // 파일 형식이 pdf, docx, txt 인 경우에만 업로드
      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const client = await axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL,
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          const res = await client.post("/api/interview/ocr", formData);
          if (res.status === 200) {
            console.log(res)
            handleFileText(res.data.data.ocrOutput);
            setFileName(file.name);
            onUploadComplete(file);
          } else {
            alert("파일 업로드에 실패했습니다.");
            console.error(res.data.message);
            return;
          }
        } catch (error) {
          alert(`오류: ${error}`);
          console.error(error);
        } finally {
          handleLoading(false);
        }
      } else {
        alert(
          "허용되지 않은 파일 형식입니다. PDF, DOCX, TXT 파일만 업로드할 수 있습니다.",
        );
        handleLoading(false);
        return;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-w-md flex-1 items-center justify-center rounded-lg border-zinc-300 bg-white px-6 py-10">
        <div className="flex flex-col items-center justify-center gap-5">
          <div className="flex flex-row gap-3">
            <div className="h-4 w-4 animate-bounce rounded-full bg-blue-700 [animation-delay:.3s]"></div>
            <div className="h-4 w-4 animate-bounce rounded-full bg-blue-700 [animation-delay:.5s]"></div>
            <div className="h-4 w-4 animate-bounce rounded-full bg-blue-700 [animation-delay:.7s]"></div>
          </div>
          <span className="mt-4 text-center font-semibold text-zinc-700">
            파일 업로드중...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/** 파일 업로드  */}
      {fileName.length == 0 ? (
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
                <p className="text-sm text-zinc-500 ">
                  PDF, DOCS, TXT up to 10MB
                </p>
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
      ) : (
        <>
          {/** 파일 업로드 후 */}
          <div className="min-w-md">
            <div className="flex flex-col gap-5 justify-center items-center w-full h-[15rem] bg-gray-50 border-2 border-gray-600 rounded-2xl">
              <div>
                현재 업로드된 파일 :{" "}
                <span className="text-lg font-bold text-blue-500">
                  {fileName}
                </span>
              </div>
              <label
                htmlFor="file-upload"
                className="group w-5/6 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-white px-6 py-10 transition-colors hover:border-blue-500 hover:bg-blue-50"
              >
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <p className="font-semibold text-zinc-700">
                      다른 파일 업로드하기
                    </p>
                    <p className="text-sm text-zinc-500 ">
                      PDF, DOCS, TXT up to 10MB
                    </p>
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
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DocumentUploadForm;
