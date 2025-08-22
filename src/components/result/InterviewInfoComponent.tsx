import { Card } from "../ui/card";

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
      <span className="text-base font-bold mx-4">선택한 직종: {job}</span>
      <span className="text-base font-bold mx-4">선택한 경력: {career}</span>
      <span className="text-base font-bold mx-4">면접 형식: {type}</span>
      <span className="text-base font-bold mx-4">난이도: {level}</span>
      <span className="text-base font-bold mx-4">언어: {language}</span>
    </Card>
  );
};

export default InterviewInfoComponent;
