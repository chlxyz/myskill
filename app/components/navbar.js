"use client";
import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faCog, faSignInAlt, faUserPlus, faSignOutAlt, faUser } from "@fortawesome/free-solid-svg-icons";

export default function NavBar() {
  const { data: session } = useSession();
  return (
    <div className="flex justify-center">
      <ul className="flex gap-8 bg-gray-900 text-white rounded-full shadow-lg p-4 items-center">
        <Link href="/" passHref>
          <li className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-full cursor-pointer transition-all">
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </li>
        </Link>
        <Link href="/history" passHref>
          <li className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-full cursor-pointer transition-all">
            <FontAwesomeIcon icon={faCog} />
            <span>History</span>
          </li>
        </Link>
        {!session ? (
          <>
            <Link href="/signin" passHref>
              <li className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-full cursor-pointer transition-all">
                <FontAwesomeIcon icon={faSignInAlt} />
                <span>Login</span>
              </li>
            </Link>
            <Link href="/signup" passHref>
              <li className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-full cursor-pointer transition-all">
                <FontAwesomeIcon icon={faUserPlus} />
                <span>Register</span>
              </li>
            </Link>
          </>
        ) : (
          <>
            <li className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-full cursor-pointer transition-all">
              <FontAwesomeIcon icon={faUser} />
              <span>{session.user.name}</span>
            </li>
            <li className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-full cursor-pointer transition-all">
              <button onClick={() => signOut()} className="flex items-center gap-2">
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
