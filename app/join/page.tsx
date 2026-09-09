"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { AppShell } from "@/components/organisms/AppShell";
import { SearchInput } from "@/components/molecules/SearchInput";
import { QuizMeta } from "@/components/molecules/QuizMeta";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function JoinPage() {
  const [quizData, setQuizData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleSearch = async (quizId: string) => {
    setLoading(true);
    setError("");
    setQuizData(null);
    try {
      const res = await axios.get(`/api/get-quiz/${quizId}`);
      setQuizData(res.data);
    } catch {
      setError("No exam found with that ID");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <AppShell title="Join Exam">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppShell>
    );
  }

  if (!session) {
    return (
      <AppShell title="Join Exam">
        <div className="flex items-center justify-center h-full">
          <div className="portal-card rounded-xl p-8 text-center max-w-md">
            <p className="text-muted-foreground">You must be signed in to join an exam.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Join Exam" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Join Exam" }]}>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Enter Exam ID</h2>
            <p className="text-sm text-muted-foreground">Input the exam ID to search and participate</p>
          </div>

          <div className="portal-card rounded-xl p-6 space-y-4">
            <SearchInput onSearch={handleSearch} loading={loading} placeholder="Enter exam ID" />

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            {quizData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.04]">
                  <QuizMeta
                    title={quizData.title}
                    duration={quizData.duration}
                    questionCount={quizData.questions?.length || 0}
                    description={quizData.description}
                    creatorName={quizData.creator?.username}
                  />
                </div>
                <Button
                  className="w-full h-11 rounded-xl portal-btn-primary text-white font-medium border-0"
                  onClick={() => router.push(`/quizpage/${quizData.id}`)}
                >
                  Join Exam
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
