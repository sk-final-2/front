"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import RecordingControls from "@/components/interview/RecordingControls";
import DeviceSettings from "@/components/interview/DeviceSettings";
import QuestionDisplay from "@/components/interview/QuestionDisplay";
import UserVideo from "@/components/interview/UserVideo";
import InterviewerView from "@/components/interview/InterviewerView";

// 첫 질문은 ready에서 받고 이후 질문은 영상 보내고 받기
const questionList = [
  "자기소개 해주세요.",
  "우리 회사에 지원한 이유는 무엇인가요?",
  "최근에 했던 프로젝트를 설명해주세요.",
];

export default function InterviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStarted, setQuestionStarted] = useState(false);
  const [interviewPaused, setInterviewPaused] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentSeq, setCurrentSeq] = useState(1);
  const [interviewId, setInterviewId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용자 카메라 스트림 가져오기
  useEffect(() => {
    const getStream = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(media);
        setQuestionStarted(true);
      } catch (err) {
        alert("카메라/마이크 권한이 필요합니다.");
      }
    };

    getStream();
  }, []);

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
    if (isSubmitting) return; // 중복 제출 방지
    setIsSubmitting(true);

    const videoURL = URL.createObjectURL(blob);
    setPreviewUrl(videoURL); // ✅ 미리보기용으로 저장

    const file = new File([blob], "recorded-video.webm", {
      type: "video/webm",
    });

    const formData = new FormData();
    formData.append("File", file); // 백엔드 명세에 맞춰 'File'로!
    formData.append("seq", currentSeq.toString()); // 질문 순서
    formData.append("interviewId", interviewId.toString()); // 인터뷰 고유 ID

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/interview/answer`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );

      console.log("✅ 제출 성공:", response.data);
      // goToNextQuestion(); // 다음 질문으로 진행
    } catch (err) {
      console.error("❌ 제출 실패:", err);
    } finally {
      goToNextQuestion(); // ✅ 다음 질문으로는 무조건 진행 (테스트 상황) 나중엔 지울 예정
      setIsSubmitting(false);
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
