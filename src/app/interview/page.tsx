// src/app/interview/page.tsx
"use client";

/**
 * ✅ 콘솔 전용 디버그 로그 파일
 * - 모든 로그 라인에 `// [DELETE-ME LOG]` 주석 표시
 * - 나중에 테스트 끝나면 `DELETE-ME LOG`로 전체 검색 후 삭제하세요
 * - DeviceSettings 컴포넌트 및 관련 로직(토글/일시정지) 전부 제거
 */

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
// ⬇️ 변경: getNextQuestion 대신 래퍼 thunk 사용
import { submitAnswerAndMaybeEnd } from "@/store/interview/interviewSlice";
import RecordingControls from "@/components/interview/RecordingControls";
import QuestionDisplay from "@/components/interview/QuestionDisplay";
import UserVideo from "@/components/interview/UserVideo";
import InterviewerView from "@/components/interview/InterviewerView";
import { useRouter } from "next/navigation";
import api from "@/lib/axiosInstance";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getInterviewResult } from "@/store/interview/resultSlice";
import { startConnecting } from "@/store/socket/socketSlice";
import Loading from "@/components/loading/Loading";

// 🔵 추가: TTS
import TtsComponent from "@/components/tts/TtsComponent";

/** 에러 메시지 안전 변환 */
function toErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "알 수 없는 오류가 발생했습니다.";
}

export default function InterviewPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [ttsAudioEl, setTtsAudioEl] = useState<HTMLAudioElement | null>(null);
  // 인터뷰 store
  const { currentQuestion, interviewId, currentSeq, isFinished, totalCount } =
    useAppSelector((state) => state.interview);

  // 면접 결과 store
  const { answerAnalyses } = useAppSelector((state) => state.result);
  const [ttsAmp, setTtsAmp] = useState(0);
  // 다음 페이지 라우트 가능 ==========================
  const [goResult, setGoResult] = useState<boolean>(false);
  // 결과 기다리는 로딩
  const [loading, setLoading] = useState<boolean>(false);
  // ===============================================
  // 소켓 상태 store
  const { isConnecting, isConnected, analysisComplete } = useAppSelector(
    (state) => state.socket,
  );

  const [isClient, setIsClient] = useState(false);
  const [questionStarted, setQuestionStarted] = useState(false); // 🔵 TTS 끝나기 전까지 false
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { selectedVideoDeviceId, selectedAudioDeviceId, preferredVideo } =
    useAppSelector((s) => s.media);

  // 중복 제출 방지
  const submitInProgressRef = useRef(false);

  const lastKeyRef = useRef<string>("");

  //tts 나오는 동안 recordingcontrols 숨기고 나타내고
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  //질문 로딩 관련
  const [awaitingNext, setAwaitingNext] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const prevSeqRef = useRef<number | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // 크롬, 엣지 등 대부분 브라우저는 커스텀 메시지를 무시하고
      // 자체 기본 문구를 보여줍니다.
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // 컴포넌트가 사라질 때 정리
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 클라이언트 여부
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (analysisComplete) {
      console.log("✅ 답변 분석 완료됨!! : ", interviewId);
      dispatch(getInterviewResult({ interviewId }));
      router.replace("/result");
    }
  }, [analysisComplete, dispatch, router]);

  const sendEnd = useCallback(async () => {
    await api.post("/api/interview/end", {
      interviewId: interviewId,
      lastSeq: currentSeq,
    });
    console.log("✅ 면접 종료 API 호출 완료. interviewId:", interviewId);
  }, [interviewId, currentSeq]);

  useEffect(() => {
    // isFinished가 true로 바뀌면 면접 종료 및 소켓 연결 시작
    if (isFinished) {
      setLoading(true);
      console.log("isFinished 감지. 면접 종료 및 소켓 연결 프로세스 시작.");

      console.log("소켓 연결 요청 시작 ▶▶▶▶▶");
      dispatch(startConnecting({ interviewId }));

      if (isConnected) {
        sendEnd().catch((e) => {
          console.error("❌ 면접 종료 API 호출 실패:", e);
        });
        setLoading(false);
      }
    }
  }, [isFinished, interviewId, dispatch, sendEnd, isConnected]);

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

    let cancelled = false;
    let local: MediaStream | null = null;

    // 동일 제약조건일 경우 요청을 건너뛰도록 설정
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

    const stopTracks = (ms?: MediaStream | null) => {
      ms?.getTracks().forEach((t) => t.stop());
    };

    // 장치나 조건이 변경되었을 때만 스트림을 요청하도록 설정
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
      // [DELETE-ME LOG]
      console.log("⏭️ [MEDIA] same constraints, skip getUserMedia"); // [DELETE-ME LOG]
      return;
    }
    lastKeyRef.current = reqKey;

    const conservativeFallback = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };

    const start = async () => {
      try {
        // 선택된 장치 기준으로 스트림 요청
        local = await navigator.mediaDevices.getUserMedia({
          video: buildVideoConstraints(),
          audio: buildAudioConstraints(),
        });

        if (cancelled) {
          stopTracks(local);
          return;
        }

        // 기존 스트림 정리 후 교체
        setStream((prev) => {
          stopTracks(prev);
          return local!;
        });

        // 🔵 여기서 예전엔 setQuestionStarted(true) 했지만, 이제는 TTS 끝날 때까지 대기!
        setQuestionStarted(false);

        // 디버그(선택): 트랙 로그
        const vTrack = local.getVideoTracks()[0];
        const aTrack = local.getAudioTracks()[0];
        if (vTrack) {
          console.log("🎥 [VideoTrack] label:", vTrack.label); // [DELETE-ME LOG]
          console.log("🎥 [VideoTrack] settings:", vTrack.getSettings?.()); // [DELETE-ME LOG]
        }
        if (aTrack) {
          console.log("🎙️ [AudioTrack] label:", aTrack.label); // [DELETE-ME LOG]
          console.log("🎙️ [AudioTrack] settings:", aTrack.getSettings?.()); // [DELETE-ME LOG]
        }
      } catch (err: unknown) {
        console.error("❌ 미디어 장치 접근 오류:", err); // [DELETE-ME LOG]

        // 타입 안전을 위해 `err`가 `Error` 객체인지 확인
        if (err instanceof Error) {
          // OverconstrainedError → 보수적 기본값으로 즉시 폴백
          if (err.name === "OverconstrainedError") {
            console.warn("⚠️ OverconstrainedError → conservative fallback"); // [DELETE-ME LOG]
          } else {
            console.warn("선택 장치 실패 → 기본 장치로 폴백 시도", err); // [DELETE-ME LOG]
          }
        } else {
          // Error 객체가 아닐 경우
          console.warn("알 수 없는 에러 발생:", err); // [DELETE-ME LOG]
        }

        try {
          // 기본 장치로 폴백
          local = await navigator.mediaDevices.getUserMedia(
            conservativeFallback,
          );

          if (cancelled) {
            stopTracks(local);
            return;
          }

          setStream((prev) => {
            stopTracks(prev);
            return local!;
          });
          setQuestionStarted(false); // TTS 끝날 때까지 대기
        } catch (e2: unknown) {
          // `e2`가 `Error` 타입인지 확인 후 다루기
          if (e2 instanceof Error) {
            console.error("기본 장치도 실패:", e2); // [DELETE-ME LOG]
            alert(`카메라/마이크를 사용할 수 없습니다. 오류: ${e2.message}`);
          } else {
            console.error("알 수 없는 오류:", e2); // [DELETE-ME LOG]
            alert(
              "카메라/마이크를 사용할 수 없습니다. 권한/연결 상태를 확인해주세요.",
            );
          }
        }
      }
    };

    start();

    // 🔥 cleanup: 이 이펙트가 재실행되거나 언마운트되면 현재 스트림 정리
    return () => {
      cancelled = true;
      setStream((prev) => {
        stopTracks(prev);
        return null;
      });
      stopTracks(local);
    };
  }, [isClient, selectedVideoDeviceId, selectedAudioDeviceId, preferredVideo]);

  // seq가 증가(=다음 질문 도착)하면 awaitingNext 해제
  useEffect(() => {
    if (
      prevSeqRef.current !== null &&
      currentSeq &&
      currentSeq > (prevSeqRef.current ?? 0)
    ) {
      setAwaitingNext(false);
    }
    prevSeqRef.current = currentSeq ?? null;
  }, [currentSeq]);

  // 제출 핸들러 — 래퍼 thunk로 교체
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

    // FormData 구성 (스펙 준수)
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
          `  - ${key}: File{name=${value.name}, type=${value.type}, size=${value.size}}`,
        ); // [DELETE-ME LOG]
      } else {
        console.log(`  - ${key}:`, value); // [DELETE-ME LOG]
      }
    }

    // 🔎 정적 모드에서 '이번 제출이 마지막'인지 미리 계산
    const isStaticLast =
      typeof totalCount === "number" &&
      totalCount > 0 &&
      currentSeq === totalCount;

    // ⛔ 정적 마지막이면 '다음 질문 로딩' 대신 곧바로 결과 로딩 화면으로 전환
    if (isStaticLast) {
      console.log("✅ 정적 마지막 제출 → finishing ON"); // [DELETE-ME LOG]
      setFinishing(true);
      setAwaitingNext(false);
    } else {
      setAwaitingNext(true);
    }

    const t0 = performance.now();
    try {
      // ⬇️ 변경: getNextQuestion → submitAnswerAndMaybeEnd
      const res = await dispatch(submitAnswerAndMaybeEnd(formData)).unwrap();
      const t1 = performance.now();

      console.log("✅ [Response] wrapper success"); // [DELETE-ME LOG]
      console.log(
        "⏱️ [Timing] upload+next(+maybe end)(ms):",
        Math.round(t1 - t0),
      ); // [DELETE-ME LOG]

      // 🔚 동적 모드에서 finished=true면 결과 대기만 보여야 하므로 즉시 끈다
      if (res?.finished === true && !isStaticLast) {
        console.log("✅ 동적 마지막 제출 → finishing ON"); // [DELETE-ME LOG]
        setFinishing(true);
        setAwaitingNext(false);
      }

      // 🔵 다음 질문을 위해 다시 false로 두고, 새 질문에서 TTS가 끝나면 true가 됨
      setQuestionStarted(false);

      console.log("🧭 [Post] expected next seq:", currentSeq + 1); // [DELETE-ME LOG]
    } catch (e: unknown) {
      setAwaitingNext(false); // 실패 시에는 즉시 해제
      setFinishing(false);
      console.error("❌ [Dispatch Failed] 제출/다음 질문/종료 오류:", e); // [DELETE-ME LOG]
      alert(toErrorMessage(e));
    } finally {
      submitInProgressRef.current = false;
    }
  };

  if (!isClient) {
    return (
      <div className="p-8 text-center">면접 환경을 불러오는 중입니다...</div>
    );
  }

  if (loading || finishing) {
    return <Loading message="면접 결과를 기다리는 중이에요..." />;
  }

  return (
    <Suspense>
      <div className="bg-background min-h-dvh">
        <section className="mx-auto w-full p-8 space-y-4">
          {/* 질문 표시 */}
          {awaitingNext && !isFinished && !finishing ? (
            <div
              className="h-14 rounded-md bg-gray-100 animate-pulse"
              aria-busy="true"
            />
          ) : (
            <QuestionDisplay seq={currentSeq} question={currentQuestion} />
          )}

          {/* 🔵 질문이 바뀌면 자동으로 읽고, 끝나면 녹화/타이머 시작 신호(questionStarted=true) */}
          <TtsComponent
            text={currentQuestion ?? ""}
            autoPlay
            onStart={() => {
              console.log("TTS 시작");
              setIsTtsPlaying(true);
              setQuestionStarted(false); // TTS 중에는 녹화 안 함
            }}
            onEnd={() => {
              console.log("TTS 종료 → 녹화 시작");
              setIsTtsPlaying(false);
              setQuestionStarted(true); // ← 이 시점에 RecordingControls가 시작
              setTtsAmp(0);
            }}
            onError={() => {
              console.warn("TTS 오류, 바로 녹화 시작으로 폴백");
              setIsTtsPlaying(false);
              setQuestionStarted(true);
              setTtsAmp(0);
            }}
            onEnergy={(amp) => {
              // 약간의 스무딩으로 튐 방지
              setTtsAmp((prev) => Math.max(amp, prev * 0.7));
            }}
          />

          <div className="grid gap-4 grid-cols-1 md:grid-cols-[3fr_2fr] items-stretch">
            {/* 왼쪽: 면접관 화면 */}
            <InterviewerView talking={isTtsPlaying} amp={ttsAmp} />
            {/* 오른쪽: 내 화면/컨트롤 */}
            <div className="flex flex-col gap-2 items-center">
              <UserVideo stream={stream} />

              {/* 🔇 TTS 재생 중이면 컨트롤 완전히 숨김 */}
              {!isTtsPlaying &&
              !finishing &&
              !awaitingNext &&
              currentQuestion ? (
                <RecordingControls
                  stream={stream}
                  questionStarted={questionStarted}
                  onAutoSubmit={handleSubmit}
                  onManualSubmit={handleSubmit}
                />
              ) : null}

              {/* '다음 질문 준비 중' 오버레이: 종료상태(isFinished)에서는 절대 보이지 않음 */}
              {awaitingNext && !isFinished && !finishing && (
                <Loading message="다음 질문을 준비 중이에요..." />
              )}

              {/* 미리보기 (UI 로그 없음) */}
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
        </section>
      </div>
    </Suspense>
  );
}
