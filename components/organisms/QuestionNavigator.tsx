"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuestionNavigatorProps {
  total: number;
  current: number;
  answers: { choiceIndex: number | null }[];
  onNavigate: (index: number) => void;
}

export function QuestionNavigator({ total, current, answers, onNavigate }: QuestionNavigatorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Questions</h3>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: total }, (_, i) => {
            const answered = answers[i]?.choiceIndex !== null;
            const isCurrent = i === current;
            return (
              <button
                key={i}
                onClick={() => onNavigate(i)}
                className={cn(
                  "h-9 w-full rounded-md text-sm font-medium transition-colors",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : answered
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
