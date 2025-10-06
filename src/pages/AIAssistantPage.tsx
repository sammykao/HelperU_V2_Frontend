import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { AIChat } from '../components/ai/AIChat';

const AIAssistantPage: React.FC = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(true); // Open by default on the page

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-gray-700">Your intelligent helper for all HelperU tasks</p>
            </div>
          </div>
        </div>

        {/* AI Assistant Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How can I help you today?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">Creating Posts</h3>
                  <p className="text-gray-700 text-sm">Get help writing compelling post descriptions, setting appropriate budgets, and choosing the right categories.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">Finding Helpers</h3>
                  <p className="text-gray-700 text-sm">Learn how to search for qualified helpers, evaluate applications, and make the best hiring decisions.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">Communication</h3>
                  <p className="text-gray-700 text-sm">Get tips on effective communication with helpers, setting expectations, and managing projects.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">Platform Features</h3>
                  <p className="text-gray-700 text-sm">Understand how to use HelperU's features, navigate the platform, and optimize your experience.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">Best Practices</h3>
                  <p className="text-gray-700 text-sm">Learn proven strategies for successful collaborations, project management, and building lasting relationships.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">General Questions</h3>
                  <p className="text-gray-700 text-sm">Ask me anything about HelperU, your account, or how to get the most out of our platform.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation</h3>
            <p className="text-gray-700 text-sm">Click the button below to open the chat interface</p>
          </div>
          <div className="text-center">
            <button 
              onClick={() => setIsAIChatOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              Open AI Chat
            </button>
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

export default AIAssistantPage;
