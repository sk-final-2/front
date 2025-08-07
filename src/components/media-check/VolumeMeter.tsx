"use client";

interface VolumeMeterProps {
  volume: number;
  segmentCount?: number;
}

const VolumeMeter = ({ volume, segmentCount = 20 }: VolumeMeterProps) => {
  // 볼륨 값(0-255)을 기반으로 활성화할 막대의 수를 계산합니다.
  const activeSegments = Math.round((volume / 255) * segmentCount);

  return (
    <div className="flex items-end height-[50px] gap-[2px] mt-1">
      {Array.from({ length: segmentCount }).map((_, index) => {
        const isActive = index < activeSegments;
        const height = `h-[${10 + (index / segmentCount) * 40}px]`; // 막대 높이를 점진적으로 증가

        return (
          <div
            key={index}
            className={`w-[5px] rounded-md transition-colors duration-100 ease-in-out ${height} ${
              isActive ? "bg-[#4ade80]" : "bg-[#e5e7eb]"
            }`}
          />
        );
      })}
    </div>
  );
};

export default VolumeMeter;
