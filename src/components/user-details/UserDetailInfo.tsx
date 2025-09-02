"use client";

import { CategoryType } from "@/app/user-info/page";
import { Card } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { getUserBaseInfo } from "@/store/user-details/userDetailsSlice";
import Image from "next/image";
import { useEffect } from "react";

export default function UserDetailInfo({
  handleCurrentCategory,
}: {
  handleCurrentCategory: (category: CategoryType) => void;
}) {
  const { base } = useAppSelector((state) => state.user_details);
  const { interviews } = useAppSelector((state) => state.user_details);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getUserBaseInfo(null));
  }, [dispatch]);

  return (
    <div>
      <div className="pt-20 px-20 ">
        {/** 사용자 이름 */}
        <div className="p-10 text-4xl">
          <span className="text-primary">{base?.name}</span> 님
        </div>
        <Card className="h-36 shadow-xl border-border border-2 flex flex-row ">
          <div className="flex-1 flex flex-row justify-center items-center gap-5">
            <Image
              src="/complete_icon.png"
              alt="완료한 면접 갯수 아이콘"
              width={60}
              height={50}
            />
            <div
              className="flex flex-col hover:underline cursor-pointer"
              onClick={() => handleCurrentCategory("interviews")}
            >
              <span className="text-lg">완료한 면접</span>
              <span className="text-center text-xl font-bold">
                {interviews.length}
              </span>
            </div>
          </div>

          {/** separator */}
          <div className="w-[1px] border-[1px] border-border"></div>

          <div className="flex-1"></div>
        </Card>
      </div>
    </div>
  );
}
