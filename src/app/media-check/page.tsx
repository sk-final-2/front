"use client";

import UserVideo from "@/components/interview/UserVideo";
import AudioRecoder from "@/components/media-check/AudioRecoder";
import CameraMicCheck from "@/components/ready/CameraMicCheck";
import { useCallback, useEffect, useState } from "react";

// 미디어 권한 상태를 나타내는 타입 정의
type PermissionState = "prompt" | "granted" | "denied";

const MediaCheckPage = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  // ✅ 미디어 오류 상태 추가
  const [mediaError, setMediaError] = useState<string | null>(null);
  // 카메라 권한 상태
  const [cameraPermission, setCameraPermission] =
    useState<PermissionState>("prompt");

  // 마이크 권한 상태
  const [micPermission, setMicPermission] = useState<PermissionState>("prompt");

  // 사용자 카메라 스트림 가져오기 (오류 처리 강화)
  useEffect(() => {
    const getStream = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true, // 인터뷰이므로 오디오도 요청
        });
        setStream(media);
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
  }, [stream]); // 최초 한 번만 실행

  // 권한 확인 로직
  const checkPermissions = useCallback(async () => {
    try {
      const cameraStatus = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      const micStatus = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });

      setCameraPermission(cameraStatus.state);
      setMicPermission(micStatus.state);

      // 권한 상태 변경 감지
      cameraStatus.onchange = () => setCameraPermission(cameraStatus.state);
      micStatus.onchange = () => setMicPermission(micStatus.state);
    } catch (error) {
      console.error("Permissions API를 지원하지 않는 브라우저입니다.", error);
    }
  }, [setCameraPermission, setMicPermission]);

  // 페이지 렌더링 시 권한 확인
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // 카메라 & 마이크 권한 요청 함수
  const requestPermissions = async () => {
    try {
      // 이 함수를 호출하면 브라우저가 사용자에게 권한 요청 프롬프트를 띄웁니다.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      // 스트림을 얻었다는 것은 권한이 허용되었다는 의미입니다.
      // 즉시 스트림을 닫아 리소스를 해제합니다. (실제 사용은 다른 곳에서)
      stream.getTracks().forEach((track) => track.stop());
      checkPermissions(); // 권한 상태를 다시 확인하여 UI를 업데이트합니다.
    } catch (err) {
      console.error("권한 요청이 거부되었거나 에러가 발생했습니다.", err);
      // 사용자가 거부하면 NotAllowedError가 발생합니다.
      // 이 경우에도 checkPermissions를 호출하여 'denied' 상태로 UI가 업데이트되도록 합니다.
      checkPermissions();
    }
  };

  return (
    // 페이지 컨테이너
    <div className="bg-gray-100 h-screen flex flex-col items-center">
      <span className="mt-10 text-4xl font-bold">장비 확인 및 테스트</span>
      <span className="mt-10 text-xl">
        면접 시작 전, 카메라와 마이크가 잘 작동하는지 확인해주세요.
      </span>

      {/** 오류 발생 시 오류 출력 */}
      {mediaError ? (
        <div className="mt-20 text-red-500 text-lg text-center p-4 border border-red-300 rounded-md bg-red-50">
          <p>오류가 발생했습니다.</p>
          <p>{mediaError}</p>
          <button
            onClick={requestPermissions}
            className="mt-4 px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            권한 확인하기
          </button>
        </div>
      ) : (
        <div className="mt-10 w-full flex flex-col items-center justify-center">
          <div className="w-100">
            {/** 사용자 카메라 화면 */}
            <UserVideo stream={stream} />
          </div>
          {/** 마이크 테스트 + 마이크 볼륨 바 */}
          <AudioRecoder />

          {/** 장비 선택 드롭 다운 */}

          {/** 면접 진행하기 버튼 */}
        </div>
      )}
    </div>
  );
};

export default MediaCheckPage;
