import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const userId = req.headers.get("user-id");

  if (!userId) {
    return NextResponse.json({ error: "User ID not provided" }, { status: 400 });
  }

  try {
    const quizData = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId, 10) },
      include: {
        questions: { include: { choices: true } },
        results: {
          where: { userId: parseInt(userId, 10) },
          include: {
            answers: {
              include: {
                question: { include: { choices: true } },
                choice: true,
              },
            },
          },
        },
      },
    });

    if (!quizData) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const questions = quizData.questions.map((question) => ({
      id: question.id,
      content: question.content,
      choices: question.choices.map((choice) => ({
        id: choice.id,
        content: choice.content,
        isCorrect: choice.isCorrect,
      })),
    }));

    const answers = quizData.results.flatMap((result) =>
      result.answers.map((answer) => ({
        questionId: answer.questionId,
        choiceId: answer.choiceId,
        isCorrect: answer.choice?.isCorrect ?? false,
        questionContent: answer.question?.content ?? "Unknown",
        choiceContent: answer.choice?.content ?? "Unknown",
      }))
    );

    return NextResponse.json({ questions, answers });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
