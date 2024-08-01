import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req) {
  const url = new URL(req.url);
  const quizId = url.pathname.split('/').pop(); // Extract the last part of the URL path
  const userId = req.headers.get('user-id'); // Get user ID from request headers

  console.log('Request URL:', req.url);
  console.log('Extracted Quiz ID:', quizId);
  console.log('Extracted User ID:', userId);

  if (!userId) {
    console.error('User ID not provided');
    return NextResponse.json({ error: 'User ID not provided' }, { status: 400 });
  }

  try {
    const quizData = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId, 10) },
      include: {
        questions: {
          include: {
            choices: true, // Include choices for each question
          },
        },
        results: {
          where: { userId: parseInt(userId, 10) }, // Filter results by user ID
          include: {
            answers: {
              include: {
                question: {
                  include: {
                    choices: true, // Include choices for each question in answers
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!quizData) {
      console.error('Quiz not found');
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Prepare data for response
    const questions = quizData.questions.map(question => ({
      id: question.id,
      content: question.content,
      choices: question.choices.map(choice => ({
        id: choice.id,
        content: choice.content,
        isCorrect: choice.isCorrect,
      })),
    }));

    const answers = quizData.results.flatMap(result =>
      result.answers.map(answer => ({
        questionId: answer.questionId,
        choiceId: answer.choiceId,
        isCorrect: answer.choice?.isCorrect ?? false,
        questionContent: answer.question?.content ?? 'Unknown',
        choiceContent: answer.choice?.content ?? 'Unknown',
      }))
    );

    return NextResponse.json({ questions, answers }, { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
