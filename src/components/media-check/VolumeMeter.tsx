"use client";

interface VolumeMeterProps {
  volume: number;        // 0 ~ 255
  segmentCount?: number; // 막대 개수
}

const VolumeMeter = ({ volume, segmentCount = 20 }: VolumeMeterProps) => {
  const activeSegments = Math.round((volume / 255) * segmentCount);

  return (
    <div className="flex items-end gap-[2px] mt-1" style={{ height: 50 }}>
      {Array.from({ length: segmentCount }).map((_, index) => {
        const isActive = index < activeSegments;
        const px = 10 + (index / segmentCount) * 40; // 10~50px
        return (
          <div
            key={index}
            className={`w-[5px] rounded-md transition-colors duration-100 ease-in-out ${
              isActive ? "bg-[#4ade80]" : "bg-[#e5e7eb]"
            }`}
            style={{ height: `${px}px` }}
          />
        );
      })}
    </div>
  );
};

export default VolumeMeter;
