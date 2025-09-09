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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AnswerAnalyseType, AvgScoreType } from "@/store/interview/resultSlice";
import { AnswerAnalysesArrayType } from "@/store/user-details/userDetailsSlice";

const chartConfig = {
  average: {
    label: "Average",
    color: "var(--chart-5)",
  },
  answerScore: {
    label: "Answer Score",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function TotalGraphComponent({
  avgScore,
  answerScore,
}: {
  avgScore: AvgScoreType;
  answerScore: AnswerAnalyseType | AnswerAnalysesArrayType;
}) {
  const chartData = [
    { item: "score", 평균: avgScore.score, 점수: answerScore.score },
    {
      item: "emotion",
      평균: avgScore.emotionScore,
      점수: answerScore.emotionScore,
    },
    { item: "blink", 평균: avgScore.blinkScore, 점수: answerScore.blinkScore },
    { item: "eye", 평균: avgScore.eyeScore, 점수: answerScore.eyeScore },
    { item: "head", 평균: avgScore.headScore, 점수: answerScore.headScore },
    { item: "hand", 평균: avgScore.handScore, 점수: answerScore.handScore },
  ];
  return (
    <div className="w-full my-10">
      <Card className="w-full border-border">
        <CardHeader className="items-center pb-4">
          <CardTitle className="text-xl">종합 분석</CardTitle>
          <CardDescription className="font-bold">
            사용자의 면접 기록을 바탕으로 생성되었습니다.
          </CardDescription>
        </CardHeader>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-[400px]"
        >
          <>
            <CardContent className="pb-0">
              <RadarChart data={chartData}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <PolarAngleAxis dataKey="item" className="text-sm font-bold" />
                <PolarGrid />
                <Radar
                  dataKey="점수"
                  fill="var(--color-average)"
                  fillOpacity={0}
                  stroke="var(--color-average)"
                  strokeWidth={2}
                />
                <Radar
                  dataKey="평균"
                  fill="var(--color-answerScore)"
                  fillOpacity={0.6}
                  stroke="var(--color-answerScore)"
                />
              </RadarChart>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <ChartLegend className="mt-8" content={<ChartLegendContent />} />
            </CardFooter>
          </>
        </ChartContainer>
      </Card>
    </div>
  );
}
