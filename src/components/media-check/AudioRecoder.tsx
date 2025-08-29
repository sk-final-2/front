"use client";

import { useEffect, useRef, useState } from "react";
import VolumeMeter from "./VolumeMeter";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { setSelectedAudioDeviceId } from "@/store/media/mediaSlice";
import { Mic, StopCircle } from "lucide-react";

const AudioRecoder = () => {
  /** 녹음 상태 */
  const [isRecording, setIsRecording] = useState(false);
  /** 오디오 URL */
  const [audioURL, setAudioURL] = useState("");
  /** MediaStream */
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  /** 볼륨 상태 */
  const [volume, setVolume] = useState(0);

  /** Redux: 선택된 마이크 */
  const dispatch = useAppDispatch();
  const { selectedAudioDeviceId } = useAppSelector((s) => s.media);

  /** 마이크 목록 (라벨 표시/선택 변경용 — 필요 없으면 섹션 통째로 삭제해도 됨) */
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);

  /** MediaRecorder / 오디오 분석 */
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  /** 마이크 목록 로드 */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 권한 허용되면 label이 보장되는 브라우저가 많음
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          // 거부되어도 enumerateDevices는 대개 호출 가능 (label은 빈값일 수 있음)
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        if (!mounted) return;
        setMics(audioInputs);

        // 기본 선택 없으면 첫 번째 마이크로 지정
        if (!selectedAudioDeviceId && audioInputs[0]) {
          dispatch(setSelectedAudioDeviceId(audioInputs[0].deviceId));
        }
      } catch (e) {
        console.error("[DEBUG MEDIA] enumerateDevices failed:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dispatch, selectedAudioDeviceId]);

  /** 볼륨 분석 */
  useEffect(() => {
    if (isRecording && mediaStream) {
      audioContextRef.current = new window.AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(mediaStream);
      sourceRef.current.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average =
            dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setVolume(average);
        }
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    }

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
      setVolume(0);
    };
  }, [isRecording, mediaStream]);

  /** 녹음 시작/중지 */
  const handleToggleRecording = async () => {
    if (isRecording) {
      // 정지
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioURL(audioUrl);
          audioChunksRef.current = [];
        };
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
        setMediaStream(null);
      }
      setIsRecording(false);
    } else {
      // 시작 — Redux 선택 마이크로 열기
      try {
        const constraints: MediaStreamConstraints = {
          audio: selectedAudioDeviceId
            ? {
                deviceId: { exact: selectedAudioDeviceId },
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            : {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
          video: false,
        };
        console.log("[DEBUG MEDIA] AUDIO TEST constraints:", constraints);

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setMediaStream(stream);

        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.start();
        setAudioURL("");
        setIsRecording(true);

        const a = stream.getAudioTracks()[0];
        console.log("[DEBUG MEDIA] AUDIO TEST track.label:", a?.label);
        console.log(
          "[DEBUG MEDIA] AUDIO TEST track.settings:",
          a?.getSettings?.(),
        );
      } catch (error) {
        console.error("마이크 접근 실패:", error);
        alert("마이크 권한/연결을 확인해주세요.");
      }
    }
  };

  return (
    <div className="flex flex-row gap-5">
      <button
        onClick={handleToggleRecording}
        className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition shadow-sm"
        aria-label={isRecording ? "녹음 정지" : "마이크 테스트"}
        title={isRecording ? "정지" : "테스트"}
      >
        {isRecording ? (
          <StopCircle className="w-7 h-7 text-red-500" />
        ) : (
          <Mic className="w-7 h-7 text-green-600" />
        )}
        <span className="sr-only">{isRecording ? "정지" : "테스트"}</span>
      </button>

      {isRecording && <VolumeMeter volume={volume} />}

      {audioURL && !isRecording && (
        <div className="mt-4 flex items-center gap-1">
          <span className="text-sm text-gray-700 whitespace-nowrap leading-none">
            녹음된 음성:
          </span>
          <audio src={audioURL} controls className="flex-1 align-middle" />
        </div>
      )}
    </div>
  );
};

export default AudioRecoder;
