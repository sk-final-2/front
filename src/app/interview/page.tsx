"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import RecordingControls from "@/components/interview/RecordingControls";
import DeviceSettings from "@/components/interview/DeviceSettings";
import QuestionDisplay from "@/components/interview/QuestionDisplay";
import UserVideo from "@/components/interview/UserVideo";
import InterviewerView from "@/components/interview/InterviewerView";
import { useSearchParams } from "next/navigation";

export default function InterviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStarted, setQuestionStarted] = useState(false);
  const [interviewPaused, setInterviewPaused] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentSeq, setCurrentSeq] = useState(1);
  // 면접 id 상
  const [interviewId, setInterviewId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 질문 리스트 상태
  const [questionList, setQuestionList] = useState<string[]>([]);
  // ✅ 미디어 오류 상태 추가
  const [mediaError, setMediaError] = useState<string | null>(null);

  // 쿼리
  const searchParams = useSearchParams();

  const submitInProgressRef = useRef(false); // ✅ 중복 제출 방지용 ref

  // 쿼리 가져오기
  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      try {
        // URL 디코딩 후 JSON 객체로 파싱
        const decodedData = decodeURIComponent(dataParam);
        const parsedData = JSON.parse(decodedData);
        setInterviewId(parsedData.interviewId);
        setQuestionList((prev) => [...prev, parsedData.question]);
        setCurrentSeq(parsedData.seq);
      } catch (error) {
        console.error("면접 데이터 파싱 오류:", error);
      }
    }
  }, [searchParams]);

  // 사용자 카메라 스트림 가져오기 (오류 처리 강화)
  useEffect(() => {
    const getStream = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true, // 인터뷰이므로 오디오도 요청
        });
        setStream(media);
        setQuestionStarted(true);
        setMediaError(null); // 성공 시 에러 상태 초기화
      } catch (err) {
        console.error("미디어 장치 접근 오류:", err);
        if (err instanceof DOMException) {
          switch (err.name) {
            case "NotFoundError":
              setMediaError(
                "연결된 카메라 또는 마이크를 찾을 수 없습니다. 장치가 올바르게 연결되었는지 확인해주세요.",
              );
              break;
            case "NotAllowedError":
            case "PermissionDeniedError":
              setMediaError(
                "카메라와 마이크 접근 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요.",
              );
              break;
            case "NotReadableError":
              setMediaError(
                "카메라 또는 마이크를 사용할 수 없습니다. 다른 프로그램에서 사용 중이 아닌지 확인하고 다시 시도해주세요.",
              );
              break;
            default:
              setMediaError(`미디어 장치 오류가 발생했습니다: ${err.message}`);
          }
        } else {
          setMediaError("알 수 없는 미디어 장치 오류가 발생했습니다.");
        }
      }
    };

    getStream();

    // 컴포넌트 언마운트 시 스트림 정리
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []); // 최초 한 번만 실행

  // 다음 질문 진행
  const goToNextQuestion = () => {
    if (currentIndex + 1 < questionList.length) {
      setCurrentIndex((prev) => prev + 1);
      setQuestionStarted(false);
      setTimeout(() => setQuestionStarted(true), 500);
    } else {
      alert("면접이 완료되었습니다!");
    }
  };

  // 영상 제출 핸들러
  const handleSubmit = async (blob: Blob) => {
    console.log("자동 제출 직전 Blob 사이즈:", blob.size);

    if (submitInProgressRef.current) return; // ✅ 중복 제출 즉시 차단
    submitInProgressRef.current = true;
    setIsSubmitting(true);

    const videoURL = URL.createObjectURL(blob);
    setPreviewUrl(videoURL); // ✅ 미리보기용으로 저장

    const file = new File([blob], "recorded-video.webm", {
      type: "video/webm",
    });

    const formData = new FormData();
    formData.append("file", file); // 백엔드 명세에 맞춰 'file'로!
    formData.append("seq", currentSeq.toString()); // 질문 순서
    formData.append("interviewId", interviewId.toString()); // 인터뷰 고유 ID
    console.log("🧠 currentIndex:", currentIndex);
    console.log("🧠 questionList:", questionList);
    console.log("🧠 현재 질문:", questionList[currentIndex]);

    formData.append("question", questionList[currentIndex]); //인터뷰 질문

    const fileInForm = formData.get("file");
    if (fileInForm instanceof File) {
      console.log("📦 파일 이름:", fileInForm.name);
      console.log("📦 파일 타입:", fileInForm.type);
      console.log("📦 파일 크기:", fileInForm.size, "bytes");
    }

    // 또는 전체 FormData 확인
    for (const [key, value] of formData.entries()) {
      console.log("🧾 FormData:", key, value);
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview/answer`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );

      console.log("✅ 제출 성공:", response.data);

      const newQuestion = response.data?.data?.newQuestion;

      if (typeof newQuestion === "string") {
        setQuestionList((prev) => [...prev, newQuestion]); // ✅ 질문 추가
        setCurrentIndex((prev) => prev + 1); // ✅ 다음 질문 이동
        setCurrentSeq((prev) => prev + 1); // ✅ seq 증가
        setQuestionStarted(false);
        setTimeout(() => setQuestionStarted(true), 500); // ✅ 타이머 재시작
      } else {
        alert("다음 질문을 받아오지 못했습니다.");
      }
      goToNextQuestion(); // 다음 질문으로 진행
    } catch (err) {
      console.error("❌ 제출 실패:", err);
    } finally {
      // goToNextQuestion(); // ✅ 다음 질문으로는 무조건 진행 (테스트 상황) 나중엔 지울 예정
      setIsSubmitting(false);
      submitInProgressRef.current = false; // ✅ 다시 제출 가능 상태로
    }
  };

  // 마이크/카메라 상태 감지 및 인터뷰 정지/재개
  const handleDeviceToggle = (type: "camera" | "mic", isOn: boolean) => {
    if (!isOn) {
      alert(
        `${
          type === "camera" ? "카메라" : "마이크"
        }가 꺼졌습니다. 인터뷰가 일시 중지됩니다.`,
      );
      setInterviewPaused(true);
    } else {
      const videoTrack = stream?.getVideoTracks()[0];
      const audioTrack = stream?.getAudioTracks()[0];

      if (videoTrack?.enabled && audioTrack?.enabled) {
        alert("카메라와 마이크가 모두 켜졌습니다. 인터뷰를 다시 시작합니다.");
        setInterviewPaused(false);
        setQuestionStarted(false);
        setTimeout(() => setQuestionStarted(true), 300);
      }
    }
  };

  // 미디어 장치 오류가 있을 경우, 해당 UI 렌더링
  if (mediaError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 text-lg text-center p-4 border border-red-300 rounded-md bg-red-50">
          <p>오류가 발생했습니다.</p>
          <p>{mediaError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      {/* 질문 표시 */}
      <QuestionDisplay question={questionList[currentIndex]} />

      <div className="flex gap-4">
        {/* 면접관 더미 */}
        <div className="flex-[3]">
          <InterviewerView />
        </div>

        {/* 우측 */}
        <div className="flex-[2] flex flex-col gap-2 items-center">
          <UserVideo stream={stream} />
          <DeviceSettings stream={stream} onDeviceToggle={handleDeviceToggle} />
          {!interviewPaused ? (
            <RecordingControls
              stream={stream}
              questionStarted={questionStarted}
              onAutoSubmit={handleSubmit}
              onManualSubmit={handleSubmit}
            />
          ) : (
            <div className="text-red-500 text-sm mt-2">
              녹화가 일시 중지되었습니다. 카메라/마이크를 다시 켜주세요.
            </div>
          )}
          {previewUrl && (
            <div className="mt-4 w-full max-w-md">
              <p className="text-sm text-gray-500 mb-1">
                🎞️ 녹화된 영상 미리보기
              </p>
              <video
                src={previewUrl}
                controls
                className="w-full aspect-video rounded border shadow"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
