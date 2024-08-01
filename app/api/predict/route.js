import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { quizId } = req.body; // Expecting quizId in the request body

      // Fetch quiz results and associated data from Prisma
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: {
              answers: {
                select: {
                  timeSpent: true,
                  questionId: true,
                  choiceId: true,
                },
              },
            },
          },
          results: {
            include: {
              answers: true,
            },
          },
        },
      });

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      const totalRespondents = quiz.results.length;
      const answerDistribution = {}; // Initialize your answer distribution calculation
      const scoreDistribution = {}; // Initialize your score distribution calculation

      // Prepare data for prediction
      const dataForPrediction = quiz.results.map(result => {
        const answers = result.answers;
        const totalQuestionsAnswered = answers.length;
        const totalCorrectAnswers = answers.filter(answer => answer.choiceId !== null).length;
        const score = (totalCorrectAnswers / totalQuestionsAnswered) * 100;

        return {
          TimeSpent: answers.reduce((sum, ans) => sum + ans.timeSpent, 0),
          QuestionDifficulty: quiz.questions.length > 0 ? quiz.questions[0].difficulty : 1, // Example
          TotalQuestionsAnswered: totalQuestionsAnswered,
          CorrectAnswers: totalCorrectAnswers,
          Score: score,
          QuizDuration: quiz.duration,
          QuestionType: 1, // Example, replace with actual value
        };
      });

      // Send data to Flask API for prediction
      const predictions = await Promise.all(
        dataForPrediction.map(async data => {
          const response = await axios.post('http://localhost:5000/predict', data);
          return response.data.prediction;
        })
      );

      // Prepare response data
      const responseData = {
        totalRespondents,
        answerDistribution,
        predictionResults: predictions,
        scoreDistribution,
        respondents: dataForPrediction.map((data, index) => ({
          ...data,
          prediction: predictions[index],
        })),
      };

      res.status(200).json(responseData);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
