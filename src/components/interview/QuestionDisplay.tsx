interface QuestionDisplayProps {
  question: string;
}

export default function QuestionDisplay({ question }: QuestionDisplayProps) {
  return (
    <div className="bg-blue-200 p-4 text-center text-lg font-bold rounded">
      <p>{question}</p>
    </div>
  );
}
