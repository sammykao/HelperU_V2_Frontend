import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar';
import { applicationApi, ApplicationResponse, InvitationResponse } from '../../lib/api/applications';
import { taskApi, TaskResponse } from '../../lib/api/tasks';
import { chatApi } from '../../lib/api/chat';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type TabKey = 'applications' | 'invitations';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
        : 'text-gray-300 hover:text-white hover:bg-white/10'
    }`}
  >
    {children}
  </button>
);

const TaskCard: React.FC<{ task: TaskResponse; subtitle?: string; type: 'application' | 'invitation' }> = ({ task, subtitle, type }) => {
  const navigate = useNavigate();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [chatExists, setChatExists] = useState<boolean | null>(null);
  
  const getCardGradient = () => {
    if (type === 'application') {
      return 'from-emerald-500/20 via-blue-500/20 to-purple-500/20';
    }
    return 'from-orange-500/20 via-pink-500/20 to-purple-500/20';
  };

  const getIconGradient = () => {
    if (type === 'application') {
      return 'from-emerald-500 to-blue-600';
    }
    return 'from-orange-500 to-pink-600';
  };

  const getStatusIcon = () => {
    if (type === 'application') {
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    );
  };

  // Check if chat exists with the client
  useEffect(() => {
    const checkChatExists = async () => {
      try {
        const response = await chatApi.getChatWithParticipant(task.client_id);
        setChatExists(response.chat_id !== null);
      } catch (error) {
        console.error('Failed to check chat existence:', error);
        setChatExists(false);
      }
    };

    if (type === 'application') {
      checkChatExists();
    }
  }, [task.client_id, type]);

  const handleChatAction = async () => {
    if (chatExists) {
      // Navigate to existing chat
      navigate('/chat');
      toast.success('Opening chat with client');
    } else {
      // Create new chat
      try {
        setIsCreatingChat(true);
        await chatApi.createChat({
          participant_id: task.client_id
        });
        navigate('/chat');
        toast.success('Chat created with client!');
      } catch (error) {
        console.error('Failed to create chat:', error);
        toast.error('Failed to create chat. Please try again.');
      } finally {
        setIsCreatingChat(false);
      }
    }
  };

  return (
    <div className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/30 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:from-white/20 hover:to-white/10">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getCardGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-orange-500/20 rounded-full blur-2xl animate-bounce"></div>
      
      <div className="relative z-10">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <div className={`w-16 h-16 bg-gradient-to-r ${getIconGradient()} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {getStatusIcon()}
            </div>
            <div className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r ${type === 'application' ? 'from-green-400 to-emerald-500' : 'from-orange-400 to-red-500'} rounded-full animate-ping`}></div>
      </div>

      <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                {task.title}
              </h3>
              <span className={`px-3 py-1 bg-gradient-to-r ${type === 'application' ? 'from-green-500/20 to-emerald-500/20 text-green-300' : 'from-orange-500/20 to-red-500/20 text-orange-300'} text-xs font-medium rounded-full border ${type === 'application' ? 'border-green-500/30' : 'border-orange-500/30'}`}>
                {type === 'application' ? 'Applied' : 'Invited'}
              </span>
            </div>
            
            {subtitle && (
              <p className="text-gray-300 text-sm mb-3">{subtitle}</p>
            )}
            
            <p className="text-gray-200 leading-relaxed mb-4 line-clamp-2">{task.description}</p>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                <svg className="w-4 h-4 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-blue-300 text-sm font-medium">${task.hourly_rate}/hour</span>
              </div>
              
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <svg className="w-4 h-4 mr-2 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-purple-300 text-sm font-medium capitalize">{task.location_type.replace('-', ' ')}</span>
              </div>
              
              {task.zip_code && (
                <div className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-xl border border-gray-500/30">
                  <svg className="w-4 h-4 mr-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-gray-300 text-sm font-medium">{task.zip_code}</span>
          </div>
              )}
          </div>
        </div>
          
          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={() => navigate(`/tasks/browse/${task.id}`)}
              className="group/btn px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Details
              </div>
            </button>
            
            {type === 'application' && (
              <button
                onClick={handleChatAction}
                disabled={isCreatingChat || chatExists === null}
                className="group/chat px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  {isCreatingChat ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2 group-hover/chat:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {chatExists ? 'Open Chat' : 'Start Chat'}
                    </>
        )}
      </div>
    </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoBlurb: React.FC<{ type: 'applications' | 'invitations' }> = ({ type }) => {
  if (type === 'applications') {
    return (
      <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-pink-500/15 border border-blue-500/30 rounded-3xl p-6 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-bounce"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">How Applications Work</h3>
              <p className="text-gray-300 text-sm">Understanding the application process</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
            <p className="text-gray-200 leading-relaxed">
              <span className="font-semibold text-blue-300">Important:</span> Clients don't accept applications directly. 
              Instead, they will reach out to you if they're interested, or you can proactively reach out to them through chat. 
              This creates a more personal connection and allows for better communication about the opportunity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-orange-500/15 via-pink-500/15 to-purple-500/15 border border-orange-500/30 rounded-3xl p-6 mb-8 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-pink-600/20 rounded-full blur-3xl animate-bounce"></div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">How Invitations Work</h3>
            <p className="text-gray-300 text-sm">Understanding the invitation process</p>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
          <p className="text-gray-200 leading-relaxed">
            <span className="font-semibold text-orange-300">Important:</span> Invitations are only to apply to the task. 
            When you receive an invitation, it means a client has specifically invited you to apply for their opportunity. 
            It's recommended that you submit an application to the task.
          </p>
        </div>
      </div>
    </div>
  );
};

const MyApplications: React.FC = () => {
  const { authRoute } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('applications');
  const [apps, setApps] = useState<ApplicationResponse[] | null>(null);
  const [invites, setInvites] = useState<InvitationResponse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskMap, setTaskMap] = useState<Record<string, TaskResponse>>({});

  const isHelper = authRoute === 'helper';

  const fetchTasksForIds = async (taskIds: string[]) => {
    const uniqueIds = Array.from(new Set(taskIds.filter(Boolean)));
    const missing = uniqueIds.filter((id) => !taskMap[id]);
    if (missing.length === 0) return;
    try {
      const results = await Promise.allSettled(missing.map((id) => taskApi.getTask(id)));
      const next: Record<string, TaskResponse> = {};
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          next[missing[idx]] = res.value;
        }
      });
      if (Object.keys(next).length) {
        setTaskMap((prev) => ({ ...prev, ...next }));
      }
    } catch {}
  };

  const loadData = async (nextTab: TabKey) => {
    setLoading(true);
    setError(null);
    try {
      if (nextTab === 'applications') {
        const res = isHelper
          ? await applicationApi.getApplicationsByHelper()
          : await applicationApi.getApplicationsByClient();
        setApps(res.applications);
        const ids = res.applications.map((a) => a.application.task_id);
        fetchTasksForIds(ids);
      } else {
        const res = isHelper
          ? await applicationApi.getInvitationsByHelper()
          : { invitations: [], total_count: 0 };
        setInvites(res.invitations);
        const ids = res.invitations.map((i) => i.task_id);
        fetchTasksForIds(ids);
      }
    } catch (e: any) {
      const message = e?.message || 'Failed to load data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData('applications');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHelper]);

  useEffect(() => {
    if (tab === 'invitations' && invites === null) {
      loadData('invitations');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const emptyState = useMemo(() => {
    const title = tab === 'applications' ? 'No Applications Yet' : 'No Invitations Yet';
    const description = tab === 'applications' 
      ? 'You haven\'t applied to any tasks yet. Start browsing opportunities to find your perfect match!'
      : 'You haven\'t received any invitations yet. Keep your profile updated to attract client attention!';
    
    return (
      <div className="text-center py-16">
        <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/30 rounded-3xl p-12 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-400/20 to-blue-600/20 rounded-full blur-3xl animate-bounce"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
            <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">{description}</p>
            <button
              onClick={() => navigate('/tasks/browse')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              Browse Opportunities
            </button>
          </div>
        </div>
      </div>
    );
  }, [tab, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Assistant Blurb */}
        <div className="mb-8 backdrop-blur-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Need Help with Applications?</h3>
              <p className="text-gray-300 text-sm mb-4">
                Our AI Assistant can help you write better application messages, 
                understand task requirements, and provide tips for successful applications.
              </p>
              <button
                onClick={() => navigate('/ai-assistant')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 flex items-center text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Try AI Assistant
              </button>
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/30 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-bounce"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                  {isHelper ? 'My Applications & Invitations' : 'Applications on My Posts'}
                </h1>
                <p className="text-gray-300 text-lg">{isHelper ? 'Track your applications and invitations' : 'Review applications from helpers'}</p>
              </div>
            </div>
          </div>
        </div>

        

        {/* Tab Navigation */}
        <div className="flex items-center justify-center mb-8">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-2 inline-flex">
            <TabButton active={tab === 'applications'} onClick={() => { setTab('applications'); if (apps === null) loadData('applications'); }}>
              Applications
            </TabButton>
            <TabButton active={tab === 'invitations'} onClick={() => { setTab('invitations'); if (invites === null) loadData('invitations'); }}>
              Invitations
            </TabButton>
          </div>
        </div>

        {/* Info Blurb */}
        <InfoBlurb type={tab} />

        {/* Content */}
        <div className="space-y-6">
          {loading && (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/30 rounded-3xl p-6 shadow-2xl">
                  <div className="animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-white/20 rounded w-3/4"></div>
                        <div className="h-4 bg-white/20 rounded w-1/2"></div>
                        <div className="h-4 bg-white/20 rounded w-full"></div>
                        <div className="h-4 bg-white/20 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-red-500/15 via-red-500/10 to-red-500/5 border border-red-500/30 rounded-3xl p-6 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 animate-pulse"></div>
              <div className="relative z-10 flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Error Loading Data</h3>
                  <p className="text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && tab === 'applications' && (
            apps && apps.length > 0 ? (
              <div className="space-y-6">
                {apps.map((a, index) => {
                const task = taskMap[a.application.task_id];
                if (!task) return null;
                return (
                    <div key={a.application.id} style={{ animationDelay: `${index * 100}ms` }}>
                      <TaskCard 
                        task={task} 
                        subtitle={`Applied on ${new Date(a.application.created_at).toLocaleDateString()}`} 
                        type="application"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              emptyState
            )
          )}

          {!loading && !error && tab === 'invitations' && (
            invites && invites.length > 0 ? (
              <div className="space-y-6">
                {invites.map((i, index) => {
                const task = taskMap[i.task_id];
                if (!task) return null;
                return (
                    <div key={i.id} style={{ animationDelay: `${index * 100}ms` }}>
                      <TaskCard 
                        task={task} 
                        subtitle={`Invited on ${new Date(i.created_at).toLocaleDateString()}`} 
                        type="invitation"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              emptyState
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
