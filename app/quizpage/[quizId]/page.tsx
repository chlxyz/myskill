"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { QuestionNavigator } from "@/components/organisms/QuestionNavigator";
import { ChoiceButton } from "@/components/molecules/ChoiceButton";
import { ResultPanel } from "@/components/organisms/ResultPanel";
import { QuizTimer } from "@/components/atoms/QuizTimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Flag, Menu, X } from "lucide-react";
import Link from "next/link";

export default function QuizPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const quizId = pathname.split("/quizpage/")[1];

  const [quiz, setQuiz] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ choiceIndex: number | null; timeSpent: number }[]>([]);
  const [durationTimer, setDurationTimer] = useState(0);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (quizId) {
      fetch(`/api/get-quiz/${quizId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch quiz");
          return res.json();
        })
        .then((data) => {
          setQuiz(data);
          setAnswers(new Array(data.questions.length).fill({ choiceIndex: null, timeSpent: 0 }));
          setDurationTimer(data.duration * 60);
        })
        .catch((err) => setError(err.message));
    }
  }, [quizId]);

  useEffect(() => {
    if (durationTimer <= 0) return;
    const interval = setInterval(() => setDurationTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [durationTimer]);

  const handleAnswerSelect = (questionIndex: number, choiceIndex: number) => {
    const updated = [...answers];
    if (updated[questionIndex].choiceIndex === choiceIndex) {
      updated[questionIndex] = { ...updated[questionIndex], choiceIndex: null };
    } else {
      updated[questionIndex] = { ...updated[questionIndex], choiceIndex };
    }
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((p) => p - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setShowFinishDialog(false);
    try {
      const userId = parseInt(session!.user!.id as string, 10);
      const submissionData = {
        userId,
        quizId: parseInt(quizId!, 10),
        answers: answers.map((answer, index) => ({
          questionId: quiz.questions[index].id,
          choiceId: answer.choiceIndex !== null ? quiz.questions[index].choices[answer.choiceIndex].id : null,
          timeSpent: answer.timeSpent,
        })),
      };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      const data = await res.json();
      if (res.ok) {
        setScore(data.score);
        setShowResults(true);
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
    }
  };

  if (durationTimer <= 0 && quiz) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Time&apos;s Up!</h2>
            <p className="text-muted-foreground">Your quiz has been submitted automatically.</p>
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <header className="border-b bg-background/95 backdrop-blur shrink-0">
          <div className="container mx-auto px-4 h-14 flex items-center">
            <Link href="/" className="text-sm font-semibold">MYSkill</Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto container mx-auto px-4 py-8 max-w-3xl">
          <ResultPanel
            score={score}
            totalQuestions={quiz.questions.length}
            questions={quiz.questions}
            answers={answers}
          />
          <div className="mt-6 text-center">
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const question = quiz.questions[currentQuestionIndex];
  const isWarning = durationTimer <= 60;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Minimal top bar */}
      <header className="border-b bg-background/95 backdrop-blur shrink-0 z-40">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold">MYSkill</Link>
            <span className="text-muted-foreground">|</span>
            <h1 className="font-medium text-sm truncate max-w-[200px]">{quiz.title}</h1>
            <span className="text-xs text-muted-foreground">
              {currentQuestionIndex + 1} / {quiz.questions.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <QuizTimer seconds={durationTimer} warning={isWarning} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 px-2"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main question area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                <h2 className="text-lg font-medium">{question.content}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.choices.map((choice: any, index: number) => (
                    <ChoiceButton
                      key={index}
                      label={String.fromCharCode(65 + index)}
                      content={choice.content}
                      selected={answers[currentQuestionIndex]?.choiceIndex === index}
                      onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <Button onClick={() => setShowFinishDialog(true)}>
                      <Flag className="h-4 w-4 mr-1" />
                      Finish
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Question navigator sidebar */}
        <aside
          className={`${sidebarOpen ? "w-64" : "w-0"} border-l bg-muted/30 transition-all duration-300 overflow-hidden shrink-0 hidden md:block`}
        >
          <div className="p-4">
            <QuestionNavigator
              total={quiz.questions.length}
              current={currentQuestionIndex}
              answers={answers}
              onNavigate={setCurrentQuestionIndex}
            />
          </div>
        </aside>
      </div>

      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish Quiz?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit? You have answered{" "}
              {answers.filter((a) => a.choiceIndex !== null).length} out of {quiz.questions.length} questions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitQuiz}>Submit Quiz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
