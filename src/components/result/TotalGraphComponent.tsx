"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function TotalGraphComponent({
  score,
  emotionScore,
  blinkScore,
  eyeScore,
  headScore,
  handScore,
}: {
  score: number;
  emotionScore: number;
  blinkScore: number;
  eyeScore: number;
  headScore: number;
  handScore: number;
}) {
  const chartData = [
    { item: "score", 점수: score },
    { item: "emotion", 점수: emotionScore },
    { item: "blink", 점수: blinkScore },
    { item: "eye", 점수: eyeScore },
    { item: "head", 점수: headScore },
    { item: "hand", 점수: handScore },
  ];

  return (
    <div className="w-full my-10">
      <Card className="w-full">
        <CardHeader className="items-center pb-4">
          <CardTitle className="text-xl">분석 차트</CardTitle>
          <CardDescription className="font-bold">
            사용자의 면접 기록을 바탕으로 생성되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-[400px]"
          >
            <RadarChart data={chartData}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarGrid className="fill-(--color-desktop) opacity-20" />
              <PolarAngleAxis dataKey="item" className="text-sm font-bold" />
              <Radar
                dataKey="점수"
                fill="var(--color-desktop)"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div>
            <span>여기에 추가 내용 있으면 작성</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
