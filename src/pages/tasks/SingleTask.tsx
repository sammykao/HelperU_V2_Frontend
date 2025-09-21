import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { taskApi, TaskResponse } from '../../lib/api/tasks';
import { applicationApi, ApplicationResponse, InvitationResponse, ApplicationCreateData } from '../../lib/api/applications';
import { useAuth } from '../../lib/contexts/AuthContext';
import CreateChatButton from '../../components/chat/CreateChatButton';
import { chatApi } from '../../lib/api/chat';
import { formatCurrency } from '../../lib/utils/format';
import toast from 'react-hot-toast';

const SingleTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authRoute, isAuthenticated, user } = useAuth();
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applicants, setApplicants] = useState<ApplicationResponse[] | null>(null);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [invitations, setInvitations] = useState<InvitationResponse[] | null>(null);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [myApplication, setMyApplication] = useState<ApplicationResponse | null>(null);
  const [myApplicationLoading, setMyApplicationLoading] = useState(false);
  const [helperChatMap, setHelperChatMap] = useState<Record<string, string | null>>({});
  const [helperChatLoading, setHelperChatLoading] = useState(false);
  const [invitedHelperChatMap, setInvitedHelperChatMap] = useState<Record<string, string | null>>({});
  const [invitedHelperChatLoading, setInvitedHelperChatLoading] = useState(false);
  const [myApplicationChatExists, setMyApplicationChatExists] = useState<boolean | null>(null);
  const [myApplicationChatLoading, setMyApplicationChatLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      
      // Always load the task first
      const taskData = await taskApi.getTask(id!);
      setTask(taskData);
      
      // If helper, check if they already applied to this task
      if (isAuthenticated && authRoute === 'helper') {
        setMyApplicationLoading(true);
        try {
          const myApps = await applicationApi.getApplicationsByHelper();
          const existing = myApps.applications.find(a => a.application.task_id == id);
          if (existing) {
            setMyApplication(existing || null);
            
            // Check if chat exists with the client
            setMyApplicationChatLoading(true);
            try {
              const response = await chatApi.getChatWithParticipant(taskData.client_id);
              setMyApplicationChatExists(response.chat_id !== null);
            } catch (error) {
              console.error('Failed to check chat existence:', error);
              setMyApplicationChatExists(false);
            } finally {
              setMyApplicationChatLoading(false);
            }
          } 
        } finally {
          setMyApplicationLoading(false);
        }
      } else {
        setMyApplication(null);
        setMyApplicationChatExists(null);
      }

      // Only try to load applications and invitations if user is authenticated and is a client
      // AND the task belongs to them (we'll check this after loading the task)
      if (isAuthenticated && authRoute === 'client' && taskData.client_id === user?.id) {
        setApplicantsLoading(true);
        setInvitationsLoading(true);
        
        try {
          const [applicantsData, invitationsData] = await Promise.all([
            applicationApi.getApplicationsByTask(id!),
            applicationApi.getInvitationsByTask(id!)
          ]);
          
          if (applicantsData && applicantsData.applications) {
            setApplicants(applicantsData.applications);
            // After applicants load, batch check for existing chats per helper
            const helperIds = applicantsData.applications.map(a => a.helper.id);
            if (helperIds.length > 0) {
              setHelperChatLoading(true);
              try {
                const chatMap = await chatApi.batchCheckChatsWithParticipants(helperIds);
                setHelperChatMap(chatMap);
              } catch (e) {
                console.warn('Failed to check chats:', e);
                // Fallback: set all to null
                setHelperChatMap(Object.fromEntries(helperIds.map(id => [id, null])));
              }
              setHelperChatLoading(false);
            } else {
              setHelperChatMap({});
            }
          } else {
            setApplicants([]);
            setHelperChatMap({});
          }
          
          if (invitationsData && invitationsData.invitations) {
            setInvitations(invitationsData.invitations);
            // After invitations load, batch check for existing chats per invited helper
            const invitedHelperIds = invitationsData.invitations
              .filter(inv => inv.helpers) // Only include invitations with helper data
              .map(inv => inv.helpers!.id);
            if (invitedHelperIds.length > 0) {
              setInvitedHelperChatLoading(true);
              try {
                const chatMap = await chatApi.batchCheckChatsWithParticipants(invitedHelperIds);
                console.log('Invited helper chat map:', chatMap);
                console.log('Invited helper IDs:', invitedHelperIds);
                setInvitedHelperChatMap(chatMap);
              } catch (e) {
                console.warn('Failed to check chats for invited helpers:', e);
                // Fallback: set all to null
                setInvitedHelperChatMap(Object.fromEntries(invitedHelperIds.map(id => [id, null])));
              }
              setInvitedHelperChatLoading(false);
            } else {
              setInvitedHelperChatMap({});
            }
          } else {
            setInvitations([]);
            setInvitedHelperChatMap({});
          }
        } catch (appErr) {
          // If applications/invitations fail to load, just set empty arrays
          console.warn('Failed to load applications/invitations:', appErr);
          setApplicants([]);
          setInvitations([]);
          setHelperChatMap({});
          setInvitedHelperChatMap({});
        } finally {
          setApplicantsLoading(false);
          setInvitationsLoading(false);
        }
      } else {
        // For helpers, non-clients, or unauthenticated users, set empty arrays
        setApplicants([]);
        setInvitations([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      if (authRoute === 'client') {
        navigate('/tasks/my-posts');
      } else {
        navigate('/tasks/browse');
      }
    }
  };

  const handleApply = () => {
    if (!task) return;
    
    if (authRoute !== 'helper') {
      toast.error('Only helpers can apply for tasks');
      return;
    }

    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!task || !applicationMessage.trim()) {
      toast.error('Please enter an introduction message');
      return;
    }
    
    try {
      setApplying(true);
      
      const applicationData: ApplicationCreateData = {
        introduction_message: applicationMessage.trim(),
        supplements_url: undefined
      };
      
      const resp = await applicationApi.createApplication(task.id, applicationData);
      toast.success('Application submitted successfully!');
      setShowApplicationModal(false);
      setApplicationMessage('');
      setMyApplication(resp);
    } catch (err) {
      console.error('Failed to apply:', err);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleMyApplicationChatAction = async () => {
    if (!task) return;
    
    if (myApplicationChatExists) {
      // Navigate to existing chat
      navigate('/chat');
      toast.success('Opening chat with client');
    } else {
      // Create new chat
      try {
        setMyApplicationChatLoading(true);
        await chatApi.createChat({
          participant_id: task.client_id
        });
        navigate('/chat');
        toast.success('Chat created with client!');
      } catch (error) {
        console.error('Failed to create chat:', error);
        toast.error('Failed to create chat. Please try again.');
      } finally {
        setMyApplicationChatLoading(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getStatusBadge = (completedAt?: string) => {
    if (completedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Loading task details...</h2>
            <p className="text-gray-300">Please wait while we fetch the information.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Task Not Found</h1>
            <p className="text-gray-300 mb-6">{error || 'The task you\'re looking for doesn\'t exist or has been removed.'}</p>
            <button
              onClick={() => navigate('/tasks/browse')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              Browse Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{task.title}</h1>
              <p className="text-gray-300">Task Details and Applications</p>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(task.completed_at)}
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>

            {/* Additional Information */}
            {(task.tools_info || task.public_transport_info) && (
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Additional Information</h2>
                <div className="space-y-4">
                  {task.tools_info && (
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Tools Required</h3>
                      <p className="text-gray-300">{task.tools_info}</p>
                    </div>
                  )}
                  {task.public_transport_info && (
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Public Transport</h3>
                      <p className="text-gray-300">{task.public_transport_info}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Available Dates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {task.dates.map((date, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-300">{formatDate(date)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Applicants (Client view) */}
            {isAuthenticated && authRoute === 'client' && (
              <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/30 rounded-3xl p-8 shadow-2xl">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-bounce"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-orange-500/20 rounded-full blur-2xl animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping"></div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                          Applications
                        </h2>
                        <p className="text-gray-300 text-sm">Students who are interested. You don't have to accept them, only complete the post once you've found someone.</p>
                      </div>
                    </div>
                  {applicantsLoading && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
                        <span className="text-gray-300 text-sm">Loading...</span>
                      </div>
                  )}
                </div>

                {(!applicantsLoading && applicants && applicants.length === 0) && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No applications yet</h3>
                      <p className="text-gray-400">Students will appear here when they apply to your task</p>
                    </div>
                  )}

                {(!applicantsLoading && applicants && applicants.length > 0) && (
                    <div className="space-y-6">
                      {applicants.map(({ application, helper }, index) => (
                        <div 
                          key={application.id} 
                          className="group relative overflow-hidden bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:from-white/15 hover:to-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {/* Card glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start space-x-4">
                                {/* Avatar */}
                                <div className="relative">
                                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-white font-bold text-lg">
                                      {helper.first_name[0]}{helper.last_name[0]}
                                    </span>
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white/20 flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>

                          <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                                      {helper.first_name} {helper.last_name}
                                    </h3>
                                    <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 text-xs font-medium rounded-full border border-green-500/30">
                                      Applied
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm mb-2">
                                    {helper.college}{helper.graduation_year ? ` • Class of ${helper.graduation_year}` : ''}
                                  </p>
                                  <div className="flex items-center text-gray-400 text-xs">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Applied {new Date(application.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {application.introduction_message && (
                              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                                  {application.introduction_message}
                                </p>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center space-x-4">
                          {application.supplements_url && (
                            <a
                              href={application.supplements_url}
                              target="_blank"
                              rel="noreferrer"
                                    className="group/attach inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-blue-300 hover:text-blue-200 rounded-xl border border-blue-500/30 transition-all duration-300 hover:scale-105"
                            >
                                    <svg className="w-4 h-4 mr-2 group-hover/attach:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                                    View Attachment
                            </a>
                          )}
                              </div>

                              <div className="flex items-center justify-end sm:justify-start space-x-3">
                          {helperChatLoading ? (
                                  <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-xl">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                    <span className="text-gray-300 text-sm">Checking...</span>
                                  </div>
                          ) : helperChatMap[helper.id] ? (
                            <button
                              onClick={() => navigate('/chat')}
                                    className="group/chat inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                    <svg className="w-4 h-4 mr-2 group-hover/chat:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Open Chat
                            </button>
                          ) : (
                            <CreateChatButton 
                              helperId={helper.id}
                              helperName={`${helper.first_name} ${helper.last_name}`}
                                    size="lg"
                                    className="hover:scale-105 transition-transform duration-300"
                            />
                          )}
                              </div>
                            </div>
                          </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
              </div>
            )}

            {/* Invited Helpers (Client view) */}
            {isAuthenticated && authRoute === 'client' && (
              <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/30 rounded-3xl p-8 shadow-2xl">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 animate-pulse"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-bounce"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/20 to-red-500/20 rounded-full blur-2xl animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-ping"></div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                          Invitations
                        </h2>
                        <p className="text-gray-300 text-sm">Helpers you've invited to apply</p>
                      </div>
                    </div>
                  {invitationsLoading && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
                        <span className="text-gray-300 text-sm">Loading...</span>
                      </div>
                  )}
                </div>

                {(!invitationsLoading && invitations && invitations.length === 0) && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No invitations sent yet</h3>
                      <p className="text-gray-400">Invite helpers to apply to your task</p>
                    </div>
                  )}

                {(!invitationsLoading && invitations && invitations.length > 0) && (
                    <div className="space-y-6">
                      {invitations.map((invitation, index) => (
                        <div 
                          key={invitation.id} 
                          className="group relative overflow-hidden bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:from-white/15 hover:to-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {/* Card glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start space-x-4">
                                {/* Avatar */}
                                <div className="relative">
                                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    {invitation.helpers ? (
                                      <span className="text-white font-bold text-lg">
                                        {invitation.helpers.first_name[0]}{invitation.helpers.last_name[0]}
                                      </span>
                                    ) : (
                                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full border-2 border-white/20 flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>

                          <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                            {invitation.helpers ? (
                              <>
                                        <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                                          {invitation.helpers.first_name} {invitation.helpers.last_name}
                                        </h3>
                                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 text-xs font-medium rounded-full border border-orange-500/30">
                                          Invited
                                        </span>
                              </>
                            ) : (
                              <>
                                        <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                                          Helper ID: {invitation.helper_id}
                                        </h3>
                                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 text-xs font-medium rounded-full border border-orange-500/30">
                                          Invited
                                        </span>
                              </>
                            )}
                          </div>
                                  {invitation.helpers && (
                                    <p className="text-gray-300 text-sm mb-2">
                                      {invitation.helpers.college}{invitation.helpers.graduation_year ? ` • Class of ${invitation.helpers.graduation_year}` : ''}
                                    </p>
                                  )}
                                  <div className="flex items-center text-gray-400 text-xs">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Invited {new Date(invitation.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                                  <svg className="w-4 h-4 mr-2 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-purple-300 text-sm font-medium">Waiting for response</span>
                          </div>
                        </div>

                              <div className="flex items-center justify-end sm:justify-start space-x-3">
                          {invitation.helpers && (
                                  <>
                                    {invitedHelperChatLoading ? (
                                      <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-xl">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                        <span className="text-gray-300 text-sm">Checking...</span>
                                      </div>
                                    ) : invitedHelperChatMap[invitation.helpers.id] ? (
                                      <button
                                        onClick={() => navigate('/chat')}
                                        className="group/chat inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                      >
                                        <svg className="w-4 h-4 mr-2 group-hover/chat:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        Open Chat
                                      </button>
                                    ) : (
                            <CreateChatButton 
                              helperId={invitation.helpers.id}
                              helperName={`${invitation.helpers.first_name} ${invitation.helpers.last_name}`}
                                        size="lg"
                                        className="hover:scale-105 transition-transform duration-300"
                            />
                          )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
              </div>
          )}
        </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Info Card */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Task Information</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400 text-sm">Hourly Rate</span>
                  <p className="text-2xl font-bold text-white">{formatCurrency(task.hourly_rate)}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Location Type</span>
                  <p className="text-white capitalize">{task.location_type.replace('-', ' ')}</p>
                </div>
                {task.zip_code && (
                  <div>
                    <span className="text-gray-400 text-sm">Location</span>
                    <p className="text-white">{task.zip_code}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 text-sm">Posted</span>
                  <p className="text-white">{formatDate(task.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Payment Disclaimer */}
            <div className="backdrop-blur-lg bg-gradient-to-br from-amber-500/15 via-orange-500/15 to-red-500/15 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Payment Information</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    <span className="font-semibold text-amber-300">Important:</span> Clients and helpers manage all payment transactions directly between themselves. 
                    HelperU does not process, handle, or manage any payment transactions. 
                    Please discuss payment methods and schedules directly with your client/helper.
                  </p>
                </div>
              </div>
            </div>

            {/* Helper Application/Apply Card */}
            {authRoute === 'helper' && !task.completed_at && myApplication && (
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your Application</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Submitted</span>
                    <p className="text-white">{new Date(myApplication.application.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Introduction Message</span>
                    <p className="text-white whitespace-pre-wrap">{myApplication.application.introduction_message}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-300 mb-4">You have already applied to this task.</div>
                
                {/* Chat Button */}
                <div className="mt-4">
                  {myApplicationChatLoading ? (
                    <div className="flex items-center justify-center px-4 py-3 bg-white/10 rounded-xl">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                      <span className="text-gray-300 text-sm">Checking chat...</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleMyApplicationChatAction}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {myApplicationChatExists ? 'Open Chat with Client' : 'Start Chat with Client'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {authRoute === 'helper' && !task.completed_at && !myApplication && (
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Apply for This Task</h2>
                <p className="text-gray-300 mb-4">
                  Ready to help with this task? Click below to submit your application.
                </p>
                <button
                  onClick={handleApply}
                  disabled={applying || myApplicationLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  {(applying || myApplicationLoading) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {myApplicationLoading ? 'Checking...' : 'Applying...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Apply Now
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Client Actions */}
            {authRoute === 'client' && (
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Manage Task</h2>
                <div className="space-y-3">
                  {!task?.completed_at && (
                    <button
                      onClick={() => navigate(`/tasks/edit/${id}`)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Task
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/helpers/search?task_id=${id}`)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Invite Helpers
                  </button>
                  <button
                    onClick={() => navigate('/tasks/my-posts')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    View My Posts
                  </button>
                </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Apply for Task</h2>
            <p className="text-gray-300 mb-4">
              Write a brief introduction message to the client explaining why you're interested in this task.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Introduction Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="Hi! I'm interested in helping with this task because..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {applicationMessage.length}/500
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setApplicationMessage('');
                }}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={applying || !applicationMessage.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                {applying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleTask;
