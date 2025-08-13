// src/app/interview/page.tsx
"use client";

/**
 * ✅ 콘솔 전용 디버그 로그 파일
 * - 모든 로그 라인에 `// [DELETE-ME LOG]` 주석 표시
 * - 나중에 테스트 끝나면 `DELETE-ME LOG`로 전체 검색 후 삭제하세요
 * - DeviceSettings 컴포넌트 및 관련 로직(토글/일시정지) 전부 제거
 */

import { Suspense, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { getNextQuestion } from "@/store/interview/interviewSlice";
import RecordingControls from "@/components/interview/RecordingControls";
import QuestionDisplay from "@/components/interview/QuestionDisplay";
import UserVideo from "@/components/interview/UserVideo";
import InterviewerView from "@/components/interview/InterviewerView";

/** 에러 메시지 안전 변환 */
function toErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "알 수 없는 오류가 발생했습니다.";
}

export default function InterviewPage() {
  const dispatch = useAppDispatch();
  const { currentQuestion, interviewId, currentSeq } = useAppSelector(
    (state) => state.interview
  );

  const [isClient, setIsClient] = useState(false);
  const [questionStarted, setQuestionStarted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 중복 제출 방지
  const submitInProgressRef = useRef(false);

  // 클라이언트 여부
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redux 상태 변화 로깅 (질문/순번/ID)
  useEffect(() => {
    if (!interviewId) return;
    console.log("🧩 [State] interviewId:", interviewId); // [DELETE-ME LOG]
  }, [interviewId]);

  useEffect(() => {
    if (!currentSeq) return;
    console.log("🧩 [State] currentSeq:", currentSeq); // [DELETE-ME LOG]
  }, [currentSeq]);

  useEffect(() => {
    if (!currentQuestion) return;
    console.log("🧩 [State] currentQuestion:", currentQuestion); // [DELETE-ME LOG]
  }, [currentQuestion]);

  // 미디어 스트림 준비 + 스트림 상세 로그
  useEffect(() => {
    if (!isClient) return;

    let localStream: MediaStream | null = null;

    (async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(localStream);
        setQuestionStarted(true);

        const vTrack = localStream.getVideoTracks()[0];
        const aTrack = localStream.getAudioTracks()[0];

        if (vTrack) {
          const vs = vTrack.getSettings?.() || {};
          const vc = vTrack.getConstraints?.() || {};
          console.log("🎥 [VideoTrack] label:", vTrack.label); // [DELETE-ME LOG]
          console.log("🎥 [VideoTrack] settings:", vs); // width, height, frameRate 등 // [DELETE-ME LOG]
          console.log("🎥 [VideoTrack] constraints:", vc); // [DELETE-ME LOG]
        }
        if (aTrack) {
          const as = aTrack.getSettings?.() || {};
          const ac = aTrack.getConstraints?.() || {};
          console.log("🎙️ [AudioTrack] label:", aTrack.label); // [DELETE-ME LOG]
          console.log("🎙️ [AudioTrack] settings:", as); // sampleRate, channelCount 등 // [DELETE-ME LOG]
          console.log("🎙️ [AudioTrack] constraints:", ac); // [DELETE-ME LOG]
        }

        // 초기 질문/순번/ID
        console.log("🧠 [Init] interviewId:", interviewId); // [DELETE-ME LOG]
        console.log("🧠 [Init] currentSeq:", currentSeq); // [DELETE-ME LOG]
        console.log("🧠 [Init] currentQuestion:", currentQuestion); // [DELETE-ME LOG]
      } catch (err: unknown) {
        console.error("❌ 미디어 장치 접근 오류:", err); // [DELETE-ME LOG]

        // DOMException 세부 분기 (타입 안전)
        if (err instanceof DOMException) {
          const name = err.name;
          if (name === "NotFoundError") {
            alert("연결된 카메라/마이크를 찾을 수 없습니다.");
            return;
          }
          if (name === "NotAllowedError" || name === "PermissionDeniedError") {
            alert("카메라/마이크 권한을 허용해주세요.");
            return;
          }
          if (name === "NotReadableError") {
            alert("장치를 사용할 수 없습니다. 다른 프로그램에서 사용 중인지 확인해주세요.");
            return;
          }
          alert(`미디어 장치 오류가 발생했습니다: ${err.message}`);
          return;
        }

        alert(toErrorMessage(err));
      }
    })();

    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // 제출 핸들러 — 콘솔 로그만
  const handleSubmit = async (blob: Blob) => {
    console.log("🚀 [Submit] interviewId:", interviewId); // [DELETE-ME LOG]
    console.log("🚀 [Submit] currentSeq:", currentSeq); // [DELETE-ME LOG]
    console.log("🚀 [Submit] currentQuestion:", currentQuestion); // [DELETE-ME LOG]

    if (submitInProgressRef.current || !interviewId || !currentQuestion) {
      console.warn("⏳ 제출 중이거나 인터뷰 정보 부족으로 취소"); // [DELETE-ME LOG]
      return;
    }
    submitInProgressRef.current = true;

    // Blob 정보
    console.log("🎞️ [Blob] size(bytes):", blob.size); // [DELETE-ME LOG]
    console.log("🎞️ [Blob] size(MB):", (blob.size / (1024 * 1024)).toFixed(3)); // [DELETE-ME LOG]
    console.log("🎞️ [Blob] type:", blob.type); // [DELETE-ME LOG]

    const videoURL = URL.createObjectURL(blob);
    setPreviewUrl(videoURL);

    const filename = `recorded-seq-${currentSeq}.webm`;
    const file = new File([blob], filename, { type: "video/webm" });

    // File 정보
    console.log("📦 [File] name:", file.name); // [DELETE-ME LOG]
    console.log("📦 [File] type:", file.type); // [DELETE-ME LOG]
    console.log("📦 [File] size(bytes):", file.size); // [DELETE-ME LOG]

    // FormData 구성
    const formData = new FormData();
    formData.append("file", file);
    formData.append("seq", String(currentSeq));
    formData.append("interviewId", interviewId);
    formData.append("question", currentQuestion);

    // FormData 로그
    console.log("🧾 [FormData] entries ↓↓↓"); // [DELETE-ME LOG]
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `  - ${key}: File{name=${value.name}, type=${value.type}, size=${value.size}}`
        ); // [DELETE-ME LOG]
      } else {
        console.log(`  - ${key}:`, value); // [DELETE-ME LOG]
      }
    }

    // 업로드 + 다음 질문
    const t0 = performance.now();
    try {
      const resp = await dispatch(getNextQuestion(formData)).unwrap();
      const t1 = performance.now();

      console.log("✅ [Response] code:", resp.code); // [DELETE-ME LOG]
      console.log("✅ [Response] message:", resp.message); // [DELETE-ME LOG]
      console.log("✅ [Response] data:", resp.data); // [DELETE-ME LOG]
      console.log("⏱️ [Timing] upload+next(ms):", Math.round(t1 - t0)); // [DELETE-ME LOG]

      // 다음 질문 표시를 위한 트리거
      setQuestionStarted(false);
      setTimeout(() => setQuestionStarted(true), 400);

      console.log("🧭 [Post] expected next seq:", currentSeq + 1); // [DELETE-ME LOG]
    } catch (e: unknown) {
      console.error("❌ [Dispatch Failed] 제출/다음 질문 오류:", e); // [DELETE-ME LOG]
      alert(toErrorMessage(e));
    } finally {
      submitInProgressRef.current = false;
    }
  };


  if (!isClient) {
    return <div className="p-8 text-center">면접 환경을 불러오는 중입니다...</div>;
  }

  return (
    <Suspense>
      <div className="p-8 space-y-4">
        {/* 질문 표시 (UI엔 로그 없음) */}
        <QuestionDisplay question={currentQuestion} />

        <div className="flex gap-4">
          {/* 왼쪽: 면접관 화면 */}
          <div className="flex-[3]">
            <InterviewerView />
          </div>

          {/* 오른쪽: 내 화면/컨트롤 */}
          <div className="flex-[2] flex flex-col gap-2 items-center">
            <UserVideo stream={stream} />

            {/* DeviceSettings 완전 삭제 — 바로 녹화 컨트롤만 표시 */}
            <RecordingControls
              stream={stream}
              questionStarted={questionStarted}
              onAutoSubmit={handleSubmit}
              onManualSubmit={handleSubmit}
            />

            {/* 미리보기 (UI 로그 없음) */}
            {previewUrl && (
              <div className="mt-4 w-full max-w-md">
                <p className="text-sm text-gray-500 mb-1">🎞️ 녹화된 영상 미리보기</p>
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
    </Suspense>
  );
}
