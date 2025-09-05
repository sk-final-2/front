import { TimeStampListType } from "@/store/interview/resultSlice";
import { useRef, useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const InterviewVideoComponent = ({
  interviewId,
  currentSeq,
  timestamp = [],
}: {
  interviewId: string;
  currentSeq: number;
  timestamp: Array<TimeStampListType>;
}) => {
  // 영상 상태
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeStampClick = (item: TimeStampListType) => {
    if (videoRef.current) {
      const [minutes, seconds] = item.time.split(":").map(Number);
      const seekTime = minutes * 60 + seconds;
      videoRef.current.currentTime = seekTime;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden bg-black/90">
        <video
          key={currentSeq}
          ref={videoRef}
          controls
          className="w-full h-auto aspect-video"
          src={`${process.env.NEXT_PUBLIC_API_URL}/api/interview/media?interviewId=${interviewId}&seq=${currentSeq}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      </div>

      {/* 타임스탬프 */}
      {timestamp?.length > 0 && (
        <div>
          <div className="text-sm text-muted-foreground mb-2">질문 {currentSeq} 구간</div>
          <Carousel>
            <CarouselContent className="flex gap-2">
              {timestamp.map((item, idx) => (
                <CarouselItem
                  key={idx}
                  onClick={() => handleTimeStampClick(item)}
                  className="md:basis-1/3 lg:basis-1/4 cursor-pointer"
                >
                  <Card className="hover:bg-accent transition-colors border-border">
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground">{item.time ?? `Timestamp ${idx + 1}`}</div>
                      <div className="text-sm font-medium">{item.reason}</div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default InterviewVideoComponent;
