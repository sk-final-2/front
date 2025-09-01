"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import {
  setSelectedAudioDeviceId,
  setSelectedVideoDeviceId,
} from "@/store/media/mediaSlice";
import {
  ensurePermission,
  listDevices,
  DeviceOption,
} from "@/lib/mediaDevices";
import UserVideo from "@/components/interview/UserVideo";
import AudioRecoder from "@/components/media-check/AudioRecoder";
import { useRouter } from "next/navigation";

export default function MediaCheckPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { selectedVideoDeviceId, selectedAudioDeviceId } =
    useAppSelector((s) => s.media);

  const [videos, setVideos] = useState<DeviceOption[]>([]);
  const [audios, setAudios] = useState<DeviceOption[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1) 장치 목록: 최초 1회만
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await ensurePermission();
        const { videos, audios } = await listDevices();
        if (!mounted) return;

        setVideos(videos);
        setAudios(audios);

        if (!selectedVideoDeviceId && videos[0]) {
          dispatch(setSelectedVideoDeviceId(videos[0].deviceId));
        }
        if (!selectedAudioDeviceId && audios[0]) {
          dispatch(setSelectedAudioDeviceId(audios[0].deviceId));
        }
      } catch {
        if (mounted) setError("장치 목록을 불러오지 못했습니다. 권한을 확인해주세요.");
      }
    })();
    return () => { mounted = false; };
    // 👇 레이스 방지 위해 의존성 비움(최초 1회)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) 스트림 열기: 장치 선택이 확정된 뒤에만
  useEffect(() => {
    if (!selectedVideoDeviceId) return;

    let cancelled = false;
    let local: MediaStream | null = null;

    (async () => {
      try {
        const video: MediaTrackConstraints = {
          deviceId: { exact: selectedVideoDeviceId },
        };
        const audio: MediaTrackConstraints = selectedAudioDeviceId
          ? { deviceId: { exact: selectedAudioDeviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          : { echoCancellation: true, noiseSuppression: true, autoGainControl: true };

        local = await navigator.mediaDevices.getUserMedia({ video, audio });
        if (cancelled) { local.getTracks().forEach(t => t.stop()); return; }

        setStream(prev => {
          prev?.getTracks().forEach(t => t.stop());
          return local!;
        });
        setError(null);
      } catch (e) {
        console.error(e);
        setError("카메라/마이크를 시작할 수 없습니다. 권한과 연결을 확인해주세요.");
      }
    })();

    return () => {
      cancelled = true;
      setStream(prev => { prev?.getTracks().forEach(t => t.stop()); return null; });
      local?.getTracks().forEach(t => t.stop());
    };
  }, [selectedVideoDeviceId, selectedAudioDeviceId]);

  const goInterview = useCallback(() => {
    router.replace("/interview");
  }, [router]);

  return (
    <div className="bg-white min-h-screen p-6">
      <h1 className="text-2xl font-bold">장비 확인 및 테스트</h1>

      {/* 안내 문구: 해상도/비율은 신경쓰지 말라는 정책 */}
      <p className="mt-2 text-sm text-gray-600">
        이 페이지에서는 화면 비율 및 해상도를 신경 쓰지 않으셔도 됩니다. 카메라가 잘 보이는지와 마이크가 녹음되는지만 확인해 주세요.
        (면접 화면에서 비율과 해상도는 자동으로 최적화됩니다)
      </p>

      {/* 미리보기 + 마이크 테스트 */}
      <div className="mt-6 flex flex-col md:flex-row gap-6 items-start">
        {/* 카메라 프리뷰: 크롭/확대 없이 안정 표시 */}
        <div className="w-full md:flex-[3]">
          {stream ? (
            <UserVideo stream={stream} className="aspect-video" fit="cover" />
          ) : (
            <div
              className="w-full rounded-xl bg-gray-100 animate-pulse"
              style={{ aspectRatio: "16 / 9", minHeight: 120 }}
              aria-busy="true"
            />
          )}

          {/* 간단 상태 배지 */}
          <div className="mt-2 text-xs">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${stream ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
              <span className={`inline-block w-2 h-2 rounded-full ${stream ? "bg-emerald-500" : "bg-gray-400"}`} />
              카메라 {stream ? "정상 출력 중" : "대기 중"}
            </span>
          </div>
        </div>

        {/* 우측: 장치 선택 + 마이크 테스트 */}
        <div className="flex flex-col gap-5 md:flex-[2]">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-600">카메라</span>
            <select
              className="rounded border p-2"
              value={selectedVideoDeviceId ?? ""}
              onChange={(e) => dispatch(setSelectedVideoDeviceId(e.target.value || null))}
            >
              {videos.map((v) => (
                <option key={v.deviceId} value={v.deviceId}>{v.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-600">마이크</span>
            <select
              className="rounded border p-2"
              value={selectedAudioDeviceId ?? ""}
              onChange={(e) => dispatch(setSelectedAudioDeviceId(e.target.value || null))}
            >
              {audios.map((a) => (
                <option key={a.deviceId} value={a.deviceId}>{a.label}</option>
              ))}
            </select>
          </label>

          {/* 마이크 테스트 컴포넌트 그대로 사용 */}
          <AudioRecoder />
        </div>
      </div>

      {error && <p className="mt-3 text-red-600">{error}</p>}

      <div className="mt-6 flex justify-end">
        <button
          onClick={goInterview}
          className="px-6 py-3 bg-primary/80 text-white rounded-xl hover:bg-blue-700"
        >
          면접 진행하기
        </button>
      </div>
    </div>
  );
}
