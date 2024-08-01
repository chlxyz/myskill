"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import NavBar from '../components/navbar';
import { useSession } from 'next-auth/react';

const Join = () => {
  const [quizId, setQuizId] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(`/api/get-quiz/${quizId}`);
  
      if (response.status === 200) {
        setQuizData(response.data);
        setErrorMessage('');
      } else {
        setQuizData(null);
        setErrorMessage('No exam available');
      }
    } catch (error) {
      setQuizData(null);
      setErrorMessage('No exam available');
    }
  };

  const handleJoinQuiz = () => {
    router.push(`/quizpage/${quizId}`);
  };

  if (status === 'loading') {
    return (
      <div style={{ backgroundImage: 'url(/images/download.gif)', backgroundSize: 'cover' }}>
      </div>
    );
  }
  

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-200 p-12 items-center">
        <NavBar />
        <div className="p-[10%] rounded-2xl w-[50%] mt-7 overflow-hidden">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 text-start">Exam ID</h2>
          <div className="bg-[#C2C0FF] p-[20%] w-[100%] mt-4 rounded-xl">
            <p className="text-red-500 text-center mt-4">You must be logged in</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-200 p-12 items-center overflow-hidden"  style={{
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url("/images/aleins2.jpg")',
      backgroundSize: 'cover',
      overflows: 'hidden',
    }}>
      <NavBar />
      <div className="p-[10%] rounded-2xl w-[50%] mt-7 overflow-hidden">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 text-start">Exam ID</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <input
              type="text"
              id="quizId"
              className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 bg-[#C2C0FF] leading-tight focus:outline-none focus:shadow-outline"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              placeholder="Input exam id"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full text-black bg-green-300 hover:bg-white hover:text-black font-bold py-2 px-4 rounded-2xl focus:outline-none focus:shadow-outline"
            >
              Search
            </button>
          </div>
        </form>
        <div className="bg-[#C2C0FF] p-[20%] w-[100%] mt-4 rounded-xl">
          {quizData ? (
            <div className="text-center">
              <p className="text-gray-700">Available exam with input id:</p>
              <p className="text-gray-800 font-semibold">{quizData.title}</p>
              <button
                onClick={handleJoinQuiz}
                className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Join Quiz
              </button>
            </div>
          ) : (
            <p className="text-gray-700 text-center">Available exam with input id will appear here</p>
          )}
          {errorMessage && (
            <p className="text-red-500 text-center mt-4">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Join;
