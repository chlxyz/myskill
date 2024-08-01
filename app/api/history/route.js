import { PrismaClient } from '@prisma/client';
import { auth } from '../../../auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'You must be logged in to view quiz history' }, { status: 401 });
  }

  const email = session.user.email;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let quizzes;
    if (type === 'joined') {
      quizzes = await prisma.quizResult.findMany({
        where: { userId: user.id },
        select: {
          score: true,
          quiz: true,
        },
      });
    } else if (type === 'created') {
      quizzes = await prisma.quiz.findMany({
        where: { creatorId: user.id },
      });
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
    
    return NextResponse.json(quizzes, { status: 200 });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz history' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
