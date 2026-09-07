import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const email = session.user.email;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    const user = await prisma.user.findUnique({ where: { email: email! } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let quizzes;
    if (type === "joined") {
      quizzes = await prisma.quizResult.findMany({
        where: { userId: user.id },
        select: { score: true, quiz: { include: { creator: { select: { username: true } } } } },
      });
    } else if (type === "created") {
      quizzes = await prisma.quiz.findMany({ where: { creatorId: user.id }, include: { creator: { select: { username: true } } } });
    } else {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }

    return NextResponse.json(quizzes, { status: 200 });
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    return NextResponse.json({ error: "Failed to fetch quiz history" }, { status: 500 });
  }
}
