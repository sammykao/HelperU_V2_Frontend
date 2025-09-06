import { apiClient } from './client';

// Chat Types
export interface ChatCreateRequest {
  participant_id: string;
}

export interface ChatResponse {
  id: string;
  client_id: string;
  helper_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatListResponse {
  chats: ChatResponse[];
  total_count: number;
}

export interface MessageCreateRequest {
  content: string;
  message_type?: string;
}

export interface MessageResponse {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageListResponse {
  messages: MessageResponse[];
  total_count: number;
}

export interface ChatMarkReadRequest {
  message_ids: string[];
}

export interface ChatWithParticipantsResponse extends ChatResponse {
  client: {
    id: string;
    first_name: string;
    last_name: string;
    pfp_url?: string;
  };
  helper: {
    id: string;
    first_name: string;
    last_name: string;
    college: string;
    pfp_url?: string;
  };
}

export interface WebSocketChatMessage {
  type: 'message';
  chat_id: string;
  message: MessageResponse;
}

export interface WebSocketReadReceipt {
  type: 'read_receipt';
  chat_id: string;
  message_ids: string[];
  read_by: string;
}

// Chat API Functions
export const chatApi = {
  // Create chat
  createChat: (data: ChatCreateRequest): Promise<ChatResponse> =>
    apiClient.post('/chat/create', data),

  // Get user chats
  getUserChats: (): Promise<ChatListResponse> =>
    apiClient.get('/chat/list'),

  // Get chat messages
  getChatMessages: (chatId: string, limit = 50, offset = 0): Promise<MessageListResponse> =>
    apiClient.get(`/chat/${chatId}/messages?limit=${limit}&offset=${offset}`),

  // Send message
  sendMessage: (chatId: string, data: MessageCreateRequest): Promise<MessageResponse> =>
    apiClient.post(`/chat/${chatId}/messages`, data),

  // Mark messages as read
  markMessagesRead: (chatId: string, data: ChatMarkReadRequest): Promise<{ success: boolean }> =>
    apiClient.post(`/chat/${chatId}/mark-read`, data),

  // Get chat with participants
  getChatWithParticipants: (chatId: string): Promise<ChatWithParticipantsResponse> =>
    apiClient.get(`/chat/${chatId}/participants`),
};

// WebSocket connection for real-time chat
export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(url: string, token: string | null = null) {
    this.url = url;
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.token 
          ? `${this.url}?token=${this.token}`
          : this.url;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private reconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect().catch(() => {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
        }
      });
    }, delay);
  }

  sendMessage(message: WebSocketChatMessage | WebSocketReadReceipt) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  onMessage(callback: (data: WebSocketChatMessage | WebSocketReadReceipt) => void) {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
