"use client";

import { cn } from "@/lib/utils";

interface QuizTimerProps {
  seconds: number;
  className?: string;
  warning?: boolean;
}

export function QuizTimer({ seconds, className, warning = false }: QuizTimerProps) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${minutes}:${secs < 10 ? "0" : ""}${secs}`;

  return (
    <div
      className={cn(
        "font-mono text-lg font-semibold tabular-nums",
        warning && "text-destructive animate-pulse",
        className
      )}
    >
      {formatted}
    </div>
  );
}
