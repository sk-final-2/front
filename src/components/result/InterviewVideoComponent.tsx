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
    <div className="mt-5 flex md:flex-col flex-row">
      <video
        key={currentSeq}
        className="rounded-2xl"
        ref={videoRef}
        controls
        width="780"
        height="420"
        src={`${process.env.NEXT_PUBLIC_API_URL}/api/interview/media?interviewId=${interviewId}&seq=${currentSeq}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      ></video>
      {/** 타임 스탬프 리스트 */}
      <div className="flex flex-row">
        <Carousel>
          <CarouselContent className="flex gap-2">
            {timestamp.map((item, idx) => (
              <CarouselItem
                key={idx}
                onClick={() => handleTimeStampClick(item)}
                className="bg-background md:basis-1/3 lg:basis-1/4"
              >
                <Card>
                  <CardContent className="flex flex-col text-foreground">
                    <span>{item.time ?? `Timestamp ${idx + 1}`}</span>
                    <span>{item.reason}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default InterviewVideoComponent;
