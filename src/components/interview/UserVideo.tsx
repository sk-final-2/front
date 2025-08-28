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
    <div className="relative w-full bg-gray-200 rounded-xl overflow-hidden aspect-[16/9] md:aspect-[16/9]">
    <video
      ref={videoRef}
      autoPlay
      muted
      className="absolute inset-0 w-full h-full object-cover"
    />
    </div>
  );
}
