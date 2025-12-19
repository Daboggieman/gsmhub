"use client";

import React from 'react';

interface ErrorProps {
  message?: string;
  statusCode?: number;
}

const Error: React.FC<ErrorProps> = ({ message, statusCode }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md">
        <svg
          className="w-16 h-16 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          ></path>
        </svg>
        <h1 className="text-2xl font-bold text-gray-800">
          {statusCode ? `Error ${statusCode}` : 'An Error Occurred'}
        </h1>
        <p className="text-gray-600 text-center">
          {message || 'Something went wrong. Please try again later.'}
        </p>
      </div>
    </div>
  );
};

export default Error;