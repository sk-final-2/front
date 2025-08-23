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
    <div className="flex gap-3">
      {seqList.map((item) => (
        <Button
          variant="default"
          className={`cursor-pointer hover:scale-105 size-10 ${
            seq === item
              ? "scale-105 border-[1px] bg-primary-foreground text-primary hover:text-primary hover:bg-primary-foreground"
              : ""
          }`}
          key={item}
          onClick={() => handleCurrentSeq(item)}
        >
          {item}
        </Button>
      ))}
    </div>
  );
};

export default QuestionListComponent;
