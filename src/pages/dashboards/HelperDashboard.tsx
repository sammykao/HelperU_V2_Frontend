import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { AIChat } from '../../components/ai/AIChat';

const HelperDashboard: React.FC = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to HelperU!
          </h1>
          <p className="text-gray-700 mb-4">
            Find opportunities and help students succeed
          </p>
        </div>


        {/* Quick Actions */}
        <div className="space-y-8">
          {/* Top Row - Primary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition-all duration-300 cursor-pointer shadow-sm"
              onClick={() => navigate('/tasks/browse')}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Posts</h3>
              <p className="text-gray-700 text-sm">Find posts that match your skills and interests</p>
            </div>

            <div 
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition-all duration-300 cursor-pointer shadow-sm"
              onClick={() => navigate('/applications')}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Applications</h3>
              <p className="text-gray-700 text-sm">Track your applications and responses</p>
            </div>
          </div>

          {/* Second Row - Secondary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition-all duration-300 cursor-pointer shadow-sm"
              onClick={() => setIsAIChatOpen(true)}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
              </div>
              <p className="text-gray-700 text-sm">Get help with finding opportunities, applying to posts, or answering questions about HelperU</p>
            </div>


            <div 
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition-all duration-300 cursor-pointer shadow-sm"
              onClick={() => navigate('/profile')}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My Profile</h3>
              <p className="text-gray-700 text-sm">Update your profile information and skills</p>
            </div>
          </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">What is HelperU?</h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                HelperU is your gateway to meaningful opportunities where you can apply your skills and knowledge to help others succeed. 
                Whether it's academic tutoring, creative projects, technical assistance, or personal support, 
                our platform connects you with clients who need your expertise and are ready to compensate you for your valuable help.
              </p>
            </div>
        </div>
      </div>
      
      {/* AI Chat Modal */}
      <AIChat 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
      />
    </div>
  );
};

export default HelperDashboard;
