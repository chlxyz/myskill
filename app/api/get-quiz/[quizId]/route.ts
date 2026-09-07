import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId, 10) },
      include: { questions: { include: { choices: true } }, creator: { select: { username: true } } },
    });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    return NextResponse.json(quiz, { status: 200 });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json({ error: "Error fetching quiz" }, { status: 500 });
  }
}
