interface QuestionDisplayProps { question: string; }
export default function QuestionDisplay({ question }: QuestionDisplayProps) {
  return (
    <div className="bg-blue-200 p-4 text-center text-lg font-bold rounded min-h-16 flex items-center justify-center">
      <p>{question || "질문을 불러오는 중…"}</p>
    </div>
  );
}