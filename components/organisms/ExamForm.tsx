"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface Choice {
  id?: number;
  content: string;
  isCorrect: boolean;
}

interface Question {
  id?: number;
  content: string;
  score: number;
  difficulty: string;
  choices: Choice[];
}

export function ExamForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quizId");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { content: "", score: 0, difficulty: "easy", choices: [{ content: "", isCorrect: false }] },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quizId) {
      axios
        .get(`/api/quizzes/${quizId}`)
        .then((res) => {
          const { title, description, duration, questions } = res.data;
          setTitle(title);
          setDescription(description);
          setDuration(String(duration));
          setQuestions(questions);
        })
        .catch((err) => setError(err.response?.data?.error || "Failed to fetch quiz"));
    }
  }, [quizId]);

  const addQuestion = () => {
    setQuestions([...questions, { content: "", score: 0, difficulty: "easy", choices: [{ content: "", isCorrect: false }] }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addChoice = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].choices.push({ content: "", isCorrect: false });
    setQuestions(updated);
  };

  const removeChoice = (qIndex: number, cIndex: number) => {
    const updated = [...questions];
    updated[qIndex].choices = updated[qIndex].choices.filter((_, i) => i !== cIndex);
    setQuestions(updated);
  };

  const updateQuestion = (qIndex: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    (updated[qIndex] as any)[field] = value;
    setQuestions(updated);
  };

  const updateChoice = (qIndex: number, cIndex: number, field: keyof Choice, value: any) => {
    const updated = [...questions];
    (updated[qIndex].choices[cIndex] as any)[field] = value;
    setQuestions(updated);
  };

  const validate = (): string | null => {
    if (!title.trim()) return "Title is required";
    if (!duration || parseInt(duration, 10) <= 0) return "Duration must be a positive number";
    if (questions.length === 0) return "At least one question is required";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content.trim()) return `Question ${i + 1} content cannot be blank`;
      if (q.choices.length === 0) return `Question ${i + 1} must have at least one choice`;
      const hasCorrect = q.choices.some((c) => c.isCorrect);
      if (!hasCorrect) return `Question ${i + 1} must have at least one correct answer`;
      for (let j = 0; j < q.choices.length; j++) {
        if (!q.choices[j].content.trim()) return `Question ${i + 1}, choice ${String.fromCharCode(65 + j)} cannot be blank`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }
      const method = quizId ? "PUT" : "POST";
      const url = quizId ? `/api/quizzes/${quizId}` : "/api/quizzes";
      const res = await axios({ method, url, data: { title, description, duration, questions } });
      if (res.status === 200 || res.status === 201) router.push("/history");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">Loading...</p></div>;
  if (!session) return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">You must be logged in</p></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Exam title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Exam description (optional)" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Questions</h3>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="h-4 w-4 mr-1" /> Add Question
          </Button>
        </div>

        {questions.map((question, qIndex) => (
          <Card key={qIndex}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Question {qIndex + 1}</Label>
                    <Badge variant={question.difficulty === "easy" ? "success" : question.difficulty === "hard" ? "destructive" : "warning"}>
                      {question.difficulty}
                    </Badge>
                  </div>
                  <Input
                    value={question.content}
                    onChange={(e) => updateQuestion(qIndex, "content", e.target.value)}
                    placeholder="Enter question"
                    required
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeQuestion(qIndex)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Score</Label>
                  <Input
                    type="number"
                    value={question.score}
                    onChange={(e) => updateQuestion(qIndex, "score", parseInt(e.target.value, 10) || 0)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Difficulty</Label>
                  <select
                    value={question.difficulty}
                    onChange={(e) => updateQuestion(qIndex, "difficulty", e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Choices</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => addChoice(qIndex)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Choice
                  </Button>
                </div>
                {question.choices.map((choice, cIndex) => (
                  <div key={cIndex} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={choice.isCorrect}
                      onChange={(e) => updateChoice(qIndex, cIndex, "isCorrect", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Input
                      value={choice.content}
                      onChange={(e) => updateChoice(qIndex, cIndex, "content", e.target.value)}
                      placeholder={`Choice ${String.fromCharCode(65 + cIndex)}`}
                      className="flex-1"
                      required
                    />
                    {question.choices.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeChoice(qIndex, cIndex)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : quizId ? "Update Exam" : "Create Exam"}
        </Button>
      </div>
    </form>
  );
}
