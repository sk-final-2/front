// import axios, { AxiosInstance } from "axios";
// const TTL_MS = Number(process.env.NEXT_PUBLIC_ACCESS_TTL_MS ?? 60_000);
// const EARLY_MS = 15_000;              // 만료 15초 전
// const KEY_ISSUED = "access_issued_at";
// const KEY_DISABLE_UNTIL = "reissue_disable_until";
// const COOLDOWN_MS = 60_000;           // 실패 후 1분간 재시도 금지

// let timer: ReturnType<typeof setTimeout> | null = null;

// const disabled = () => Date.now() < Number(localStorage.getItem(KEY_DISABLE_UNTIL) || 0);
// const disableForAWhile = () =>
//   localStorage.setItem(KEY_DISABLE_UNTIL, String(Date.now() + COOLDOWN_MS));

// export function markIssuedNow() {
//   localStorage.setItem(KEY_ISSUED, String(Date.now()));
// }

// async function callReissue(axiosInstance: AxiosInstance, path: string) {
//   try {
//     await axiosInstance.post(path, null, { withCredentials: true });
//     markIssuedNow();           // 성공 → 다음 스케줄
//     scheduleReissue(axiosInstance, path);
//   } catch (e: unknown) { // 'any' 대신 'unknown' 사용
//     // 에러가 AxiosError인지 확인하여 안전하게 속성에 접근
//     if (axios.isAxiosError(e)) {
//       console.error("Reissue failed:", e.response?.data);
//     } else {
//       console.error("An unexpected error occurred:", e);
//     }
//      // 실패 → 더 이상 재시도/리로드 안 함 (루프 차단)
//     disableForAWhile();
//     // 원하면 여기서 토스트만 띄우고 조용히 종료
//   }
// }

// export function scheduleReissue(axiosInstance: AxiosInstance, path: string) {
//   if (timer) clearTimeout(timer);
//   if (disabled()) return;

//   const issuedAt = Number(localStorage.getItem(KEY_ISSUED) || 0);
//   if (!issuedAt) return;

//   const due = issuedAt + TTL_MS - EARLY_MS;
//   const delay = Math.max(0, due - Date.now());

//   timer = setTimeout(() => callReissue(axiosInstance, path), delay);
// }

// export async function bootstrapReissue(axiosInstance: AxiosInstance, path: string) {
//   if (disabled()) return;

//   const issuedAt = Number(localStorage.getItem(KEY_ISSUED) || 0);
//   if (!issuedAt) return;

//   const left = issuedAt + TTL_MS - Date.now();
//   if (left <= EARLY_MS) {
//     // 거의 만료 → 즉시 한 번만 시도
//     await callReissue(axiosInstance, path);
//     return;
//   }
//   scheduleReissue(axiosInstance, path);

//   // 탭 활성 시 재평가
//   document.addEventListener("visibilitychange", () => {
//     if (document.visibilityState === "visible") scheduleReissue(axiosInstance, path);
//   });
// }
