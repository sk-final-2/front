import { useEffect, useRef } from "react";

interface UserVideoProps {
  stream: MediaStream | null;
}

export default function UserVideo({ stream }: UserVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      className="w-full aspect-video bg-gray-200 rounded object-cover"
    />
  );
}
