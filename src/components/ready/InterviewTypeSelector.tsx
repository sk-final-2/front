import { InterviewType } from "@/app/ready/page";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface InterviewTypeSelectorProps {
  selectedType: string;
  handleTypeChange: (type: InterviewType) => void;
}

const typeImage = [
  {
    type: "PERSONALITY",
    src: "/ready/personality.png",
    alt: "인성 면접",
  },
  { type: "TECHNICAL", src: "/ready/technical.png", alt: "기술 면접" },
  { type: "MIXED", src: "/ready/comprehensive.png", alt: "종합 면접" },
];

const InterviewTypeSelector = ({
  selectedType,
  handleTypeChange,
}: InterviewTypeSelectorProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full max-w-4xl mt-4">
      {typeImage.map((image) => (
        <Card
          key={image.alt}
          onClick={() => handleTypeChange(image.type as InterviewType)}
          className={`flex flex-col items-center justify-center flex-1 bg-white rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${selectedType === image.type ? 'border-primary border-4' : 'border-transparent border-4'}`}>
          <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <Image
                src={image.src}
                alt={image.alt}
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span className="text-center text-xl md:text-2xl font-bold">
              {image.alt}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InterviewTypeSelector;
