import { Card } from "../ui/card";

const AnswerFeedbackComponent = ({
  good,
  bad,
}: {
  good: string;
  bad: string;
}) => {
  return (
    <div className="mt-5">
      <Card>
        <span className="ml-4">피드백: {good}</span>
        <span className="ml-4">개선점: {bad}</span>
      </Card>
    </div>
  );
};

export default AnswerFeedbackComponent;
