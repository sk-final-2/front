"use client";

import { useEffect, useState } from "react";
import { disconnect, startConnecting } from "@/store/socket/socketSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { useRouter } from "next/navigation";

const LoadingPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // 소켓 store
  const { isConnected, isConnecting, analysisComplete, error } = useAppSelector(
    (state) => state.socket,
  );
  const { interviewId } = useAppSelector((state) => state.interview);

  const [pageError, setPageError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("");

  // 소켓 연결
  const handleConnect = () => {
    setProgressMessage("소켓 연결중...");
    if (interviewId.length === 0) {
      setPageError(`interviewId 비어 있음: ${interviewId}`);
      return;
    }
    dispatch(startConnecting({ interviewId }));
    if (error) setPageError(error);
    setProgressMessage("면접 결과 기다리는 중...");
  };

  // 소켓 연결 해제
  const handleDisconnect = () => {
    dispatch(disconnect());
  };

  useEffect(() => {
    // 소켓 연결
    handleConnect();
  }, []);

  useEffect(() => {
    // analysisComplete 상태가 true로 변경되면 '/result' 페이지로 이동
    if (analysisComplete) {
      router.replace("/result");
    }
  }, [analysisComplete, router]);

  if (pageError) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="container text-destructive">{pageError}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="container text-accent-foreground">{progressMessage}</div>
    </div>
  );
};

export default LoadingPage;
