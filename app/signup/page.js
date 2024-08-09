"use client";
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Register = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (email, username, password) => {
    try {
      if (!email || !username || !password) {
        setError('All fields are required');
        return;
      }

      const response = await axios.post('/api/signup', { email, username, password });

      if (response.status === 201) {
        router.push('/signin');
      } else {
        setError(response.data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error registering:', error);
      setError('Internal server error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister(email, username, password);
  };

  return (
    <div className="flex px-24 items-center h-screen bg-[#D9D9D9]"
    style={{
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url("/images/robio4.png")',
      backgroundSize: 'cover',
    }}
    >
      <div className="p-8 rounded-lg w-[35%]">
        <h1 className="text-5xl font-bold mb-6 text-white register-title">Registering</h1>
        <form onSubmit={handleSubmit} className="max-w mx-auto register-form">
            <div className="mb-4 flex flex-col">
                <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Email</label>
                <input
                    type="email"
                    id="email"
                    placeholder="Input email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 border border-gray-300 bg-[#C2C0FF] rounded-3xl text-black flex-grow"
                />
            </div>
            <div className="mb-4 flex flex-col">
                <label htmlFor="username" className="block text-sm font-medium text-white mb-1">Username</label>
                <input
                    type="text"
                    id="username"
                    placeholder="Input username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="p-2 border border-gray-300 bg-[#C2C0FF] rounded-3xl text-black flex-grow"
                />
            </div>
            <div className="mb-4 flex flex-col">
                <label htmlFor="password" className="block text-sm font-medium text-white mb-1">Password</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Input password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="p-2 border border-gray-300 bg-[#C2C0FF] rounded-3xl text-black flex-grow"
                />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
                type="submit"
                className="w-full bg-red-500 hover:bg-gray-500 text-white p-2 rounded-3xl"
            >
                Register
            </button>
        </form>


        <div className='whitespace-nowrap mt-10 flex justify-center text-center donthave'>
          <p className='text-white'>Already have an account?<Link href="/signin"><span className='text-gray-500 hover:text-red-500'> sign in now</span></Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;


// "use client";

// import React, { useEffect, useState } from "react";

// function SignIn() {
//   const [name, setName] = useState();
//   const [email, setEmail] = useState();
//   const [password, setPassword] = useState();
//   const [confirmPassword, setConfirmPassword] = useState();
//   const [passError, setPassError] = useState(false);

//   useEffect(() => {
//     validatePassword(password, confirmPassword);
//   }, [password, confirmPassword]);

//   function validatePassword(pass, confrimPass) {
//     let isValid = confirmPass === pass;
//     if (!isValid) {
//       setPassError(true);
//     }
//   }
//   async function handleSubmit(e) {
//     e.preventDefault();
//     let userData = {
//       name,
//       email,
//       password,
//     };

//     // Make call to backend to create user
//     const res = await fetch("/api/user/create", {
//       method: "POST",
//       body: JSON.stringify(userData),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (res.ok) {
//       const data = await res.json();

//       // registration success
//     } else {
//       //registration faled
//     }
//   }
//   return (
//       <div className="flex justify-center items-center m-auto p-3">
//         <form
//           onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
//         >
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name"  >
//               Name
//             </label>
//             <input
//               className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`} id="name" type="text" laceholder="name" 
//               onChange={(e) => {
//                 setName(e.target.value);
//               }}
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2"  htmlFor="email"  >
//               Email
//             </label>
//             <input
//               className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}  id="email" type="email" placeholder="Email"
//               onChange={(e) => {
//                 setEmail(e.target.value);
//               }}
//             />
//           </div>
//           <div className="mb-6">
//             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password" >
//               Password
//             </label>
//             <input
//               className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`} id="password" type="password"  placeholder="***********"
//               onChange={(e) => {
//                 setPassword(e.target.value);
//               }}
//             />
//           </div>
//           <div className="mb-6">
//             <label  className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password"   >
//               Confirm Password
//             </label>
//             <input
//               className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`} id="confirm-password"  type="password" placeholder="***********"
//               onChange={(e) => {
//                 setConfirmPassword(e.target.value);
//               }}
//             />
//             {passError && (
//               <p className="text-red-500 text-xs italic">
//                 Password do not match!
//               </p>
//             )}
//           </div>
//           <div className="flex items-center justify-between">
//             <button className="bg-blue-500  hover:bg-blue-700 text-white font-bold py-2  px-4 rounded  focus:outline-none  focus:shadow-outline" type="submit" >
//               Sign Up
//             </button>
//             <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#" >
//               Have an account? Sign in
//             </a>
//           </div>
//         </form>
//       </div>
//   );
// }

// export default SignIn;