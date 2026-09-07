import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, quizId, answers } = await req.json();

    const questions = await prisma.question.findMany({
      where: { quizId: parseInt(quizId, 10) },
      include: { choices: true },
    });

    const score = answers.reduce((totalScore: number, answer: any) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) return totalScore;
      const correctChoice = question.choices.find((c) => c.isCorrect);
      const isCorrect = answer.choiceId === correctChoice?.id;
      return totalScore + (isCorrect ? question.score : 0);
    }, 0);

    const quizResult = await prisma.quizResult.create({
      data: {
        quizId: parseInt(quizId, 10),
        userId: parseInt(userId, 10),
        score,
        answers: {
          create: answers.map((answer: any) => ({
            questionId: answer.questionId,
            choiceId: answer.choiceId,
            timeSpent: answer.timeSpent,
          })),
        },
      },
    });

    return NextResponse.json(quizResult, { status: 200 });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
