"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AppShell } from "@/components/organisms/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Pencil, BarChart3, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [view, setView] = useState<"joined" | "created">("joined");
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/history?type=${view}`, { headers: { "user-id": session.user.id } })
      .then((res) => res.json())
      .then((data) => setQuizzes(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [view, session]);

  const handleDelete = async (quizId: number) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
      if (res.ok) setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (err) {
      console.error("Error deleting quiz:", err);
    }
  };

  return (
    <AppShell
      title="Exam History"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "History" }]}
    >
      <div className="p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Your Exams</h2>
              <p className="text-sm text-muted-foreground">
                View and manage your created and joined exams
              </p>
            </div>
          </div>

          <Tabs defaultValue="joined">
            <TabsList className="mb-6">
              <TabsTrigger value="joined" active={view === "joined"} onClick={() => setView("joined")}>
                Joined Exams
              </TabsTrigger>
              <TabsTrigger value="created" active={view === "created"} onClick={() => setView("created")}>
                Created Exams
              </TabsTrigger>
            </TabsList>

            <div className="space-y-2">
              {quizzes.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No exams found
                  </CardContent>
                </Card>
              )}

              {quizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="transition-colors hover:border-primary/30">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm truncate">
                              {view === "joined" ? quiz.quiz?.title : quiz.title}
                            </h3>
                            <Badge variant="outline" className="shrink-0 text-xs">
                              ID: {view === "joined" ? quiz.quiz?.id : quiz.id}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {view === "joined" ? quiz.quiz?.description : quiz.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {view === "joined" && quiz.score !== undefined && (
                              <span>Score: {quiz.score}</span>
                            )}
                            {view === "joined" && quiz.quiz?.creator?.username && (
                              <span>by {quiz.quiz.creator.username}</span>
                            )}
                            {view === "created" && quiz.creator?.username && (
                              <span>by {quiz.creator.username}</span>
                            )}
                            {view === "created" && quiz.duration && (
                              <span>{quiz.duration} min</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          {view === "joined" ? (
                            <Link href={`/participantdashboard?quizId=${quiz.quiz?.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Review
                              </Button>
                            </Link>
                          ) : (
                            <>
                              <Link href={`/createquiz?quizId=${quiz.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 text-xs">
                                  <Pencil className="h-3.5 w-3.5 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Link href={`/dashboard?quizId=${quiz.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 text-xs">
                                  <BarChart3 className="h-3.5 w-3.5 mr-1" />
                                  Dashboard
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-destructive hover:text-destructive"
                                onClick={() => handleDelete(quiz.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Tabs>
        </motion.div>
      </div>
    </AppShell>
  );
}
