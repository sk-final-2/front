import { InterviewType } from "@/app/ready/page";
import { Card } from "@/components/ui/card";

interface InterviewTypeSelectorProps {
  selectedType: string;
  handleTypeChange: (type: InterviewType) => void;
}

// 면접 타입 맵
const typeMap: Record<InterviewType, string> = {
  PERSONALITY: "인성 면접",
  TECHNICAL: "기술 면접",
  MIXED: "혼합 면접",
};

const InterviewTypeSelector = ({
  selectedType,
  handleTypeChange,
}: InterviewTypeSelectorProps) => {
  const keys = Object.keys(typeMap) as InterviewType[];

  return (
    <div className="flex lg:flex-row flex-col gap-10 w-4/6 h-full mt-4">
      {keys.map((key) => (
        <Card
          key={key}
          onClick={() => handleTypeChange(key)}
          className={`flex items-center justify-center flex-1 border-[1px] border-solid rounded-xl shadow-lg
            cursor-pointer transition-color duration-500 hover:scale-105 h-full
            ${selectedType === key ? `bg-primary text-primary-foreground` : ""}`}
        >
          <span className="text-2xl font-bold">{typeMap[key]}</span>
        </Card>
      ))}
    </div>
  );
};

export default InterviewTypeSelector;
