import { apiClient } from './client';

// AI Types
export interface AIRequest {
  message: string;
  thread_id?: string;
}

export interface AIResponse {
  response: string;
  thread_id: string;
  success: boolean;
}

// AI API Functions
export const aiApi = {
  // Send message to AI assistant
  sendMessage: (data: AIRequest): Promise<AIResponse> =>
    apiClient.post('/ai-agent/chat', data),
};
