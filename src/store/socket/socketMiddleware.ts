import {
  createListenerMiddleware,
  TypedStartListening,
} from "@reduxjs/toolkit";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import type { RootState, AppDispatch } from "@/store/store"; // 스토어 파일에서 타입을 가져옵니다.
import {
  startConnecting,
  connectionEstablished,
  connectionError,
  disconnect,
  setAnalysisComplete,
} from "./socketSlice";

// Listener 미들웨어 인스턴스 생성
export const listenerMiddleware = createListenerMiddleware();

// startListening에 타입을 적용하기 위한 설정
type AppStartListening = TypedStartListening<RootState, AppDispatch>;
const startAppListening =
  listenerMiddleware.startListening as AppStartListening;

let stompClient: Client | null = null;

// 'startConnecting' 액션을 감지하여 소켓 연결을 시작
startAppListening({
  actionCreator: startConnecting,
  effect: async (action, listenerApi) => {
    const { isConnected, isConnecting } = listenerApi.getState().socket;
    if (stompClient || isConnected || isConnecting) {
      console.log("이미 연결 프로세스가 진행 중이거나 연결되어 있습니다.");
      return;
    }

    try {
      const { interviewId } = action.payload; // 페이로드가 타입 추론됩니다.

      const socket = new SockJS("/ws/interview");
      stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
          listenerApi.dispatch(connectionEstablished());

          stompClient?.subscribe(
            `/topic/interview/${interviewId}`,
            (message) => {
              try {
                listenerApi.dispatch(setAnalysisComplete());
              } catch (e) {
                console.error("메시지 처리 오류:", e);
              }
            },
          );
        },
        onStompError: (frame) => {
          console.error("STOMP 오류:", frame);
          listenerApi.dispatch(
            connectionError(frame.headers["message"] || "STOMP Protocol Error"),
          );
        },
        onWebSocketError: (event) => {
          console.error("웹소켓 연결 오류:", event);
          listenerApi.dispatch(connectionError("WebSocket connection error"));
        },
      });

      stompClient.activate();
    } catch (error: any) {
      console.error("소켓 설정 오류:", error);
      listenerApi.dispatch(connectionError(error.toString()));
    }
  },
});

// 'disconnect' 액션을 감지하여 소켓 연결을 해제
startAppListening({
  actionCreator: disconnect,
  effect: async () => {
    if (stompClient) {
      await stompClient.deactivate();
      stompClient = null;
      console.log("소켓 연결이 해제되었습니다.");
    }
  },
});
