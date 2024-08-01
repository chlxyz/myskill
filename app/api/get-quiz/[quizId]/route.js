import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const url = new URL(request.url);
  const quizId = parseInt(url.pathname.split('/').pop(), 10); // Extract quizId from the URL

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            choices: true
          }
        }
      }
    });

    if (!quiz) {
      return new Response(JSON.stringify({ error: 'Quiz not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(quiz), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return new Response(JSON.stringify({ error: 'Error fetching quiz' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
