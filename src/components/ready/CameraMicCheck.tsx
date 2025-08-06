"use client";

import React, { useCallback, useEffect } from "react";

// 권한 상태를 나타내는 타입 정의
type PermissionState = "prompt" | "granted" | "denied";

interface CameraMicCheckProps {
  cameraPermission: PermissionState;
  micPermission: PermissionState;
  handleCameraCheck: (cameraPermission: PermissionState) => void;
  handleMicCheck: (micPermission: PermissionState) => void;
}

const CameraMicCheck = ({
  cameraPermission,
  micPermission,
  handleCameraCheck,
  handleMicCheck,
}: CameraMicCheckProps) => {
  // 권한 상태를 확인하고 state를 업데이트하는 함수
  


  

  // 권한이 거부되었을 때 안내 메시지를 렌더링하는 컴포넌트
  const DeniedInstructions = () => (
    <div className="p-4 text-sm text-red-800 bg-red-100 border border-red-300 rounded-lg">
      <h3 className="font-bold">권한이 차단되었습니다.</h3>
      <p>
        이 기능을 사용하려면 브라우저 설정에서 카메라와 마이크 접근 권한을 직접
        허용해야 합니다.
      </p>
      <p className="mt-2">
        <strong>방법:</strong> 주소창의 자물쇠 아이콘을 클릭한 후, 카메라와
        마이크 권한을 <span className="text-blue-500">허용</span>으로 변경하고
        페이지를 새로고침하세요.
      </p>
    </div>
  );
  // 현재 상태에 따라 다른 UI 렌더링
  const renderContent = () => {
    if (cameraPermission === "denied" || micPermission === "denied") {
      return <DeniedInstructions />;
    }

    if (cameraPermission === "granted" && micPermission === "granted") {
      return (
        <div className="p-4 text-green-800 bg-green-100 border border-green-300 rounded-lg">
          <p className="font-bold">✅ 카메라와 마이크가 준비되었습니다.</p>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md p-8 space-y-4 bg-white border border-gray-200 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          카메라 & 마이크 확인
        </h2>
        <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded-md">
          <p className="text-gray-600">
            카메라와 마이크 접근 권한을 허용해주세요.
          </p>
          
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold text-center mb-4">장치 권한 확인</h2>
      {renderContent()}
    </div>
  );
};

export default CameraMicCheck;
