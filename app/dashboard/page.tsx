"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { AppShell } from "@/components/organisms/AppShell";
import { DashboardCharts } from "@/components/organisms/DashboardCharts";
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

  const statCards = [
    { label: "Respondents", value: data.quiz.results.length, icon: Users, color: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-400" },
    { label: "Questions", value: data.quiz.questions.length, icon: BarChart3, color: "from-orange-500/20 to-amber-500/20", iconColor: "text-orange-400" },
    { label: "Duration", value: `${data.quiz.duration}m`, icon: Clock, color: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-400" },
  ];

  return (
    <AppShell
      title="Dashboard"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
      topBarExtra={<Badge variant="outline" className="border-black/[0.1] dark:border-white/[0.1] text-muted-foreground">Quiz ID: {quizId}</Badge>}
    >
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Stats row */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {statCards.map((stat) => (
              <div key={stat.label} className="portal-card rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardCharts quizId={quizId!} />
            </div>

            <div className="portal-card rounded-xl p-5">
              <h3 className="text-sm font-medium mb-3">Respondents</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {data.quiz.results.map((result: any) => (
                    <div key={result.id} className="p-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.04] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs">{result.user?.username || "N/A"}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-black/[0.1] dark:border-white/[0.1]">
                          {calculateScore(result.answers, data.quiz.questions)}%
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{result.user?.email}</p>
                      <p className="text-[11px]">
                        Prediction: <span className="font-medium text-orange-400">{data.predictions[result.user?.id] || "N/A"}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
