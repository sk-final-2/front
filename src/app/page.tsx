import MainHeader from "@/components/header/Header";
import MainScene from "@/components/home/MainScene";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const introduceCardContents = [
  {
    title: "1",
    content: "내용 1",
  },
  {
    title: "2",
    content: "내용 2",
  },
  {
    title: "3",
    content: "내용 3",
  },
];

export default function Home() {
  return (
    <div className="">
      <MainHeader />
      <main className="w-full flex flex-col">
        {/** 첫 번째 컨테이너 : 타이틀 + 이미지 */}
        <div className="w-full h-[500px] static min-w-[1440px] bg-gradient-to-b from-gray-200 to-transparent to-90%">
          <div className="w-full absolute h-[500px] flex justify-center items-center">
            <MainScene />
          </div>
          <div className=" h-[450px] flex flex-col p-30">
            <span className="mt-10 text-4xl">타이틀 문구</span>
            <span className="mt-5 text-2xl">소개 문구</span>
            <Button className="w-[150px] mt-4 cursor-pointer text-primary-foreground hover:border-2 hover:border-ring z-50">
              바로 면접 진행하기
            </Button>
          </div>
        </div>

        {/** 두 번째 컨테이너 : 간단 기능 소개 카드 */}
        <div className="w-full h-[500px]">
          <div className="w-full h-full flex lg:flex-row lg:gap-20 flex-col gap-5 justify-center items-center ">
            {introduceCardContents.map((item) => (
              <Card key={item.title} className="lg:w-[300px] w-full h-[350px]">
                <CardContent className="flex flex-col flex-1">
                  <span>{item.title}</span>
                  <span>{item.content}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/** 세 번째 컨테이너 : 가이드 라인 */}
        <div className="h-[500px] w-full"></div>
      </main>
    </div>
  );
}
