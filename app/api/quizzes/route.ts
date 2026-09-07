import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }

    const { title, description, duration, questions } = await req.json();
    const email = session.user.email;

    if (!title || !duration || !email) {
      return NextResponse.json({ error: "Title and duration are required" }, { status: 400 });
    }

    const parsedDuration = parseInt(duration, 10);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      return NextResponse.json({ error: "Duration must be a positive number" }, { status: 400 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        duration: parsedDuration,
        creatorId: existingUser.id,
        questions: {
          create: questions.map((q: any) => ({
            content: q.content,
            score: parseInt(q.score, 10),
            difficulty: q.difficulty,
            choices: {
              create: q.choices.map((c: any) => ({
                content: c.content,
                isCorrect: c.isCorrect,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
