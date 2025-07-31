"use client";

import { useState } from "react";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";

interface Props {
  stream: MediaStream | null;
  onDeviceToggle: (type: "camera" | "mic", on: boolean) => void;
}

export default function DeviceSettings({ stream, onDeviceToggle }: Props) {
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // 트랙 ON/OFF 토글
  const toggleTrack = (type: "video" | "audio", currentOn: boolean) => {
    if (!stream) return;

    const tracks =
      type === "video" ? stream.getVideoTracks() : stream.getAudioTracks();

    tracks.forEach((track) => {
      track.enabled = !currentOn;
    });

    if (type === "video") {
      setCameraOn(!currentOn);
      onDeviceToggle("camera", !currentOn);
    } else {
      setMicOn(!currentOn);
      onDeviceToggle("mic", !currentOn);
    }
  };

  return (
    <div className="flex gap-4 mt-2">
      <button onClick={() => toggleTrack("video", cameraOn)}>
        {cameraOn ? <Camera className="text-green-500" /> : <CameraOff className="text-red-500" />}
      </button>
      <button onClick={() => toggleTrack("audio", micOn)}>
        {micOn ? <Mic className="text-green-500" /> : <MicOff className="text-red-500" />}
      </button>
    </div>
  );
}
