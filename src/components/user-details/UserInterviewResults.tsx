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
  const { base } = useAppSelector((state) => state.user_details);
  const router = useLoadingRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getUserInterviewList(null));
  }, [dispatch]);

  // if (interviews.length == 0) {
  //   return (
  //     <div className="w-full h-full flex flex-col justify-center items-center gap-4">
  //       <span className="text-xl">현재 완료된 면접이 없습니다.</span>
  //       <Button
  //         className="cursor-pointer text-base"
  //         onClick={() => router.push("/ready")}
  //       >
  //         면접 진행하기
  //       </Button>
  //     </div>
  //   );
  // }

  return (
    <div className="px-20 mt-30">
      <div className="grid lg:grid-cols-3 grid-cols-2 gap-3">
        <Card className=" cursor-pointer border-[1px] border-border">
          <CardContent className="flex flex-col gap-2">
            <div className="w-full flex flex-row justify-between">
              <span className="text-lg font-bold">종합 면접</span>
              <span>중</span>
            </div>

            <div className="w-full flex flex-row justify-between">
              <span>프론트엔드 개발자</span>
              <span>신입</span>
            </div>

            <span>2025년 09월 02일</span>
            <span>한국어</span>
          </CardContent>
        </Card>
        {interviews.map((item) => (
          <Card key={item.uuid}>
            <CardContent>
              <span>{item.job}</span>
              <span>{item.createdAt}</span>
              <span>{item.career}</span>
              <span>{item.level}</span>
              <span>{item.language}</span>
              <span>{item.type}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
