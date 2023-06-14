export default function Spinner({ className }: { className?: string }) {
  return (
    <img
      src="/loader.gif"
      alt="loading spinner"
      className={`h-8 w-8 ${className ?? ""}`}
    />
  );
}
