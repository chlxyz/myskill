"use client";
import React, { useState } from 'react';
import NavBar from './components/navbar';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const Main = () => {
  const [hoveredButton, setHoveredButton] = useState(null);
  const description = ["MYSkill is an exam creation and participation. It utilizes an AI to predict the user performance. Providing valuable insights.", "asdadsdad", "asdasdweqeasd"];
  const [ desc, setDescription ] = useState(description[0]);
  const { data: session, status } = useSession();

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % description.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDescription(description[index]);
  }, [index]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div
        className='flex min-h-screen w-full bg-gray-100 relative p-12'
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url("/images/robio6.png")',
          backgroundSize: 'cover',
        }}
      >
        <div className="fixed top-0 left-0 right-0 flex justify-center mt-10">
          <NavBar />
        </div>

        <div className='flex items-center'>
          <h1 className='text-[15px] myskill-desc max-w-64 text-white'>
            {desc}
          </h1>
        </div>

        <div className='absolute bottom-0 right-0 px-12'>
          <h1 className='text-[100px] myskill-title text-white'>
            MYSkill
          </h1>
        </div>
      </div>



      <div
        className='flex flex-col min-h-screen bg-gray-100 p-12'
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url("/images/robio2.png")',
          backgroundSize: 'cover',
        }}
      >

        {/* Add padding to the top to account for the NavBar */}
        <div className="pt-20 flex flex-1 items-center justify-center gap-12 relative flex-col">
          <div className='flex flex-between gap-5'>
            <div className='bg-white rounded-2xl h-[300px] w-[400px] flex items-center justify-center text-center opacity-[50%] hover:opacity-[100%] hover:animate-pulse'>
              <Link href="/join">
                <h1 className="text-6xl join">Join</h1>
              </Link>
            </div>

            <div className='mt-4 text-white'>
              <h1>adasdadwadadwadajdasjdajsjdjasdjdjajdajdajs</h1>
            </div>
          </div>

          <div className='flex flex-between gap-5'>
            <div className='mt-4 text-white'>
              <h1>adasdadwadadwadajdasjdajsjdjasdjdjajdajdajs</h1>
            </div>

            <div className='bg-white rounded-2xl h-[300px] w-[400px] flex items-center justify-center text-center opacity-[50%] hover:opacity-[100%] hover:animate-pulse'>
              <Link href="/createquiz">
                <h1 className="text-6xl join">Create</h1>
              </Link>
            </div>
          </div>



        </div>
      </div>
    </div>
  );
}

export default Main;
