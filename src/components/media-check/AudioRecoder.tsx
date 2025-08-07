"use client";

import { useEffect, useRef, useState } from "react";
import VolumeMeter from "./VolumeMeter";

const AudioRecoder = () => {
  /** 녹화 상태 */
  const [isRecording, setIsRecording] = useState(false);
  /** 오디오 URL */
  const [audioURL, setAudioURL] = useState("");
  /** MediaStream */
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  /** 볼륨 상태 */
  const [volume, setVolume] = useState(0);

  // 장치 목록 및 선택을 위한 상태 변수들
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [selectedCamId, setSelectedCamId] = useState<string>("");

  /** MediaRecorder ref */
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  /** audioChunks ref */
  const audioChunksRef = useRef<Blob[]>([]);
  /** 컨텍스트 : ["suspended", ""] */
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 볼륨 분석을 위한 useEffect
  useEffect(() => {
    // 녹화 중이고 stream 이 존재하는 경우
    if (isRecording && mediaStream) {
      audioContextRef.current = new window.AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(mediaStream);
      /** source 에 analyser 연결 */
      sourceRef.current.connect(analyserRef.current);

      /** 볼륨 배열 Binary Count */
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      /** 볼륨 업데이트 로직 */
      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          // 볼륨 평균 계산
          const average =
            dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          // 볼륨 업데이트
          setVolume(average);
        }
        // JS 애니메이션
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    }

    // 클린업 함수
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
      setVolume(0); // 녹음 종료 시 볼륨 0으로 초기화
    };
  }, [isRecording, mediaStream]); // useEffect

  /** 녹음 시작/중지 핸들러 */
  const handleToggleRecording = async () => {
    // 녹음 중이면 녹음을 종료하고 녹음 재생
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioURL(audioUrl);
          audioChunksRef.current = [];
        }; // onstop
      }
      // mediaStream 정리
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
      setIsRecording(false);
    } else {
      // 녹음 시작
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setMediaStream(stream);
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.start();
        setAudioURL("");
        setIsRecording(true);
      } catch (error) {
        console.error("마이크 접근에 실패했습니다.", error);
      }
    }
  };

  /** 장치 목록 가져오기 */
  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput",
      );
      const videoInputs = devices.filter(
        (device) => device.kind === "videoinput",
      );
      setMics(audioInputs);
      setCams(videoInputs);

      // 기본 선택 장치 설정
      if (audioInputs.length > 0 && !selectedMicId) {
        setSelectedMicId(audioInputs[0].deviceId);
      }
      if (videoInputs.length > 0 && !selectedCamId) {
        setSelectedCamId(videoInputs[0].deviceId);
      }
    } catch (error) {
      console.error("장치 목록을 가져오는 데 실패했습니다:", error);
    }
  };

  /** 컴포넌트 마운트 시 장치 목록 초기 로드 */
  useEffect(() => {
    getDevices();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {/* 마이크 선택 드롭다운 */}
        <div>
          <label htmlFor="mic-select">마이크 선택: </label>
          <select
            id="mic-select"
            value={selectedMicId}
            onChange={(e) => setSelectedMicId(e.target.value)}
          >
            {mics.map((mic) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || `마이크 ${mics.indexOf(mic) + 1}`}
              </option>
            ))}
          </select>
        </div>
        {/* 카메라 선택 드롭다운 */}
        <div>
          <label htmlFor="cam-select">카메라 선택: </label>
          <select
            id="cam-select"
            value={selectedCamId}
            onChange={(e) => setSelectedCamId(e.target.value)}
          >
            {cams.map((cam) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `카메라 ${cams.indexOf(cam) + 1}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={handleToggleRecording}>
        {isRecording ? "정지" : "테스트"}
      </button>

      {/* 녹음 중일 때 세분화된 볼륨 미터 표시 */}
      {isRecording && <VolumeMeter volume={volume} />}

      {/* 녹음 완료 후 오디오 플레이어 표시 */}
      {audioURL && !isRecording && (
        <div style={{ marginTop: "1rem" }}>
          <h3>녹음된 음성:</h3>
          <audio src={audioURL} controls />
        </div>
      )}
    </div>
  );
};

export default AudioRecoder;
