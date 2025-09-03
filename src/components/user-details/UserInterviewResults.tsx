"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { getUserInterviewList } from "@/store/user-details/userDetailsSlice";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";

// export interface GetUserInterviewListResponseData {
//   uuid: string;
//   memberId: number;
//   createdAt: string;
//   job: string;
//   career: string;
//   type: string;
//   level: string;
//   language: string;
//   count: number;
//   answerAnalyses: Array<AnswerAnalysesArrayType>;
//   avgScore: Array<AvgScoreType>;
// }
// []

export default function UserInterviewResults() {
  const { interviews } = useAppSelector((state) => state.user_details);
  const router = useLoadingRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getUserInterviewList(null));
  }, [dispatch]);

  if (interviews.length == 0) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center gap-4">
        <span className="text-xl">현재 완료된 면접이 없습니다.</span>
        <Button
          className="cursor-pointer text-base"
          onClick={() => router.push("/ready")}
        >
          면접 진행하기
        </Button>
      </div>
    );
  }

  return (
    <div className="px-20 mt-30">
      <div className="grid  grid-cols-2 gap-3">
        {interviews.map((item) => (
          <Card
            key={item.uuid}
            className=" cursor-pointer border-[1px] border-border"
            onClick={() => router.push(`/info/result/${item.uuid}`)}
          >
            <CardContent className="flex flex-col gap-2">
              <div className="w-full flex flex-row justify-between">
                <span className="text-lg font-bold">{item.type}</span>
                <span>{item.level}</span>
              </div>

              <div className="w-full flex flex-row justify-between">
                <span>{item.job}</span>
                <span>{item.career}</span>
              </div>

              <span>{item.createdAt}</span>
              <span>{item.language}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
