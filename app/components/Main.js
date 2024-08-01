"use client";
import React, { useState } from 'react';
import NavBar from '../components/navbar';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const Main = () => { 
  const [hoveredButton, setHoveredButton] = useState(null);
  const { data: session, status } = useSession();

  console.log(session);

  // Handle session loading state
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div
      className='flex flex-col min-h-screen bg-gray-100 p-12'
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/images/e_learning_course.png")',
        backgroundSize: 'cover',
      }}
    >
      <div className="flex flex-1 flex-row items-center justify-center gap-8 relative">
        <div
          className={`absolute left-0 transform transition-opacity duration-300 ease-in-out ${
            hoveredButton === 'join' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: hoveredButton === 'join' ? 10 : -1 }}
        >
          <div className="text-gray-700 text-xl p-4 bg-white rounded-lg shadow-lg ml-4">
            Join a quiz and test your knowledge!
          </div>
        </div>
        <Link href="/join" passHref>
          <button
            onMouseEnter={() => setHoveredButton('join')}
            onMouseLeave={() => setHoveredButton(null)}
            className="bg-gray-900 text-white text-xl py-6 px-8 rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 ease-in-out z-10"
          >
            Join Quiz
          </button>
        </Link>
        <Link href="/createquiz" passHref>
          <button
            onMouseEnter={() => setHoveredButton('create')}
            onMouseLeave={() => setHoveredButton(null)}
            className="bg-gray-900 text-white text-xl py-6 px-8 rounded-full shadow-lg hover:bg-orange-600 transform hover:scale-105 transition-all duration-300 ease-in-out z-10"
          >
            Create Quiz
          </button>
        </Link>
        <div
          className={`absolute right-0 transform transition-opacity duration-300 ease-in-out ${
            hoveredButton === 'create' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: hoveredButton === 'create' ? 10 : -1 }}
        >
          <div className="text-gray-700 text-xl p-4 bg-white rounded-lg shadow-lg mr-4">
            Create your own quiz and challenge others!
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
