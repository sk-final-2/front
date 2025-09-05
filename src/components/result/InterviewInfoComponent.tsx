import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InterviewInfoType = {
  createdAt: string | null;
  job: string | null;
  career: string | null;
  type: string | null;
  level: string | null;
  language: string | null;
};

const InterviewInfoComponent = ({
  createdAt,
  job,
  career,
  type,
  level,
  language,
}: InterviewInfoType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>면접 정보</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        <span className="text-base font-bold mx-4">선택한 직종: {job}</span>
        <span className="text-base font-bold mx-4">선택한 경력: {career}</span>
        <span className="text-base font-bold mx-4">면접 형식: {type}</span>
        <span className="text-base font-bold mx-4">난이도: {level}</span>
        <span className="text-base font-bold mx-4">언어: {language}</span>
      </CardContent>
    </Card>
  );
};

export default InterviewInfoComponent;
