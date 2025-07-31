"use client";

import { useEffect, useState } from "react";
import RecordingControls from "@/components/interview/RecordingControls";
import DeviceSettings from "@/components/interview/DeviceSettings";
import QuestionDisplay from "@/components/interview/QuestionDisplay";
import UserVideo from "@/components/interview/UserVideo";
import InterviewerView from "@/components/interview/InterviewerView";

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

  // 🎥 사용자 카메라 스트림 가져오기
  useEffect(() => {
    const getStream = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(media);
        setQuestionStarted(true); // ✅ 여기서 시작!
      } catch (err) {
        alert("카메라/마이크 권한이 필요합니다.");
      }
    };

    getStream();
  }, []);

  // ⏩ 다음 질문 진행
  const goToNextQuestion = () => {
    if (currentIndex + 1 < questionList.length) {
      setCurrentIndex((prev) => prev + 1);
      setQuestionStarted(false);
      setTimeout(() => setQuestionStarted(true), 500);
    } else {
      alert("면접이 완료되었습니다!");
    }
  };

  // 📤 영상 제출 핸들러 (수정필요!!!)
  const handleSubmit = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("video", blob);
    formData.append("question", questionList[currentIndex]);

    await fetch("/api/interview/submit", {
      method: "POST",
      body: formData,
    });

    goToNextQuestion();
  };

  // 📡 마이크/카메라 상태 감지 및 인터뷰 정지/재개
  const handleDeviceToggle = (type: "camera" | "mic", isOn: boolean) => {
    if (!isOn) {
      alert(
        `⚠️ ${
          type === "camera" ? "카메라" : "마이크"
        }가 꺼졌습니다. 인터뷰가 일시 중지됩니다.`,
      );
      setInterviewPaused(true);
    } else {
      const videoTrack = stream?.getVideoTracks()[0];
      const audioTrack = stream?.getAudioTracks()[0];

      if (videoTrack?.enabled && audioTrack?.enabled) {
        alert(
          "✅ 카메라와 마이크가 모두 켜졌습니다. 인터뷰를 다시 시작합니다.",
        );
        setInterviewPaused(false);
        setQuestionStarted(false);
        setTimeout(() => setQuestionStarted(true), 300);
      }
    }
  };

  return (
    <div className="p-8 space-y-4">
      {/* 질문 표시 */}
      <QuestionDisplay
        question={questionList[currentIndex]}
        index={currentIndex}
        total={questionList.length}
      />

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
        </div>
      </div>
    </div>
  );
}
