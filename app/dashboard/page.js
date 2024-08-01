"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Navbar from '../components/navbar';
import AnswerDistributionChart from '../components/AnswerDistributionDiagram';
import ScoreDistributionChart from '../components/ScoreDistributionDiagram';
import PredictionDistributionChart from '../components/PredictionDistributionChart'; // Import the new chart component

const Dashboard = () => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [difficultyStats, setDifficultyStats] = useState({
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0,
    modeDifficulty: 'N/A'
  });

  const difficultyMapping = {
    easy: 1,
    medium: 2,
    hard: 3
  };

  const calculateDifficulties = (quizData) => {
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    if (quizData && quizData.quiz && quizData.quiz.questions) {
      // Iterate through the questions
      quizData.quiz.questions.forEach(question => {
        switch (question.difficulty) {
          case 'easy':
            easyCount++;
            break;
          case 'medium':
            mediumCount++;
            break;
          case 'hard':
            hardCount++;
            break;
        }
      });

      // Determine the mode
      const mode = Math.max(easyCount, mediumCount, hardCount);
      let modeDifficulty;
      if (mode === easyCount) modeDifficulty = 'easy';
      else if (mode === mediumCount) modeDifficulty = 'medium';
      else if (mode === hardCount) modeDifficulty = 'hard';

      return {
        easyCount,
        mediumCount,
        hardCount,
        modeDifficulty
      };
    } else {
      return {
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        modeDifficulty: 'N/A'
      };
    }
  };

  const searchParams = useSearchParams();
  const quizId = searchParams.get('quizId');

  useEffect(() => {
    const fetchData = async () => {
      if (!quizId) return;

      try {
        const response = await axios.get(`/api/dashboard/${quizId}`);
        setQuizData(response.data);

        // Set predictions from response data
        setPredictions(response.data.predictions);
        
        // Calculate difficulty stats
        const stats = calculateDifficulties(response.data);
        setDifficultyStats(stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId]);

  if (loading) 
    return (
    <div className='flex min-h-screen justify-center items-center' style={{ backgroundImage: 'url("/images/download3.gif")', backgroundSize: 'cover',}}>
    </div>
  );
  if (error) return <div>Error: {error}</div>;

  const answerDistribution = quizData?.answerDistribution || {};
  const chartData = {
    labels: Object.keys(answerDistribution),
    datasets: [{
      label: 'Number of Respondents',
      data: Object.values(answerDistribution),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  const calculateScore = (answers, questions) => {
    let correctAnswers = 0;
    answers.forEach((answer) => {
      const correctChoice = questions.find(q => q.id === answer.questionId).choices.find(choice => choice.isCorrect);
      if (correctChoice && answer.choiceId === correctChoice.id) {
        correctAnswers++;
      }
    });
    return (correctAnswers / questions.length) * 100;
  };

  return (
    <div className='flex flex-col min-h-screen bg-gray-200 p-12 items-center'
    style={{
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url("/images/aleins6.jpg")',
      backgroundSize: 'cover',
    }}>
      <Navbar />
      <div className='flex justify-between w-full max-w-6xl mb-20 mt-12 gap-5'>
        <div className='flex flex-col w-full lg:w-2/3 space-y-6'>
          <div className='chart-container bg-white p-4 rounded-lg shadow-md'>
            <h3 className='text-center font-semibold text-blue-600'>Answer Distribution</h3>
            <div className='h-60 mt-4 rounded-md'>
              <AnswerDistributionChart quizId={quizId} />
            </div>
          </div>
          <div className='chart-container bg-white p-4 rounded-lg shadow-md'>
            <h3 className='text-center font-semibold text-blue-600'>Score Distribution</h3>
            <div className='h-60 mt-4 rounded-md'>
              <ScoreDistributionChart quizId={quizId} />
            </div>
          </div>
          <div className='chart-container bg-white p-4 rounded-lg shadow-md'>
            <h3 className='text-center font-semibold text-blue-600'>Prediction Distribution</h3>
            <div className='h-60 mt-4 rounded-md'>
              <PredictionDistributionChart predictions={Object.values(predictions)} />
            </div>
          </div>
        </div>
        <div className='flex flex-col w-full lg:w-1/3 space-y-6'>
          <div className='bg-white p-4 rounded-lg shadow-md flex flex-col items-center'>
            <h3 className='text-center font-semibold text-blue-600'>Number of Respondents</h3>
            <div className='text-blue-600 text-2xl mt-4'>{quizData.quiz.results.length}</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md'>
            <h3 className='text-lg font-semibold text-blue-600 mb-4'>Respondents</h3>
            <div className='bg-gray-600 overflow-auto max-h-72 p-4 rounded-md'>
              <ul>
                {quizData.quiz.results.map((result) => (
                  <li key={result.id} className="mb-5 bg-white p-4 rounded-md shadow-md">
                    <p><strong>User ID:</strong> {result.user?.id || 'N/A'}</p>
                    <p><strong>Username:</strong> {result.user?.username || 'N/A'}</p>
                    <p><strong>Email:</strong> {result.user?.email || 'N/A'}</p>
                    <p><strong>Score:</strong> {calculateScore(result.answers, quizData.quiz.questions).toFixed(2)}%</p>
                    <p><strong>Prediction:</strong> {predictions[result.user?.id] || 'Predicting...'}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
