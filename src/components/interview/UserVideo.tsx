import { useEffect, useRef } from "react";

interface UserVideoProps {
  stream: MediaStream | null;
  /** pip: 16:9 컨테이너 + cover / main: 컨테이너 비율 강제 해제 + contain */
  mode?: "main" | "pip";
}

export default function UserVideo({ stream, mode = "pip" }: UserVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.playsInline = true;
    }
  }, [stream]);

  const isMain = mode === "main";

  return (
    <div
      className={[
        "relative w-full bg-gray-200 rounded-xl overflow-hidden",
        // ✅ PiP일 때만 16:9 강제, 메인일 때는 비율 강제 X
        isMain ? "h-full" : "aspect-[16/9] md:aspect-[16/9]",
      ].join(" ")}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        // ✅ 메인: 전체 보이도록 contain, PiP: 꽉 차게 cover
        className={[
          "absolute inset-0 w-full h-full",
          isMain ? "object-contain" : "object-cover",
        ].join(" ")}
      />
    </div>
  );
}
