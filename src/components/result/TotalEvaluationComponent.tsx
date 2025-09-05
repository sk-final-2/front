import { Card } from "../ui/card";

const TotalEvaluationComponent = () => {

    
    return (
    <Card className="p-5 space-y-4 my-5 border-border">
      <h3 className="text-base font-semibold">최종 분석</h3>
      <p className="text-sm text-muted-foreground">
        여기는 최종 분석 내용이 들어갈 자리입니다. (추후 실제 데이터 연결)
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted p-3">
          <div className="text-xs text-muted-foreground">강점</div>
          <div className="text-sm font-medium">예시 텍스트</div>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <div className="text-xs text-muted-foreground">개선점</div>
          <div className="text-sm font-medium">예시 텍스트</div>
        </div>
      </div>
    </Card>
  );
};


export default TotalEvaluationComponent;