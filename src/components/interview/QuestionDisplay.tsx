interface QuestionDisplayProps {
  question: string;
  index: number;
  total: number;
}

export default function QuestionDisplay({ question, index, total }: QuestionDisplayProps) {
  return (
    <div className="bg-blue-200 p-4 text-center text-lg font-bold rounded">
      {/* <p>{`질문 ${index + 1} / ${total}`} {question}</p> */}
      <p>{question}</p>
      {/* <p className="mt-2">{question}</p> */}
    </div>
  );
}
