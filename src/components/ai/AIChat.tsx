import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { aiApi, AIRequest, AIResponse } from '../../lib/api/ai';
import { getAIChatThreadId } from '../../lib/utils/aiChatStorage';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, authRoute } = useAuth();
  
  // Create different welcome messages based on authentication status
  const getWelcomeMessage = () => {
    if (!isAuthenticated) {
      return `# Welcome to HelperU AI Assistant! 🤖

I'm your intelligent helper for the HelperU platform. Here's what I can help you with:

## **For New Users:**
- **Learn about HelperU**: Understand how our platform works
- **Account Setup**: Get guidance on creating your account
- **Platform Features**: Discover what HelperU offers
- **General Support**: Answer any questions you have

## **Get Started:**
1. **Sign up** as a client or helper
2. **Complete your profile** to get started
3. **Ask me anything** about the platform

*Ready to explore HelperU? Ask me anything!*`;
    }

    if (authRoute === 'client') {
      return `# Welcome back! 👋

I'm your personal HelperU AI assistant. Here's what I can help you with:

## **Client Features:**
- **📝 Task Management**: Create, update, and manage your tasks
- **🔍 Helper Discovery**: Find qualified student helpers in your area
- **💬 Communication**: Chat with helpers through secure messaging
- **📋 Application Management**: Review and manage task applications
- **👤 Profile Updates**: Update your account information
- **❓ Platform Support**: Answer questions about HelperU

## **Quick Actions:**
1. Ask me to **create a task** for you
2. **Search for helpers** in your area
3. **Check your applications** status
4. **Get help** with any platform questions

*What would you like to do today?*`;
    }

    if (authRoute === 'helper') {
      return `# Welcome back! 👋

I'm your personal HelperU AI assistant. Here's what I can help you with:

## **Helper Features:**
- **🔍 Browse Tasks**: Find opportunities that match your skills
- **📝 Applications**: Manage your task applications
- **💬 Communication**: Chat with clients about tasks
- **👤 Profile Updates**: Update your profile and skills
- **📊 Dashboard**: Check your activity and earnings
- **❓ Platform Support**: Answer questions about HelperU

## **Quick Actions:**
1. Ask me to **browse available tasks**
2. **Check your applications** status
3. **Update your profile** information
4. **Get help** with any platform questions

*What would you like to do today?*`;
    }

    // Fallback for unknown auth route
    return `# Welcome to HelperU AI Assistant! 🤖

I'm your intelligent helper for all HelperU tasks. Here's what I can help you with:

## **Available Features:**
- **Task Management**: Create, update, and manage your tasks
- **Helper Discovery**: Find qualified student helpers in your area
- **Communication**: Chat with helpers through secure messaging
- **Application Management**: Review and manage task applications
- **Profile Updates**: Update your account information
- **Platform Support**: Answer questions about HelperU

## **Quick Start:**
1. Ask me to **create a task** for you
2. **Search for helpers** in your area
3. **Get help** with any platform questions

*What would you like to do today?*`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: getWelcomeMessage(),
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(() => {
    return getAIChatThreadId();
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update welcome message when authentication state changes
  useEffect(() => {
    setMessages(prevMessages => {
      const newWelcomeMessage = {
        id: '1',
        content: getWelcomeMessage(),
        isUser: false,
        timestamp: new Date(),
      };
      
      // Replace the first message (welcome message) with the new one
      return [newWelcomeMessage, ...prevMessages.slice(1)];
    });
  }, [isAuthenticated, authRoute]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const request: AIRequest = {
        message: userMessage.content,
        thread_id: threadId,
      };

      const response: AIResponse = await aiApi.sendMessage(request);
      
      if (response.success) {
        setThreadId(response.thread_id);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.response,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get response from AI');
      }
    } catch (error: any) {
      toast.error('Failed to send message to AI assistant');
      console.error('AI Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 rounded-2xl border border-white/20 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
              <p className="text-sm text-gray-400">HelperU Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isUser
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    : 'bg-white/10 text-gray-100 border border-white/20'
                }`}
              >
                <div className="text-sm prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      // Custom styling for markdown elements
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-sm">{children}</li>,
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-white/20 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                        ) : (
                          <code className="block bg-white/10 p-2 rounded text-xs font-mono overflow-x-auto">{children}</code>
                        );
                      },
                      pre: ({ children }) => <pre className="bg-white/10 p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>,
                      blockquote: ({ children }) => <blockquote className="border-l-2 border-white/30 pl-3 italic mb-2">{children}</blockquote>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      a: ({ children, href }) => (
                        <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-gray-100 border border-white/20 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about HelperU..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
