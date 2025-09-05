import { Button } from "../ui/button";

type QuestionListComponentProps = {
  seq: number;
  seqList: number[]; // ✅ 변경: 렌더할 번호 배열을 직접 받음
  handleCurrentSeq: (seq: number) => void;
};

const QuestionListComponent = ({
  seq,
  seqList,
  handleCurrentSeq,
}: QuestionListComponentProps) => {
  if (!seqList || seqList.length === 0) {
    // 동적 모드에서 아직 결과가 없을 때 대비한 가드
    return null; // 혹은 스켈레톤/메시지
  }

  return (
    <div className="flex flex-wrap gap-2">
      {seqList.map((item) => {
        const active = seq === item;
        return (
          <Button
            key={item}
            onClick={() => handleCurrentSeq(item)}
            className={`px-4 py-2 rounded-lg transition-all ${
              active
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted text-foreground hover:bg-accent"
            }`}
            variant="default"
          >
            질문 {item}
          </Button>
        );
      })}
    </div>
  );
};

export default QuestionListComponent;
