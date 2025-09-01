// src/components/interview/UserVideo.tsx
import { useEffect, useRef } from "react";

type Fit = "cover" | "contain";

interface UserVideoProps {
  stream: MediaStream | null;
  fit?: Fit; // default: 'cover'
  className?: string;
}

export default function UserVideo({ stream, fit = "cover", className = "" }: UserVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null;
      videoRef.current.playsInline = true;
    }
  }, [stream]);

  return (
    <div className={`relative w-full rounded-xl overflow-hidden bg-gray-200 ${className}`}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          className={`absolute inset-0 w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
        />
      ) : (
        <div className="flex items-center justify-center aspect-video text-gray-500">
          카메라 연결 안 됨
        </div>
      )}
    </div>
  );
}
