// src/lib/mediaDevices.ts
export type DeviceOption = { deviceId: string; label: string };

export async function ensurePermission() {
  // 권한 프롬프트 트리거용: 이미 허용되었으면 즉시 resolve
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  } catch {
    // 거부되었어도 enumerateDevices는 일부 브라우저에서 label이 빈값일 뿐 호출은 됨
  }
}

export async function listDevices(): Promise<{
  videos: DeviceOption[];
  audios: DeviceOption[];
}> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videos = devices
    .filter((d) => d.kind === "videoinput")
    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `카메라 ${i + 1}` }));
  const audios = devices
    .filter((d) => d.kind === "audioinput")
    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `마이크 ${i + 1}` }));
  return { videos, audios };
}
