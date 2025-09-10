import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const SingleTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Task Details</h1>
          <p className="text-gray-300">View detailed information about this opportunity</p>
          {id && (
            <p className="text-sm text-gray-400 mt-2">Task ID: {id}</p>
          )}
        </div>

        {/* Content Placeholder */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Task Details</h2>
            <p className="text-gray-300 mb-6">
              This page will show detailed information about the selected task, including description, requirements, budget, and application options.
            </p>
            <div className="bg-white/5 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-400">
                <strong>Coming Soon:</strong> Detailed task information, apply functionality, client communication, and related tasks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleTask;
