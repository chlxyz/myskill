import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const difficultyMapping = {
  easy: 1,
  medium: 2,
  hard: 3
};

export async function GET(req) {
  const url = new URL(req.url);
  const quizId = url.pathname.split('/').pop(); // Extract the last part of the URL path

  console.log('Request URL:', req.url);
  console.log('Extracted Quiz ID:', quizId);

  if (!quizId || isNaN(quizId)) {
    return new Response(
      JSON.stringify({ error: 'Quiz ID is required and must be a number' }), 
      { status: 400 }
    );
  }

  try {
    // Fetch quiz along with results and answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId, 10) },
      include: {
        results: {
          include: {
            user: true,
            answers: {
              include: {
                question: {
                  include: {
                    choices: true
                  }
                },
                choice: true
              }
            }
          }
        },
        questions: {
          include: {
            choices: true
          }
        }
      }
    });

    // If quiz is not found, return 404
    if (!quiz) {
      return new Response(
        JSON.stringify({ error: 'Quiz not found' }), 
        { status: 404 }
      );
    }

    // Calculate answer distribution
    const answerDistribution = {};
    quiz.questions.forEach((question) => {
      question.choices.forEach((choice) => {
        answerDistribution[choice.content] = 0;
      });
    });

    quiz.results.forEach((result) => {
      result.answers.forEach((answer) => {
        if (answer.choice && answer.choice.content in answerDistribution) {
          answerDistribution[answer.choice.content]++;
        }
      });
    });

    // Prepare predictions for each result
    const predictions = await Promise.all(
      quiz.results.map(async (result) => {
        const totalTimeSpent = result.answers.reduce((sum, answer) => sum + answer.timeSpent, 0);
        const averageTimeSpent = totalTimeSpent / result.answers.length;
        const totalQuestionsAnswered = result.answers.length;
        const correctAnswers = result.answers.filter(answer => 
          quiz.questions.find(q => q.id === answer.questionId).choices.some(choice => choice.isCorrect && choice.id === answer.choiceId)
        ).length;
        const score = (correctAnswers / quiz.questions.length) * 100;
        const difficulty = difficultyMapping[quiz.questions[0]?.difficulty] || 0;
        const quizDuration = quiz.duration * 60;
    
        const data = {
          "Time Spent (sec)": averageTimeSpent,
          "Question Difficulty": difficulty,
          "Total Questions Answered": totalQuestionsAnswered,
          "Correct Answers": correctAnswers,
          "Score (%)": score,
          "Quiz Duration (sec)": quizDuration,
        };
    
        console.log("Data being sent to Flask API for user:", data);
    
        try {
          const flaskResponse = await axios.post('http://127.0.0.1:5000/predict', data, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          return {
            userId: result.user.id,
            prediction: flaskResponse.data.prediction
          };
        } catch (error) {
          console.error('Error sending data to Flask API:', error);
          return {
            userId: result.user.id,
            prediction: 'Error fetching prediction'
          };
        }
      })
    );
    
    // Check if predictions are valid
    const validPredictions = predictions.filter(p => p.userId && p.prediction);
    
    const predictionsMap = validPredictions.reduce((acc, { userId, prediction }) => {
      acc[userId] = prediction;
      return acc;
    }, {});

    const scores = quiz.results.map((result) => {
      let totalScore = 0;
      result.answers.forEach((answer) => {
        const question = quiz.questions.find(q => q.id === answer.questionId);
        if (question) {
          const correctChoice = question.choices.find(choice => choice.isCorrect);
          if (correctChoice && answer.choiceId === correctChoice.id) {
            totalScore += question.score || 0; // Add score of the question if answer is correct
          }
        }
      });
      return totalScore; // Return total score for the quiz result
    });

    const scoreDistribution = scores.reduce((acc, score) => {
      const scoreRange = Math.floor(score / 10) * 10; // Group scores into ranges of 10
      acc[scoreRange] = (acc[scoreRange] || 0) + 1;
      return acc;
    }, {});

    // Return quiz data, answer distribution, score distribution, and results with prediction data
    return new Response(
      JSON.stringify({
        quiz,
        answerDistribution,
        scoreDistribution,
        predictions: predictions.reduce((acc, { userId, prediction }) => {
          acc[userId] = prediction;
          return acc;
        }, {})
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching quiz data:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch quiz data' }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
