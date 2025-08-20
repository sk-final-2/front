import { Button } from "../ui/button";

type QuestionListComponentProps = {
  seq: number;
  count: number;
  handleCurrentSeq: (seq: number) => void;
};

const QuestionListComponent = ({
  seq,
  count,
  handleCurrentSeq,
}: QuestionListComponentProps) => {
  const seqList = Array.from({ length: count }, (_, index) => index + 1);

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
