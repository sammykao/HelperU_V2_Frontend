/**
 * Utility functions for managing AI chat thread ID in localStorage
 */

const AI_CHAT_THREAD_KEY = 'ai_chat_thread_id';

/**
 * Get the current AI chat thread ID from localStorage
 * If no thread ID exists, generates and stores a new one
 */
export const getAIChatThreadId = (): string => {
  const stored = localStorage.getItem(AI_CHAT_THREAD_KEY);
  if (stored) {
    return stored;
  }
  
  // Generate a new thread ID
  const newThreadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(AI_CHAT_THREAD_KEY, newThreadId);
  return newThreadId;
};

/**
 * Set a new AI chat thread ID in localStorage
 */
export const setAIChatThreadId = (threadId: string): void => {
  localStorage.setItem(AI_CHAT_THREAD_KEY, threadId);
};

/**
 * Clear the AI chat thread ID from localStorage
 */
export const clearAIChatThreadId = (): void => {
  localStorage.removeItem(AI_CHAT_THREAD_KEY);
};
