import { useEffect, useRef, useState } from "react";


const InterviewVideoComponent = () => {

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

  

  return (
    <div className="mt-5">
      <video
      className="border-2 border-amber-200 rounded-2xl"
        ref={videoRef}
        controls
        width="780"
        height="420"
        src="http://localhost:8080/api/interview/media?interviewId=1&seq=1"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      ></video>
      
    </div>
  );
};

export default InterviewVideoComponent;
