import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";



const ResultPage = () => {
  return (
    <div className="w-full flex gap-2">
      {/** 질문 번호 리스트 */}
      <Button className="cursor-pointer" size="icon">1</Button>
      <Button className="cursor-pointer" size="icon">2</Button>
      <Button className="cursor-pointer" size="icon">3</Button>
      <Button className="cursor-pointer" size="icon">4</Button>
    </div>
  );
};

export default ResultPage;
