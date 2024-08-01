import { PrismaClient } from "@prisma/client";
import { auth } from '../../../auth';
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  const { userId, quizId, answers } = await req.json();
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch questions with their choices and score
    const questions = await prisma.question.findMany({
      where: { quizId: parseInt(quizId, 10) },
      include: { choices: true },
    });

    // Calculate the score
    const score = answers.reduce((totalScore, answer) => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) return totalScore; // Skip if question not found

      const correctChoice = question.choices.find(choice => choice.isCorrect);
      const isCorrect = answer.choiceId === correctChoice?.id;

      // Add score if the answer is correct, otherwise 0
      return totalScore + (isCorrect ? question.score : 0);
    }, 0);

    const quizResult = await prisma.quizResult.create({
      data: {
        quizId: parseInt(quizId, 10),
        userId: parseInt(userId, 10),
        score: score,
        answers: {
          create: answers.map(answer => ({
            questionId: answer.questionId,
            choiceId: answer.choiceId,
            timeSpent: answer.timeSpent,
          })),
        },
      },
    });

    return NextResponse.json(quizResult, { status: 200 });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
