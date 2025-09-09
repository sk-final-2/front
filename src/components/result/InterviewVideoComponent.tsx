import { TimeStampListType } from "@/store/interview/resultSlice";
import { useRef, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const BUCKET = 5; // 5초 단위

function toSec(mmss: string) {
  const [m = "0", s = "0"] = (mmss ?? "0:0").split(":");
  const sec = Number(m) * 60 + Number(s);
  return Number.isFinite(sec) ? sec : 0;
}
function mmss(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

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
    if (!videoRef.current) return;
    const [minutes, seconds] = item.time.split(":").map(Number);
    const seekTime = minutes * 60 + seconds;
    videoRef.current.currentTime = seekTime;
  };

  // ✅ 가벼운 구간 요약: timestamp만 한 번 순회해서 5초 버킷으로 그룹핑
  const sectionRows = useMemo(() => {
    if (!timestamp?.length)
      return [] as Array<{ start: number; end: number; summary: string }>;

    // 버킷별 카운트 누적 (Map 사용)
    const map = new Map<
      number,
      { start: number; end: number; gaze: number; head: number; expr: number }
    >();

    for (const t of timestamp) {
      const sec = toSec(t.time);
      const bucketStart = Math.floor(sec / BUCKET) * BUCKET;
      const key = bucketStart;
      if (!map.has(key)) {
        map.set(key, {
          start: bucketStart,
          end: bucketStart + BUCKET,
          gaze: 0,
          head: 0,
          expr: 0,
        });
      }
      const cell = map.get(key)!;
      const r = t.reason || "";
      if (r.includes("시선")) cell.gaze += 1;
      if (r.includes("고개")) cell.head += 1;
      if (r.includes("표정")) cell.expr += 1;
    }

    // 정렬 + 문장 만들기
    return Array.from(map.values())
      .sort((a, b) => a.start - b.start)
      .map(({ start, end, gaze, head, expr }) => {
        const parts: string[] = [];
        if (gaze) parts.push(`시선처리 ${gaze}회`);
        if (head) parts.push(`고개 움직임 ${head}회`);
        if (expr) parts.push(`표정 감지 ${expr}회`);
        return {
          start,
          end,
          summary: parts.join(", ") || "이 구간에 이벤트 없음",
        };
      });
  }, [timestamp]);

  // 시간별은 기존 카드 그대로 전체 그리드로 뿌리기 (슬라이드 X)
  const timeRows = useMemo(
    () => [...timestamp].sort((a, b) => toSec(a.time) - toSec(b.time)),
    [timestamp],
  );

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
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">질문 {currentSeq}</div>

          <Tabs defaultValue="section">
            <TabsList className="grid w-[220px] grid-cols-2">
              <TabsTrigger value="section">구간 별</TabsTrigger>
              <TabsTrigger value="time">시간 별</TabsTrigger>
            </TabsList>

            {/* 구간 별 */}
            <TabsContent value="section" className="mt-3">
              <ul className="space-y-2">
                {sectionRows.map((row, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => {
                        if (videoRef.current)
                          videoRef.current.currentTime = row.start;
                      }}
                      className="w-full text-left"
                    >
                      <Card className="h-[8px] flex justify-center cursor-pointer border-border hover:bg-accent transition-colors">
                        <div className="flex items-center gap-3 px-4 py-3">
                          <span className="font-semibold text-sm md:text-base min-w-[110px]">
                            {mmss(row.start)}~{mmss(row.end)}
                          </span>
                          <span className="text-[13px] font-medium text-muted-foreground truncate">
                            {row.summary}
                          </span>
                        </div>
                      </Card>
                    </button>
                  </li>
                ))}
              </ul>
            </TabsContent>

            {/* 시간 별 */}
            <TabsContent value="time" className="mt-3">
              <div className="grid gap-1.5 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                {timeRows.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTimeStampClick(item)}
                    className="text-left"
                    title={item.reason}
                  >
                    <Card className=" h-[4px] cursor-pointer flex justify-center items-left pl-1 border-border hover:bg-accent transition-colors">
                      <CardContent className="px-2 flex flex-col justify-center">
                        <div className="text-[11px] text-muted-foreground leading-none">
                          {item.time ?? `Timestamp ${idx + 1}`}
                        </div>
                        <div className="text-xs font-medium truncate leading-snug">
                          {item.reason}
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default InterviewVideoComponent;
