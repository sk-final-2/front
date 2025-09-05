import { Card } from "../ui/card";

const AnswerFeedbackComponent = ({
  good,
  bad,
}: {
  good: string;
  bad: string;
}) => {
  return (
    <Card className="p-4 space-y-4 border-border">
      <h2 className="text-base font-semibold mb-3">답변 피드백</h2>
      <div>
        <div className="text-sm font-semibold mb-2">피드백</div>
        <div className="bg-emerald-50 text-emerald-800 rounded-lg p-4">
          {good || "피드백이 없습니다."}
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold mb-2">개선점</div>
        <div className="bg-amber-50 text-amber-900 rounded-lg p-4">
          {bad || "개선점이 없습니다."}
        </div>
      </div>
    </Card>
  );
};

export default AnswerFeedbackComponent;
