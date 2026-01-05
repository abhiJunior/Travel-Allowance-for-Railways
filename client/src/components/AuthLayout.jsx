// src/components/AuthLayout.jsx
import React from 'react';

const AuthLayout = ({ children, title }) => (
  <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-blue-800">Rail-TA Manager</h1>
      <p className="text-gray-500">Official Railway TA Journal Generator</p>
    </div>
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">{title}</h2>
      {children}
    </div>
  </div>
);

export default AuthLayout;