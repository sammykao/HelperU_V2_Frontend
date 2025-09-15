import React, { useState } from 'react';
import { chatApi } from '../../lib/api/chat';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CreateChatButtonProps {
  helperId: string;
  helperName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CreateChatButton: React.FC<CreateChatButtonProps> = ({ 
  helperId, 
  helperName, 
  className = '',
  size = 'md'
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateChat = async () => {
    if (!user || !helperId) return;

    try {
      setIsCreating(true);
      
      // Create chat with the helper
      const chat = await chatApi.createChat({
        participant_id: helperId
      });

      // Navigate to chat page
      navigate('/chat');
      
      toast.success(`Chat created with ${helperName}!`);
    } catch (error) {
      console.error('Failed to create chat:', error);
      
      if (error instanceof Error && error.message.includes('already exists')) {
        // Chat already exists, just navigate to chat page
        navigate('/chat');
        toast.success(`Opening chat with ${helperName}`);
      } else {
        toast.error('Failed to create chat. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={handleCreateChat}
      disabled={isCreating}
      className={`${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center ${className}`}
    >
      {isCreating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Creating...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Start Chat
        </>
      )}
    </button>
  );
};

export default CreateChatButton;
