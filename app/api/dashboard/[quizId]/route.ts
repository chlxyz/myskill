import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

const difficultyMapping: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

export async function GET(req: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;

  if (!quizId || isNaN(parseInt(quizId, 10))) {
    return NextResponse.json({ error: "Valid Quiz ID is required" }, { status: 400 });
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId, 10) },
      include: {
        results: {
          include: {
            user: true,
            answers: {
              include: {
                question: { include: { choices: true } },
                choice: true,
              },
            },
          },
        },
        questions: { include: { choices: true } },
      },
    });

    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const answerDistribution: Record<string, number> = {};
    quiz.questions.forEach((question) => {
      question.choices.forEach((choice) => {
        answerDistribution[choice.content] = 0;
      });
    });
    quiz.results.forEach((result) => {
      result.answers.forEach((answer) => {
        if (answer.choice && answer.choice.content in answerDistribution) {
          answerDistribution[answer.choice.content]++;
        }
      });
    });

    const predictions = await Promise.all(
      quiz.results.map(async (result) => {
        const totalTimeSpent = result.answers.reduce((sum, a) => sum + a.timeSpent, 0);
        const averageTimeSpent = totalTimeSpent / (result.answers.length || 1);
        const totalQuestionsAnswered = result.answers.length;
        const correctAnswers = result.answers.filter((answer) =>
          quiz.questions
            .find((q) => q.id === answer.questionId)
            ?.choices.some((c) => c.isCorrect && c.id === answer.choiceId)
        ).length;
        const score = (correctAnswers / (quiz.questions.length || 1)) * 100;
        const difficulty = difficultyMapping[quiz.questions[0]?.difficulty] || 0;
        const quizDuration = quiz.duration * 60;

        const data = {
          "Time Spent (sec)": averageTimeSpent,
          "Question Difficulty": difficulty,
          "Total Questions Answered": totalQuestionsAnswered,
          "Correct Answers": correctAnswers,
          "Score (%)": score,
          "Quiz Duration (sec)": quizDuration,
        };

        try {
          const flaskResponse = await axios.post("http://127.0.0.1:5000/predict", data, {
            headers: { "Content-Type": "application/json" },
          });
          return { userId: result.user.id, prediction: flaskResponse.data.prediction };
        } catch {
          return { userId: result.user.id, prediction: "Error fetching prediction" };
        }
      })
    );

    const predictionsMap = predictions.reduce((acc, { userId, prediction }) => {
      acc[userId] = prediction;
      return acc;
    }, {} as Record<number, string>);

    const scores = quiz.results.map((result) => {
      let totalScore = 0;
      result.answers.forEach((answer) => {
        const question = quiz.questions.find((q) => q.id === answer.questionId);
        if (question) {
          const correctChoice = question.choices.find((c) => c.isCorrect);
          if (correctChoice && answer.choiceId === correctChoice.id) {
            totalScore += question.score || 0;
          }
        }
      });
      return totalScore;
    });

    const scoreDistribution = scores.reduce((acc, score) => {
      const scoreRange = Math.floor(score / 10) * 10;
      acc[scoreRange] = (acc[scoreRange] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return NextResponse.json({ quiz, answerDistribution, scoreDistribution, predictions: predictionsMap });
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return NextResponse.json({ error: "Failed to fetch quiz data" }, { status: 500 });
  }
}
