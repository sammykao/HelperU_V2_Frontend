import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { taskApi, TaskResponse } from '../../lib/api/tasks';
import { applicationApi, ApplicationResponse, InvitationResponse, ApplicationCreateData } from '../../lib/api/applications';
import { useAuth } from '../../lib/contexts/AuthContext';
import CreateChatButton from '../../components/chat/CreateChatButton';
import { chatApi } from '../../lib/api/chat';
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
          } 
        } finally {
          setMyApplicationLoading(false);
        }
      } else {
        setMyApplication(null);
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
          } else {
            setInvitations([]);
          }
        } catch (appErr) {
          // If applications/invitations fail to load, just set empty arrays
          console.warn('Failed to load applications/invitations:', appErr);
          setApplicants([]);
          setInvitations([]);
          setHelperChatMap({});
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
              <p className="text-gray-300">Task Details and Application</p>
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
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Applicants</h2>
                  {applicantsLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  )}
                </div>
                {(!applicantsLoading && applicants && applicants.length === 0) && (
                  <p className="text-gray-300">No applicants yet for this task.</p>
                )}
                {(!applicantsLoading && applicants && applicants.length > 0) && (
                  <ul className="space-y-3">
                    {applicants.map(({ application, helper }) => (
                      <li key={application.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-white font-medium">{helper.first_name} {helper.last_name}</p>
                            <p className="text-gray-300 text-sm">{helper.college}{helper.graduation_year ? ` • Class of ${helper.graduation_year}` : ''}</p>
                            {application.introduction_message && (
                              <p className="text-gray-300 text-sm mt-2 whitespace-pre-wrap">{application.introduction_message}</p>
                            )}
                          </div>
                          <div className="text-right text-gray-400 text-xs ml-4">
                            {new Date(application.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          {application.supplements_url && (
                            <a
                              href={application.supplements_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-sm text-blue-300 hover:text-blue-200"
                            >
                              View attachment
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14" />
                              </svg>
                            </a>
                          )}
                          {helperChatLoading ? (
                            <div className="text-sm text-gray-400 ml-auto">Checking chat...</div>
                          ) : helperChatMap[helper.id] ? (
                            <button
                              onClick={() => navigate('/chat')}
                              className="ml-auto inline-flex items-center px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
                            >
                              Open My Chats
                            </button>
                          ) : (
                            <CreateChatButton 
                              helperId={helper.id}
                              helperName={`${helper.first_name} ${helper.last_name}`}
                              size="sm"
                              className="ml-auto"
                            />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Invited Helpers (Client view) */}
            {isAuthenticated && authRoute === 'client' && (
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Invited Helpers</h2>
                  {invitationsLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  )}
                </div>
                {(!invitationsLoading && invitations && invitations.length === 0) && (
                  <p className="text-gray-300">No helpers have been invited to this task yet.</p>
                )}
                {(!invitationsLoading && invitations && invitations.length > 0) && (
                  <ul className="space-y-3">
                    {invitations.map((invitation) => (
                      <li key={invitation.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {invitation.helpers ? (
                              <>
                                <p className="text-white font-medium">{invitation.helpers.first_name} {invitation.helpers.last_name}</p>
                                <p className="text-gray-300 text-sm">{invitation.helpers.college}{invitation.helpers.graduation_year ? ` • Class of ${invitation.helpers.graduation_year}` : ''}</p>
                                <p className="text-gray-300 text-sm">Invitation sent</p>
                              </>
                            ) : (
                              <>
                                <p className="text-white font-medium">Helper ID: {invitation.helper_id}</p>
                                <p className="text-gray-300 text-sm">Invitation sent</p>
                              </>
                            )}
                          </div>
                          <div className="text-right text-gray-400 text-xs ml-4">
                            {new Date(invitation.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Invited
                          </span>
                          {invitation.helpers && (
                            <CreateChatButton 
                              helperId={invitation.helpers.id}
                              helperName={`${invitation.helpers.first_name} ${invitation.helpers.last_name}`}
                              size="sm"
                              className="ml-auto"
                            />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
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
                <div className="mt-4 text-sm text-gray-300">You have already applied to this task.</div>
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
