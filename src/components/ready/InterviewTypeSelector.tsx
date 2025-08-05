import { InterviewType } from "@/app/ready/page";

interface InterviewTypeSelectorProps {
  selectedType: string;
  handleTypeChange: (type: InterviewType) => void;
}

const typeMap: Record<InterviewType, string> = {
  PERSONALITY: "인성 면접",
  TECHNICAL: "기술 면접",
  MIXED: "혼합 면접",
};

const colorMap: Record<InterviewType, string> = {
  PERSONALITY: "bg-[#D1E7DD] border-[#A8D8B9] border-[3px]",
  TECHNICAL: "bg-[#B3CDE0] border-[#AEC6CF] border-[3px]",
  MIXED: "bg-[#D3D3D3] border-[#C3B1E1] border-[3px]",
};

const InterviewTypeSelector = ({
  selectedType,
  handleTypeChange,
}: InterviewTypeSelectorProps) => {
  const keys = Object.keys(typeMap) as InterviewType[];

  return (
    <div className="flex flex-row gap-10 w-4/6 h-full mt-4">
      {keys.map((key) => (
        <div
          key={key}
          onClick={() => handleTypeChange(key)}
          className={`flex items-center justify-center flex-1 border-[1px] border-solid rounded-[25%] shadow-lg
            cursor-pointer transition-color duration-500 hover:scale-105 h-full
            ${selectedType === key ? `${colorMap[key]}` : "bg-white"}`}
        >
          <span className="text-2xl font-bold">{typeMap[key]}</span>
        </div>
      ))}
    </div>
  );
};

export default InterviewTypeSelector;
