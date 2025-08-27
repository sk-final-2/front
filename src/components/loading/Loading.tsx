type LoadingProps = {
  message: string;
};

export default function Loading({ message }: LoadingProps) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/70 backdrop-blur-sm rounded-md"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
      <div className="text-sm text-gray-700">{message}</div>
    </div>
  );
}