"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { AppShell } from "@/components/organisms/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ParticipantDashboardPage() {
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quizId");

  useEffect(() => {
    if (!quizId || !session?.user?.id) return;
    axios
      .get(`/api/participantdashboard/${quizId}`, { headers: { "user-id": session.user.id } })
      .then((res) => setQuizData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [quizId, session]);

  if (loading) {
    return (
      <AppShell title="Your Results">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Your Results">
        <div className="flex items-center justify-center h-full">
          <p className="text-destructive">{error}</p>
        </div>
      </AppShell>
    );
  }

  const { questions, answers } = quizData;

  return (
    <AppShell
      title="Your Results"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "History", href: "/history" }, { label: "Results" }]}
    >
      <div className="p-6 max-w-3xl space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="space-y-1 mb-6">
            <h2 className="text-lg font-semibold">Quiz Results</h2>
            <p className="text-sm text-muted-foreground">
              Review your answers and see the correct solutions
            </p>
          </div>

          <div className="space-y-3">
            {answers.map((answer: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card>
                  <CardContent className="py-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{answer.questionContent}</p>
                      {answer.isCorrect ? (
                        <Badge variant="success" className="shrink-0 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Correct
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="shrink-0 text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          Wrong
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your answer: <span className="font-medium text-foreground">{answer.choiceContent}</span>
                    </p>

                    <div className="space-y-1">
                      {questions
                        .find((q: any) => q.content === answer.questionContent)
                        ?.choices.map((choice: any) => (
                          <div
                            key={choice.id}
                            className={`text-xs px-2.5 py-1.5 rounded-md ${
                              choice.isCorrect
                                ? "bg-emerald-500/10 text-emerald-400"
                                : choice.content === answer.choiceContent && !answer.isCorrect
                                ? "bg-destructive/10 text-destructive"
                                : "text-muted-foreground"
                            }`}
                          >
                            {choice.content}
                            {choice.isCorrect && " (Correct)"}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
