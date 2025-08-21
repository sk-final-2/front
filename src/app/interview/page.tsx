// src/app/interview/page.tsx
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { submitAnswerAndMaybeEnd } from "@/store/interview/interviewSlice";
import RecordingControls from "@/components/interview/RecordingControls";
import QuestionDisplay from "@/components/interview/QuestionDisplay";
import UserVideo from "@/components/interview/UserVideo";
import InterviewerView from "@/components/interview/InterviewerView";
import { useRouter } from "next/navigation";
import api from "@/lib/axiosInstance";

// 🔵 추가: TTS
import TtsComponent from "@/components/tts/TtsComponent";

function toErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "알 수 없는 오류가 발생했습니다.";
}

export default function InterviewPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { currentQuestion, interviewId, currentSeq, isFinished } =
    useAppSelector((state) => state.interview);

  const [isClient, setIsClient] = useState(false);
  const [questionStarted, setQuestionStarted] = useState(false); // 🔵 TTS 끝나기 전까지 false
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { selectedVideoDeviceId, selectedAudioDeviceId, preferredVideo } =
    useAppSelector((s) => s.media);

  const submitInProgressRef = useRef(false);
  const lastKeyRef = useRef<string>("");

  // 🔵 현재 TTS 재생 중인지 표시(건너뛰기 버튼 활성화 등에 활용)
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const sendEnd = async () => {
    const res = await api.post("/api/interview/end", { interviewId, lastSeq: currentSeq });
    console.log(res);
    console.log("interviewId: ", interviewId);
    localStorage.setItem("InterviewId", interviewId!);
    return res;
  };

  useEffect(() => {
    if (!isFinished) return;
    let called = false;
    (async () => {
      if (called) return;
      called = true;
      try {
        await sendEnd();
        router.replace("/");
      } catch (e) {
        console.error(e);
      }
    })();
  }, [isFinished, interviewId, currentSeq, router]);

  // 상태 디버그
  useEffect(() => { if (interviewId) console.log("🧩 [State] interviewId:", interviewId); }, [interviewId]);
  useEffect(() => { if (currentSeq) console.log("🧩 [State] currentSeq:", currentSeq); }, [currentSeq]);
  useEffect(() => { if (currentQuestion) console.log("🧩 [State] currentQuestion:", currentQuestion); }, [currentQuestion]);

  // 미디어 스트림 준비
  useEffect(() => {
    if (!isClient) return;

    let cancelled = false;
    let local: MediaStream | null = null;

    const buildVideoConstraints = (): MediaTrackConstraints => {
      const base = {
        width: preferredVideo?.width ?? { ideal: 1280 },
        height: preferredVideo?.height ?? { ideal: 720 },
        frameRate: preferredVideo?.frameRate ?? { ideal: 30 },
      };
      return selectedVideoDeviceId
        ? { ...base, deviceId: { exact: selectedVideoDeviceId } }
        : base;
    };
    const buildAudioConstraints = (): MediaTrackConstraints => {
      const base = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };
      return selectedAudioDeviceId
        ? { ...base, deviceId: { exact: selectedAudioDeviceId } }
        : base;
    };
    const stopTracks = (ms?: MediaStream | null) => { ms?.getTracks().forEach((t) => t.stop()); };

    const reqKey = JSON.stringify({
      v: {
        id: selectedVideoDeviceId,
        width: preferredVideo?.width ?? { ideal: 1280 },
        height: preferredVideo?.height ?? { ideal: 720 },
        frameRate: preferredVideo?.frameRate ?? { ideal: 30 },
      },
      a: { id: selectedAudioDeviceId },
    });
    if (lastKeyRef.current === reqKey) {
      console.log("⏭️ [MEDIA] same constraints, skip getUserMedia");
      return;
    }
    lastKeyRef.current = reqKey;

    const conservativeFallback = {
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    };

    const start = async () => {
      try {
        local = await navigator.mediaDevices.getUserMedia({
          video: buildVideoConstraints(),
          audio: buildAudioConstraints(),
        });
        if (cancelled) { stopTracks(local); return; }

        setStream((prev) => { stopTracks(prev); return local!; });

        // 🔵 여기서 예전엔 setQuestionStarted(true) 했지만, 이제는 TTS 끝날 때까지 대기!
        setQuestionStarted(false);

        const vTrack = local.getVideoTracks()[0];
        const aTrack = local.getAudioTracks()[0];
        if (vTrack) {
          console.log("🎥 [VideoTrack] label:", vTrack.label);
          console.log("🎥 [VideoTrack] settings:", vTrack.getSettings?.());
        }
        if (aTrack) {
          console.log("🎙️ [AudioTrack] label:", aTrack.label);
          console.log("🎙️ [AudioTrack] settings:", aTrack.getSettings?.());
        }
      } catch (err: unknown) {
        console.error("❌ 미디어 장치 접근 오류:", err);
        try {
          local = await navigator.mediaDevices.getUserMedia(conservativeFallback);
          if (cancelled) { stopTracks(local); return; }
          setStream((prev) => { stopTracks(prev); return local!; });
          // 🔵 스트림은 준비되었지만, 역시 TTS 끝날 때까지 questionStarted=false 유지
          setQuestionStarted(false);
        } catch (e2: unknown) {
          if (e2 instanceof Error) {
            console.error("기본 장치도 실패:", e2);
            alert(`카메라/마이크를 사용할 수 없습니다. 오류: ${e2.message}`);
          } else {
            console.error("알 수 없는 오류:", e2);
            alert("카메라/마이크를 사용할 수 없습니다. 권한/연결 상태를 확인해주세요.");
          }
        }
      }
    };

    start();
    return () => {
      cancelled = true;
      setStream((prev) => { stopTracks(prev); return null; });
      stopTracks(local);
    };
  }, [isClient, selectedVideoDeviceId, selectedAudioDeviceId, preferredVideo]);

  // 제출 핸들러(그대로)
  const handleSubmit = async (blob: Blob) => {
    if (submitInProgressRef.current || !interviewId || !currentQuestion) {
      console.warn("⏳ 제출 중이거나 인터뷰 정보 부족으로 취소");
      return;
    }
    submitInProgressRef.current = true;

    const videoURL = URL.createObjectURL(blob);
    setPreviewUrl(videoURL);

    const filename = `recorded-seq-${currentSeq}.webm`;
    const file = new File([blob], filename, { type: "video/webm" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("seq", String(currentSeq));
    formData.append("interviewId", interviewId!);
    formData.append("question", currentQuestion!);

    const t0 = performance.now();
    try {
      await dispatch(submitAnswerAndMaybeEnd(formData)).unwrap();
      const t1 = performance.now();
      console.log("⏱️ [Timing] upload+next(+maybe end)(ms):", Math.round(t1 - t0));

      // 🔵 다음 질문을 위해 다시 false로 두고, 새 질문에서 TTS가 끝나면 true가 됨
      setQuestionStarted(false);

      // (UI 효과)
      // setTimeout(() => setQuestionStarted(true), 400); ← 이제는 TTS가 끝나야 true가 되므로 제거
    } catch (e: unknown) {
      console.error("❌ [Dispatch Failed] 제출/다음 질문/종료 오류:", e);
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
        <QuestionDisplay question={currentQuestion} />

        {/* 🔵 질문이 바뀌면 자동으로 읽고, 끝나면 녹화/타이머 시작 신호(questionStarted=true) */}
        <TtsComponent
          text={currentQuestion ?? ""}
          autoPlay
          onStart={() => setIsTtsPlaying(true)}
          onEnd={() => {
            setIsTtsPlaying(false);
            setQuestionStarted(true); // ← 이 시점에 RecordingControls가 시작
          }}
          onError={(e) => {
            console.warn("TTS 오류, 바로 녹화 시작으로 폴백", e);
            setIsTtsPlaying(false);
            setQuestionStarted(true);
          }}
        />

        <div className="flex gap-4">
          <div className="flex-[3]">
            <InterviewerView />
          </div>

          <div className="flex-[2] flex flex-col gap-2 items-center">
            <UserVideo stream={stream} />

            {/* 🔵 questionStarted가 true가 되는 시점은 오직 TTS onEnd */}
            <RecordingControls
              stream={stream}
              questionStarted={questionStarted}
              onAutoSubmit={handleSubmit}
              onManualSubmit={handleSubmit}
            />

            {/* 🔵 TTS가 막히면 사용자가 수동으로 바로 시작할 수 있게 */}
            <button
              type="button"
              className="mt-2 px-4 py-2 rounded bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50"
              onClick={() => setQuestionStarted(true)}
              disabled={questionStarted || !currentQuestion}
              title="TTS 건너뛰고 바로 답변 시작"
            >
              TTS 건너뛰고 바로 답변 시작
            </button>

            {previewUrl && (
              <div className="mt-4 w-full max-w-md">
                <p className="text-sm text-gray-500 mb-1">🎞️ 녹화된 영상 미리보기</p>
                <video src={previewUrl} controls className="w-full aspect-video rounded border shadow" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
