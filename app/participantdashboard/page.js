"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../components/navbar';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const ParticipantDashboard = () => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession(); // Use useSession hook to get session data

  const searchParams = useSearchParams();
  const quizId = searchParams.get('quizId');

  useEffect(() => {
    const fetchData = async () => {
      if (!quizId || !session?.user?.id) return;

      try {
        const response = await axios.get(`/api/participantdashboard/${quizId}`, {
          headers: {
            'user-id': session.user.id, // Pass the user ID in the request headers
          },
        });
        setQuizData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, session]);

  if (loading) {
    return (
      <div className='flex min-h-screen justify-center items-center bg-cover bg-center' style={{ backgroundImage: 'url("/images/download3.gif")' }}>
        <p className='text-white text-lg font-semibold'>Loading...</p>
      </div>
    );
  }

  if (error) return (
    <div className='flex min-h-screen justify-center items-center'>
      <p className='text-red-500 text-lg font-semibold'>Error: {error}</p>
    </div>
  );

  const { questions, answers } = quizData;

  return (
    <div className='min-h-screen bg-gray-100 p-12'>
      <NavBar />
      <div className='container mx-auto p-6'>
        <h3 className='text-3xl font-bold mb-6 text-center'>Participant Dashboard</h3>
        
        <div className='bg-white p-6 rounded-lg shadow-md mb-6'>
          <h4 className='text-2xl font-semibold mb-4'>Questions:</h4>
          <ul className='space-y-4'>
            {questions.map((question) => (
              <li key={question.id} className='border-b pb-4'>
                <p className='text-lg font-medium mb-2'><strong>Question:</strong> {question.content}</p>
                <ul className='space-y-2'>
                  {question.choices.map((choice) => (
                    <li key={choice.id} className={`flex items-center ${choice.isCorrect ? 'text-green-500' : 'text-gray-700'}`}>
                      <span className='mr-2'><strong>Choice:</strong> {choice.content}</span>
                      {choice.isCorrect && <span className='text-green-500 font-semibold'>(Correct)</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h4 className='text-2xl font-semibold mb-4'>Your Answers:</h4>
          <ul className='space-y-4'>
            {answers.map((answer, index) => (
              <li key={index} className='border-b pb-4'>
                <p className='text-lg font-medium mb-2'>
                  <strong>Question:</strong> {answer.questionContent}
                </p>
                <p className='text-md mb-2'>
                  <strong>Choice:</strong> {answer.choiceContent}
                </p>
                <p className={`text-md font-semibold ${answer.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                  <strong>Correct:</strong> {answer.isCorrect ? 'Yes' : 'No'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ParticipantDashboard;
