import { Badge } from "@/components/ui/badge";
import { Clock, HelpCircle, User } from "lucide-react";

interface QuizMetaProps {
  title: string;
  duration: number;
  questionCount: number;
  description?: string;
  creatorName?: string;
}

export function QuizMeta({ title, duration, questionCount, description, creatorName }: QuizMetaProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}
      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {duration} min
        </span>
        <span className="flex items-center gap-1">
          <HelpCircle className="h-4 w-4" />
          {questionCount} questions
        </span>
        {creatorName && (
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {creatorName}
          </span>
        )}
      </div>
    </div>
  );
}
