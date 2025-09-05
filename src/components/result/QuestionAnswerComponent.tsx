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
    <div className="w-full">
      <div className="space-y-4">
        <Card className="p-4 border-border">
          <h2 className="text-base font-semibold mb-3">질문 및 답변</h2>
          <h3 className="text-sm font-semibold mb-2">질문</h3>
          <p className="text-foreground bg-muted rounded-lg p-4">{question || "질문이 없습니다."}</p>
          <h3 className="text-sm font-semibold mb-2">답변</h3>
          <p className="text-foreground bg-primary/10 rounded-lg p-4 leading-relaxed">
            {answer || "답변이 없습니다."}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default QuestionAnswerComponent;
