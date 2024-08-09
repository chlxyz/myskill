"use client"
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await signIn("credentials", {
        username: formData.username,  
        password: formData.password,
        redirect: false, 
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (session?.user) {
    router.push("/");
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-end py-12 px-72"
    style={{
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url("/images/robio3.png")',
      backgroundSize: 'cover',
    }}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-start text-white">
            <h1 className="signin text-6xl text-start text-white">Sign in</h1>
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px bg-[#C2C0FF] signin-form">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border bg-[#C2C0FF] border-[#C2C0FF] placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border bg-[#C2C0FF] border-[#C2C0FF] placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="signin-button group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </button>
          </div>

          <div className='whitespace-nowrap mt-10 flex justify-center text-center donthave'>
            <p className="text-white">Don't have an account?<Link href="/signup"><span className='text-red-500 hover:text-red-800'> register</span></Link></p>
          </div>

        </form>
      </div>
    </div>
  );
}
