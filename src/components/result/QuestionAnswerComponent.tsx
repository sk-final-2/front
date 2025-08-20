import { Card } from "../ui/card";

const QuestionAnswerComponent = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const messages = {
    question: "질문 아무거나",
    answer: "답변",
  };

  return (
    <div className="w-full flex flex-col mt-10 h-auto">
      <div className="flex flex-col gap-2">
        <Card>
          <div className="ml-4">
            <span className="font-semibold">질문 : </span>
            <span className="wrap-break-word">
              {question || "질문이 없습니다."}
            </span>
          </div>
        </Card>
        <Card>
          <div className="ml-4">
            <span className="font-semibold">답변 : </span>
            <span className="wrap-break-word">
              {answer || "답변이 없습니다."}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuestionAnswerComponent;
