"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { AppShell } from "@/components/organisms/AppShell";
import { DashboardCharts } from "@/components/organisms/DashboardCharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, BarChart3, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quizId");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) return;
    axios
      .get(`/api/dashboard/${quizId}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [quizId]);

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Dashboard">
        <div className="flex items-center justify-center h-full">
          <p className="text-destructive">{error}</p>
        </div>
      </AppShell>
    );
  }

  const calculateScore = (answers: any[], questions: any[]) => {
    let correct = 0;
    answers.forEach((answer: any) => {
      const question = questions.find((q: any) => q.id === answer.questionId);
      const correctChoice = question?.choices.find((c: any) => c.isCorrect);
      if (correctChoice && answer.choiceId === correctChoice.id) correct++;
    });
    return ((correct / questions.length) * 100).toFixed(1);
  };

  return (
    <AppShell
      title="Dashboard"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
      topBarExtra={<Badge variant="outline">Quiz ID: {quizId}</Badge>}
    >
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Stats row */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{data.quiz.results.length}</p>
                    <p className="text-xs text-muted-foreground">Respondents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{data.quiz.questions.length}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{data.quiz.duration}m</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardCharts quizId={quizId!} />
            </div>

            <Card>
              <CardContent className="pt-5">
                <h3 className="text-sm font-medium mb-3">Respondents</h3>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {data.quiz.results.map((result: any) => (
                      <div key={result.id} className="p-2.5 rounded-lg bg-muted/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs">{result.user?.username || "N/A"}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {calculateScore(result.answers, data.quiz.questions)}%
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{result.user?.email}</p>
                        <p className="text-[11px]">
                          Prediction: <span className="font-medium">{data.predictions[result.user?.id] || "N/A"}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
