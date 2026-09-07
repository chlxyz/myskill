"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreBar } from "@/components/atoms/ScoreBar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface Answer {
  choiceIndex: number | null;
}

interface Question {
  id: number;
  content: string;
  choices: { id: number; content: string; isCorrect: boolean }[];
}

interface ResultPanelProps {
  score: number;
  totalQuestions: number;
  questions: Question[];
  answers: Answer[];
}

export function ResultPanel({ score, totalQuestions, questions, answers }: ResultPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScoreBar score={score} total={totalQuestions} />
          <p className="text-sm text-muted-foreground text-center">
            {score} out of {totalQuestions} correct
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {questions.map((question, index) => {
          const userAnswer = answers[index];
          const correctChoice = question.choices.find((c) => c.isCorrect);
          const isCorrect = userAnswer?.choiceIndex !== null && question.choices[userAnswer?.choiceIndex ?? 0]?.isCorrect;

          return (
            <Card key={question.id}>
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{question.content}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your answer: {question.choices[userAnswer?.choiceIndex ?? -1]?.content || "No answer"}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-emerald-600 mt-1">
                        Correct: {correctChoice?.content}
                      </p>
                    )}
                  </div>
                  <Badge variant={isCorrect ? "success" : "destructive"}>
                    {isCorrect ? "Correct" : "Wrong"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
