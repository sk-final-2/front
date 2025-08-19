"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import {
  setSelectedAudioDeviceId,
  setSelectedVideoDeviceId,
  setPreferredVideo,
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
  const { selectedVideoDeviceId, selectedAudioDeviceId, preferredVideo } =
    useAppSelector((s) => s.media);

  const [videos, setVideos] = useState<DeviceOption[]>([]);
  const [audios, setAudios] = useState<DeviceOption[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 장치 목록 로드
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await ensurePermission(); // 권한 유도(허용 상태면 no-op)
        const { videos, audios } = await listDevices();

        console.log("[DEBUG MEDIA] available videos:", videos);
        console.log("[DEBUG MEDIA] available audios:", audios);

        if (!mounted) return;
        setVideos(videos);
        setAudios(audios);

        // 기본 선택 자동 지정 (처음 진입 시)
        if (!selectedVideoDeviceId && videos[0]) {
          dispatch(setSelectedVideoDeviceId(videos[0].deviceId));
        }
        if (!selectedAudioDeviceId && audios[0]) {
          dispatch(setSelectedAudioDeviceId(audios[0].deviceId));
        }
      } catch (e) {
        console.error(e);
        if (mounted)
          setError("장치 목록을 불러오지 못했습니다. 권한을 확인해주세요.");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dispatch, selectedVideoDeviceId, selectedAudioDeviceId]);

  // 선택값/해상도에 맞춰 미리보기 스트림 열기
  useEffect(() => {
    let cancelled = false;
    let local: MediaStream | null = null;

    (async () => {
      try {
        const videoConstraints: MediaTrackConstraints = selectedVideoDeviceId
          ? {
              deviceId: { exact: selectedVideoDeviceId },
              width: preferredVideo?.width ?? { ideal: 1280 },
              height: preferredVideo?.height ?? { ideal: 720 },
              frameRate: preferredVideo?.frameRate ?? { ideal: 30 },
            }
          : {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
            };

        const audioConstraints: MediaTrackConstraints = selectedAudioDeviceId
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
            };

        // ⬇⬇⬇ 호출 “직전” constraints 로그
        console.log("[DEBUG MEDIA] preview constraints", {
          video: videoConstraints,
          audio: audioConstraints,
        }); // ⬅ 로그

        local = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints,
        });

        // ⬇⬇⬇ 성공 “직후” opened track 로그
        const v = local.getVideoTracks()[0];
        const a = local.getAudioTracks()[0];
        console.log("[DEBUG MEDIA] preview videoTrack.label:", v?.label); // ⬅ 로그
        console.log("[DEBUG MEDIA] preview audioTrack.label:", a?.label); // ⬅ 로그
        console.log(
          "[DEBUG MEDIA] preview videoTrack.settings:",
          v?.getSettings?.(),
        ); // ⬅ 로그
        console.log(
          "[DEBUG MEDIA] preview audioTrack.settings:",
          a?.getSettings?.(),
        ); // ⬅ 로그

        if (cancelled) {
          local.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(local);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("선택한 장치로 미리보기를 시작할 수 없습니다.");
      }
    })();

    return () => {
      cancelled = true;
      setStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });
      local?.getTracks().forEach((t) => t.stop());
    };
  }, [selectedVideoDeviceId, selectedAudioDeviceId, preferredVideo]);

  const goInterview = useCallback(() => {
    router.replace("/interview");
  }, [router]);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold">장비 확인 및 테스트</h1>

      {/* 선택 UI */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">카메라</span>
          <select
            className="rounded border p-2"
            value={selectedVideoDeviceId ?? ""}
            onChange={(e) => {
              dispatch(setSelectedVideoDeviceId(e.target.value || null));
              console.log(
                "[DEBUG MEDIA] selectedVideoDeviceId ->",
                e.target.value,
              );
            }}
          >
            {videos.map((v) => (
              <option key={v.deviceId} value={v.deviceId}>
                {v.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">마이크</span>
          <select
            className="rounded border p-2"
            value={selectedAudioDeviceId ?? ""}
            onChange={(e) => {
              dispatch(setSelectedAudioDeviceId(e.target.value || null));
              console.log(
                "[DEBUG MEDIA] selectedAudioDeviceId ->",
                e.target.value,
              );
            }}
          >
            {audios.map((a) => (
              <option key={a.deviceId} value={a.deviceId}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <input
            type="number"
            placeholder="width"
            className="w-24 rounded border p-2"
            value={preferredVideo?.width ?? 1280}
            onChange={(e) => {
              const next = {
                ...preferredVideo,
                width: Number(e.target.value) || undefined,
              };
              dispatch(setPreferredVideo(next));
              console.log("[DEBUG MEDIA] preferredVideo ->", next); // ⬅ 로그
            }}
          />
          <input
            type="number"
            placeholder="height"
            className="w-24 rounded border p-2"
            value={preferredVideo?.height ?? 720}
            onChange={(e) => {
              const next = {
                ...preferredVideo,
                height: Number(e.target.value) || undefined,
              };
              dispatch(setPreferredVideo(next));
              console.log("[DEBUG MEDIA] preferredVideo ->", next); // ⬅ 로그
            }}
          />

          <input
            type="number"
            placeholder="fps"
            className="w-20 rounded border p-2"
            value={preferredVideo?.frameRate ?? 30}
            onChange={(e) => {
              const next = {
                ...preferredVideo,
                frameRate: Number(e.target.value) || undefined,
              };
              dispatch(setPreferredVideo(next));
              console.log("[DEBUG MEDIA] preferredVideo ->", next); // ⬅ 로그
            }}
          />
        </div>
      </div>

      {/* 미리보기 + 마이크 테스트 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <UserVideo stream={stream} />
        </div>
        <div>
          <AudioRecoder />
        </div>
      </div>

      {error && <p className="mt-3 text-red-600">{error}</p>}

      <button
        onClick={goInterview}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        면접 진행하기
      </button>
    </div>
  );
}
