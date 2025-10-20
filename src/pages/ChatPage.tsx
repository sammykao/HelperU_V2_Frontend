import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import { chatApi, ChatWithParticipantsResponse, MessageResponse, ChatWebSocket, ChatParticipantInfo } from '../lib/api/chat';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../lib/api/client';

interface ChatListItem {
  id: string;
  participant: {
    id: string;
    first_name: string;
    last_name: string;
    college?: string;
    pfp_url?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
  updated_at: string;
}

const ChatPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatWithParticipantsResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [wsConnection, setWsConnection] = useState<ChatWebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Message cache to avoid reloading messages when switching chats
  const [messageCache, setMessageCache] = useState<Record<string, MessageResponse[]>>({});
  const [chatCache, setChatCache] = useState<Record<string, ChatWithParticipantsResponse>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    loadChats();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedChat) {
      // Messages should already be loaded from batch loading
      if (messageCache[selectedChat.id]) {
        setMessages(messageCache[selectedChat.id]);
      } else {
      loadMessages(selectedChat.id);
      }
      connectWebSocket(selectedChat.id);
    }
    return () => {
      if (wsConnection) {
        wsConnection.disconnect();
      }
    };
  }, [selectedChat]);

  // Add a function to refresh messages when needed
  const refreshMessages = async () => {
    if (selectedChat) {
      await loadMessages(selectedChat.id, true); // Force reload
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getUserChats();
      
      // Transform the response to basic chat list
      const chatList: ChatListItem[] = response.chats.map(chat => {
        // Find the other user ID (not the current user)
        const otherUser = chat.users.find((u: ChatParticipantInfo) => u.id != user?.id);
        return {
          id: chat.id,
          participant: {
            id: otherUser?.id || 'unknown',
            first_name: otherUser?.first_name || '',
            last_name: otherUser?.last_name || '',
            college: otherUser?.college || '',
            pfp_url: otherUser?.pfp_url || '',
          },
          last_message: undefined, // We'll fetch this with detailed chat data
          unread_count: 0, // We'll fetch this with detailed chat data
          updated_at: chat.updated_at,
        };
      });
      
      setChats(chatList);
      setLoading(false); // Show chat list immediately
      
      // Now batch load all chat details first
      await batchLoadAllChatData(chatList);
      
    } catch (error) {
      console.error('Failed to load chats:', error);
      toast.error('Failed to load conversations');
      setLoading(false);
    }
  };

  const batchLoadAllChatData = async (chatList: ChatListItem[]) => {
    try {
      
      // Batch load all chat details with participants
      const chatDetailsPromises = chatList.map(chat => 
        chatApi.getChatWithParticipants(chat.id).catch(error => {
          console.error(`Failed to load chat details for ${chat.id}:`, error);
          return null;
        })
      );
      
      const chatDetailsResults = await Promise.all(chatDetailsPromises);
      const validChatDetails = chatDetailsResults.filter((detail): detail is ChatWithParticipantsResponse => detail !== null);
      
      // Cache all chat details
      const newChatCache: Record<string, ChatWithParticipantsResponse> = {};
      validChatDetails.forEach(chatDetail => {
        if (chatDetail) {
          newChatCache[chatDetail.id] = chatDetail;
        }
      });
      setChatCache(newChatCache);
      
      // Update chat list with detailed information
      setChats(prev => prev.map(chat => {
        const chatDetail = newChatCache[chat.id];
        if (chatDetail) {
          console.log(`Setting unread count for chat ${chat.id}: ${chatDetail.unread_count || 0}`);
          return {
            ...chat,
            last_message: chatDetail.last_message ? {
              content: chatDetail.last_message,
              created_at: chatDetail.last_message_at || chatDetail.updated_at,
              sender_id: '' // We'll need to determine this from messages
            } : undefined,
            unread_count: chatDetail.unread_count || 0,
          };
        }
        return chat;
      }));
      
      
      await batchLoadAllMessages(validChatDetails);
      
    } catch (error) {
      console.error('Failed to batch load chat data:', error);
    }
  };

  const batchLoadAllMessages = async (chatDetails: ChatWithParticipantsResponse[]) => {
    try {
      
      // Batch load messages for all chats
      const messagePromises = chatDetails.map(chat => 
        chatApi.getChatMessages(chat.id, 50, 0).catch(error => {
          console.error(`Failed to load messages for ${chat.id}:`, error);
          return { messages: [], total_count: 0 };
        })
      );
      
      const messageResults = await Promise.all(messagePromises);
      
      // Cache all messages
      const newMessageCache: Record<string, MessageResponse[]> = {};
      messageResults.forEach((result, index) => {
        if (result && result.messages) {
          newMessageCache[chatDetails[index].id] = result.messages;
        }
      });
      setMessageCache(newMessageCache);
      
      // Update chat list with last message info from actual messages
      setChats(prev => prev.map(chat => {
        const messages = newMessageCache[chat.id];
        if (messages && messages.length > 0) {
          const lastMessage = messages[messages.length - 1]; // Messages are in chronological order
          return {
            ...chat,
            last_message: {
              content: lastMessage.content,
              created_at: lastMessage.created_at,
              sender_id: lastMessage.sender_id
            },
          };
        }
        return chat;
      }));
      
      
    } catch (error) {
      console.error('Failed to batch load messages:', error);
    }
  };

  const loadMessages = async (chatId: string, forceReload = false) => {
    // Check cache first
    if (!forceReload && messageCache[chatId]) {
      setMessages(messageCache[chatId]);
      return;
    }

    try {
      setLoadingMessages(true);
      const response = await chatApi.getChatMessages(chatId, 50, 0);
      const messages = response.messages; // Messages should be in chronological order (oldest to newest)
      
      // Update cache
      setMessageCache(prev => ({
        ...prev,
        [chatId]: messages
      }));
      
      setMessages(messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const connectWebSocket = (chatId: string) => {
    if (wsConnection) {
      wsConnection.disconnect();
    }
    
    // Replace http or httpswith ws
    const rawUrl = API_BASE_URL.replace('http', 'ws').replace('https', 'wss');
    const token = localStorage.getItem('access_token');
    const ws = new ChatWebSocket(`${rawUrl}/chat/ws/${chatId}`, token);
    
    ws.onMessage((data) => {
      if (data.type === 'message') {
        const newMessage = data.message;
        
        // Update messages state
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === newMessage.id);
          if (messageExists) {
            return prev; // Don't add duplicate
          }
          return [...prev, newMessage];
        });
        
        // Update message cache
        setMessageCache(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), newMessage]
        }));
        
        // Update chat list with new last message
        setChats(prev => prev.map(chat => {
          if (chat.id === chatId) {
            const isFromOtherUser = newMessage.sender_id !== user?.id;
            const newUnreadCount = isFromOtherUser ? (chat.unread_count || 0) + 1 : chat.unread_count;
            console.log(`WebSocket: Updating chat ${chatId}, isFromOtherUser: ${isFromOtherUser}, unread: ${chat.unread_count} -> ${newUnreadCount}`);
            return {
              ...chat,
              last_message: {
                content: newMessage.content,
                created_at: newMessage.created_at,
                sender_id: newMessage.sender_id
              },
              updated_at: newMessage.created_at,
              // Increment unread count if message is from other user
              unread_count: newUnreadCount
            };
          }
          return chat;
        }));
      }
    });

    ws.connect().then(() => {
      setWsConnection(ws);
    }).catch((error) => {
      console.error('WebSocket connection failed:', error);
      toast.error('Failed to connect to chat (real-time updates disabled)');
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    // Optimistic update - add message to UI immediately
    const optimisticMessage: MessageResponse = {
      id: `temp-${Date.now()}`, // Temporary ID
      chat_id: selectedChat.id,
      sender_id: user?.id || '',
      content: messageContent,
      message_type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Update cache immediately
    setMessageCache(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), optimisticMessage]
    }));

    try {
      setSendingMessage(true);
      const sentMessage = await chatApi.sendMessage(selectedChat.id, {
        content: messageContent,
        message_type: 'text'
      });
      
      // Replace optimistic message with real message from server
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? sentMessage : msg
        )
      );
      
      // Update cache with real message
      setMessageCache(prev => ({
        ...prev,
        [selectedChat.id]: (prev[selectedChat.id] || []).map(msg => 
          msg.id === optimisticMessage.id ? sentMessage : msg
        )
      }));
      
      // Update chat list with new last message
      setChats(prev => prev.map(chat => {
        if (chat.id === selectedChat.id) {
          return {
            ...chat,
            last_message: {
              content: sentMessage.content,
              created_at: sentMessage.created_at,
              sender_id: sentMessage.sender_id
            },
            updated_at: sentMessage.created_at,
            // Don't increment unread count for our own messages
            unread_count: chat.unread_count || 0
          };
        }
        return chat;
      }));
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
      // Remove from cache
      setMessageCache(prev => ({
        ...prev,
        [selectedChat.id]: (prev[selectedChat.id] || []).filter(msg => msg.id !== optimisticMessage.id)
      }));
      
      // Restore message to input
      setNewMessage(messageContent);
    } finally {
      setSendingMessage(false);
    }
  };

  const selectChat = async (chatId: string) => {
    try {
      setSelectedChatId(chatId);
      
      // Everything should be preloaded, so this should be instant
      if (chatCache[chatId] && messageCache[chatId]) {
        setSelectedChat(chatCache[chatId]);
        setMessages(messageCache[chatId]);
        
        // Mark messages as read and clear unread count
        markChatAsRead(chatId);
      } else {
        // Fallback: if somehow not cached, load it
        console.warn(`Chat ${chatId} not found in cache, loading...`);
        setLoadingMessages(true);
        const chatData = await chatApi.getChatWithParticipants(chatId);
        
        // Cache the chat data
        setChatCache(prev => ({
          ...prev,
          [chatId]: chatData
        }));
        
        setSelectedChat(chatData);
        
        // Load messages for the selected chat
        await loadMessages(chatId);
        
        // Mark messages as read
        markChatAsRead(chatId);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      toast.error('Failed to load conversation');
      setLoadingMessages(false);
    } finally {
      setSelectedChatId(null);
    }
  };

  const markChatAsRead = async (chatId: string) => {
    try {
      // Get all message IDs from the current chat
      const messages = messageCache[chatId] || [];
      const messageIds = messages.map(msg => msg.id);
      
      console.log(`Marking chat ${chatId} as read with ${messageIds.length} messages`);
      
      if (messageIds.length > 0) {
        // Call API to mark messages as read
        await chatApi.markMessagesRead(chatId, { message_ids: messageIds });
        console.log(`Successfully marked ${messageIds.length} messages as read`);
      }
      
      // Clear unread count in chat list
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          console.log(`Clearing unread count for chat ${chatId} (was ${chat.unread_count})`);
          return {
            ...chat,
            unread_count: 0
          };
        }
        return chat;
      }));
      
      // Also update the chat cache
      setChatCache(prev => {
        if (prev[chatId]) {
          return {
            ...prev,
            [chatId]: {
              ...prev[chatId],
              unread_count: 0
            }
          } as any;
        }
        return prev;
      });
      
    } catch (error) {
      console.error('Failed to mark chat as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffInDays < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access chat</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex h-[calc(100vh-200px)] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Chat List Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                  <p className="text-gray-700 text-sm mt-1">Your conversations</p>
                </div>
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-700 text-sm">Loading conversations...</p>
                  </div>
                </div>
              ) : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-gray-600 text-sm">Start chatting with helpers or clients</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => selectChat(chat.id)}
                      disabled={selectedChatId === chat.id}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedChat?.id === chat.id ? 'bg-gray-50 border-r-2 border-blue-600' : ''
                      } ${selectedChatId === chat.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Profile Picture */}
                        {chat.participant.pfp_url ? (
                          <img
                            src={chat.participant.pfp_url}
                            alt={`${chat.participant.first_name || 'Unknown'} ${chat.participant.last_name || 'User'}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {(chat.participant.first_name?.[0] || 'U')}{(chat.participant.last_name?.[0] || 'U')}
                          </div>
                        )}

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-gray-900 font-medium truncate">
                              {chat.participant.first_name || 'Unknown'} {chat.participant.last_name || 'User'}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {selectedChatId === chat.id && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              )}
                              {chat.last_message && (
                                <span className="text-gray-500 text-xs">
                                  {formatLastMessageTime(chat.last_message.created_at)}
                                </span>
                              )}
                            </div>
                          </div>
                          {chat.participant.college && (
                            <p className="text-gray-500 text-xs truncate">{chat.participant.college}</p>
                          )}
                          {chat.last_message && (
                            <p className="text-gray-700 text-sm truncate mt-1">
                              {chat.last_message.content}
                            </p>
                          )}
                        </div>

                        {/* Unread Count */}
                        {chat.unread_count > 0 && (
                          <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unread_count}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                    {(() => {
                      // Find the other participant (not the current user)
                      const otherParticipant = selectedChat.participants.find(p => p.id !== user?.id);
                      if (!otherParticipant) return null;
                      
                      return (
                        <>
                          {otherParticipant.pfp_url ? (
                            <img
                              src={otherParticipant.pfp_url}
                              alt={`${otherParticipant.first_name} ${otherParticipant.last_name}`}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {otherParticipant.first_name?.[0] || 'U'}{otherParticipant.last_name?.[0] || 'U'}
                            </div>
                          )}
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              {otherParticipant.first_name || 'Unknown'} {otherParticipant.last_name || 'User'}
                            </h2>
                            <p className="text-gray-600 text-sm">{otherParticipant.college || 'No college info'}</p>
                          </div>
                        </>
                      );
                    })()}
                    </div>
                    
                    {/* Refresh Button */}
                    <button
                      onClick={refreshMessages}
                      disabled={loadingMessages}
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Refresh messages"
                    >
                      <svg className={`w-5 h-5 ${loadingMessages ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading messages...</h3>
                        <p className="text-gray-600 text-sm">Please wait while we fetch the conversation</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-gray-600 text-sm">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            message.sender_id === user?.id
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-all duration-200 flex items-center"
                    >
                      {sendingMessage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a chat from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
