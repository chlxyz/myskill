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
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  try {
    const { title, description, duration, questions } = await req.json();

    if (!title || !duration || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Title and duration are required" }, { status: 400 });
    }

    const parsedDuration = parseInt(duration, 10);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      return NextResponse.json({ error: "Duration must be a positive number" }, { status: 400 });
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: "At least one question is required" }, { status: 400 });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content || !q.content.trim()) {
        return NextResponse.json({ error: `Question ${i + 1} content cannot be blank` }, { status: 400 });
      }
      if (!Array.isArray(q.choices) || q.choices.length === 0) {
        return NextResponse.json({ error: `Question ${i + 1} must have at least one choice` }, { status: 400 });
      }
      const hasCorrect = q.choices.some((c: any) => c.isCorrect);
      if (!hasCorrect) {
        return NextResponse.json({ error: `Question ${i + 1} must have at least one correct answer` }, { status: 400 });
      }
      for (let j = 0; j < q.choices.length; j++) {
        if (!q.choices[j].content || !q.choices[j].content.trim()) {
          return NextResponse.json({ error: `Question ${i + 1}, choice ${String.fromCharCode(65 + j)} cannot be blank` }, { status: 400 });
        }
      }
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId, 10) },
      include: { questions: { include: { choices: true } } },
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const existingQuestionsMap = new Map(existingQuiz.questions.map((q) => [q.id, q]));

    const updateQuestions = questions.map((q: any) => {
      const questionId = q.id ? parseInt(q.id, 10) : undefined;
      if (questionId && existingQuestionsMap.has(questionId)) {
        return prisma.question.update({
          where: { id: questionId },
          data: {
            content: q.content,
            score: parseInt(q.score, 10),
            difficulty: q.difficulty,
            choices: {
              deleteMany: {},
              create: q.choices.map((c: any) => ({ content: c.content, isCorrect: c.isCorrect })),
            },
          },
        });
      } else {
        return prisma.question.create({
          data: {
            quizId: parseInt(quizId, 10),
            content: q.content,
            score: parseInt(q.score, 10),
            difficulty: q.difficulty,
            choices: {
              create: q.choices.map((c: any) => ({ content: c.content, isCorrect: c.isCorrect })),
            },
          },
        });
      }
    });

    await Promise.all(updateQuestions);

    const updatedQuiz = await prisma.quiz.update({
      where: { id: parseInt(quizId, 10) },
      data: { title, description, duration: parsedDuration },
      include: { questions: { include: { choices: true } }, creator: { select: { username: true } } },
    });

    return NextResponse.json(updatedQuiz, { status: 200 });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  try {
    const id = parseInt(quizId, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const questions = await prisma.question.findMany({ where: { quizId: id } });
    const questionIds = questions.map((q) => q.id);

    await prisma.answer.deleteMany({ where: { questionId: { in: questionIds } } });
    await prisma.choice.deleteMany({ where: { questionId: { in: questionIds } } });
    await prisma.question.deleteMany({ where: { quizId: id } });
    await prisma.quizResult.deleteMany({ where: { quizId: id } });
    await prisma.quiz.delete({ where: { id } });

    return NextResponse.json({ message: "Quiz deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
  }
}
