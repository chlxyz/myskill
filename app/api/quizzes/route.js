import { PrismaClient } from '@prisma/client';
import { auth } from '../../../auth'; // Assuming your authentication utility
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'You must be logged in to create a quiz' }, { status: 401 });
    }

    const { title, description, duration, questions } = await req.json();
    const email = session.user.email;

    if (!title || !description || !duration || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsedDuration = parseInt(duration, 10);
    if (isNaN(parsedDuration)) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(questions);
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        duration: parsedDuration,
        creatorId: existingUser.id,
        questions: {
          create: questions.map(q => ({
            content: q.content,
            score: parseInt(q.score, 10), // Ensure score is parsed as an integer
            difficulty: q.difficulty, // Ensure difficulty is passed
            choices: {
              create: q.choices.map(c => ({
                content: c.content,
                isCorrect: c.isCorrect
              }))
            }
          }))
        }
      }
    });
    

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
