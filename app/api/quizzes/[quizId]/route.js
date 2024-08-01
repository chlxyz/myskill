import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req, {params}) {
  const { quizId } = params;

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId, 10) },
      include: {
        questions: {
          include: {
            choices: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(quiz, { status: 200 });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
    
export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'You must be logged in to create a quiz' }, { status: 401 });
    }

    const { title, description, duration, questions } = await req.json();
    const email = session.user.email;

    if (!title || !description || !duration || !Array.isArray(questions)) {
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

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        duration: parsedDuration,
        creatorId: existingUser.id,
        questions: {
          create: questions.map(q => ({
            content: q.content,
            score: parseInt(q.score, 10),
            difficulty: q.difficulty,
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

export async function PUT(req, { params }) {
  const { quizId } = params;

  try {
    const { title, description, duration, questions } = await req.json();

    if (!title || !description || !duration || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId, 10) },
      include: {
        questions: {
          include: {
            choices: true,
          },
        },
      },
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const existingQuestionsMap = new Map();
    existingQuiz.questions.forEach(question => {
      existingQuestionsMap.set(question.id, question);
    });

    const updateQuestions = questions.map(q => {
      const questionId = q.id ? parseInt(q.id, 10) : undefined;
      if (questionId && existingQuestionsMap.has(questionId)) {
        // Update existing question
        return prisma.question.update({
          where: { id: questionId },
          data: {
            content: q.content,
            score: parseInt(q.score, 10),
            choices: {
              deleteMany: {},
              create: q.choices.map(c => ({
                content: c.content,
                isCorrect: c.isCorrect
              })),
            },
          },
        });
      } else {
        return prisma.question.create({
          data: {
            quizId: parseInt(quizId, 10),
            content: q.content,
            score: parseInt(q.score, 10),
            choices: {
              create: q.choices.map(c => ({
                content: c.content,
                isCorrect: c.isCorrect
              })),
            },
          },
        });
      }
    });

    await Promise.all(updateQuestions);

    const updatedQuiz = await prisma.quiz.update({
      where: { id: parseInt(quizId, 10) },
      data: {
        title,
        description,
        duration: parseInt(duration, 10),
      },
      include: { questions: { include: { choices: true } } },
    });

    return NextResponse.json(updatedQuiz, { status: 200 });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req, { params }) {
  const { quizId } = params;

  try {
    const id = parseInt(quizId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id } });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const questions = await prisma.question.findMany({
      where: { quizId: id },
    });

    const questionIds = questions.map(q => q.id);

    await prisma.answer.deleteMany({
      where: {
        questionId: {
          in: questionIds,
        },
      },
    });

    await prisma.choice.deleteMany({
      where: {
        questionId: {
          in: questionIds,
        },
      },
    });

    await prisma.question.deleteMany({
      where: { quizId: id },
    });

    await prisma.quizResult.deleteMany({
      where: { quizId: id },
    });

    await prisma.quiz.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Quiz deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
