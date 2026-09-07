import { cn } from "@/lib/utils";

interface ScoreBarProps {
  score: number;
  total: number;
  className?: string;
}

export function ScoreBar({ score, total, className }: ScoreBarProps) {
  const percentage = total > 0 ? (score / total) * 100 : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Score</span>
        <span className="font-medium">
          {score}/{total}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
