"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import { useSession } from 'next-auth/react';

const QuizHistory = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [view, setView] = useState('joined'); // 'joined' or 'created'
  const { data: session } = useSession(); // Use useSession hook to get session data

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch(`/api/history?type=${view}`, {
      headers: {
        'user-id': session.user.id, // Pass the user ID in the request headers
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setQuizzes(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Error fetching quiz history:', error);
      });
  }, [view, session]);

  const handleDelete = async (quizId) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          const updatedQuizzes = quizzes.filter((quiz) => quiz.id !== quizId);
          setQuizzes(updatedQuizzes);
        } else {
          console.error('Failed to delete quiz:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  return (
    <div className='flex flex-col min-h-screen bg-gray-200 p-12' 
    style={{
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url("/images/aleins5.jpg")',
      backgroundSize: 'cover',
    }}
    >
      <Navbar />
      <div className="mt-[2%]">
        <div className="flex space-x-4 mb-6 justify-center">
          <button
            onClick={() => setView('joined')}
            className={`px-4 py-2 rounded-2xl ${view === 'joined' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          >
            Joined Exams
          </button>
          <button
            onClick={() => setView('created')}
            className={`px-4 py-2 rounded-2xl ${view === 'created' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Created Exams
          </button>
        </div>
        <div className="flex flex-col items-start space-y-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="border p-4 rounded-lg shadow-sm w-full transform transition duration-200 hover:scale-[102%] hover:shadow-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(5px)' }}
            >
              <div className="mb-2">
                {view === 'joined' ? (
                  quiz?.quiz ? (
                    <>
                      <p className="text-lg font-semibold"><span className='font-bold'>Title:</span> {quiz.quiz.title}</p>
                      <p className="text-sm text-gray-600"><span className='font-bold'>Description:</span> {quiz.quiz.description}</p>
                      <p className="text-sm text-gray-600"><span className='font-bold'>Score:</span> {quiz.score}</p>
                      <p className="text-sm text-gray-600"><span className='font-bold'>Quiz ID:</span> {quiz.quiz.id}</p>
                      <div className="flex space-x-4">
                        <Link href={`/participantdashboard?quizId=${quiz.quiz.id}`}>
                          <h1 className="text-blue-500 hover:underline">Review Exam</h1>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p className="text-red-500">Quiz details not available</p>
                  )
                ) : (
                  <>
                    <p className="text-lg font-semibold"><span className='font-bold'>Title:</span> {quiz.title}</p>
                    <p className="text-sm text-gray-600"><span className='font-bold'>Description:</span> {quiz.description}</p>
                    <p className="text-sm text-gray-600"><span className='font-bold'>Duration:</span> {quiz.duration} minutes</p>
                    <p className="text-sm text-gray-600"><span className='font-bold'>Quiz ID:</span> {quiz.id}</p>
                    <div className="flex space-x-4 text-center justify-end">
                      <Link href={`/createquiz?quizId=${quiz.id}`}>
                      <button className="px-4 py-2 text-white bg-orange-400 rounded-2xl hover:bg-black hover:text-white">
                          Edit Exam
                        </button>
                      </Link>
                      <Link href={`/dashboard?quizId=${quiz.id}`}>
                        <button className="px-4 py-2 text-white bg-slate-400 rounded-2xl hover:bg-black hover:text-white">
                          Exam Dashboard
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className="px-4 py-2 text-white bg-red-600 rounded-2xl hover:bg-black hover:text-white"
                      >
                        Delete Exam
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
};

export default QuizHistory;
