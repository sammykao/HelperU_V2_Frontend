import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar';
import { applicationApi, ApplicationResponse, InvitationResponse } from '../../lib/api/applications';
import { taskApi, TaskResponse } from '../../lib/api/tasks';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type TabKey = 'applications' | 'invitations';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
      active 
        ? 'bg-gray-200 text-gray-800 border border-gray-300' 
        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

const TaskCard: React.FC<{ task: TaskResponse; subtitle?: string; type: 'application' | 'invitation' }> = ({ task, subtitle, type }) => {
  const navigate = useNavigate();
  
  const getCardGradient = () => {
    if (type === 'application') {
      return 'from-emerald-50 via-blue-50 to-purple-50';
    }
    return 'from-orange-50 via-pink-50 to-purple-50';
  };

  const getIconGradient = () => {
    if (type === 'application') {
      return 'from-emerald-500 to-blue-500';
    }
    return 'from-orange-500 to-pink-500';
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



  return (
    <div className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative z-10">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="relative">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${getIconGradient()} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm`}>
              {getStatusIcon()}
            </div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r ${type === 'application' ? 'from-green-400 to-emerald-500' : 'from-orange-400 to-red-500'} rounded-full`}></div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {task.title}
              </h3>
              <span className={`px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r ${type === 'application' ? 'from-green-50 to-emerald-50 text-green-700' : 'from-orange-50 to-red-50 text-orange-700'} text-xs font-medium rounded-full border ${type === 'application' ? 'border-green-200' : 'border-orange-200'} self-start sm:self-auto`}>
                {type === 'application' ? 'Applied' : 'Invited'}
              </span>
            </div>
            
            {subtitle && (
              <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">{subtitle}</p>
            )}
            
            <p className="text-gray-700 leading-relaxed mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">{task.description}</p>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center px-2 py-1 sm:px-4 sm:py-2 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-blue-700 text-xs sm:text-sm font-medium">${task.hourly_rate}/hour</span>
              </div>
              
              <div className="flex items-center px-2 py-1 sm:px-4 sm:py-2 bg-purple-50 rounded-lg sm:rounded-xl border border-purple-200">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-purple-700 text-xs sm:text-sm font-medium capitalize">{task.location_type.replace('-', ' ')}</span>
              </div>
              
              {task.zip_code && (
                <div className="flex items-center px-2 py-1 sm:px-4 sm:py-2 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-gray-700 text-xs sm:text-sm font-medium">{task.zip_code}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => navigate(`/tasks/browse/${task.id}`)}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-lg transition-all duration-200 flex items-center justify-center text-xs sm:text-sm"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </button>
            
            
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
              <h3 className="text-lg font-bold text-black">How Applications Work</h3>
              <p className="text-gray-700 text-sm">Understanding the application process</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-gray-200 rounded-2xl p-4">
            <p className="text-gray-800 leading-relaxed">
              <span className="font-semibold text-blue-700">Important:</span> Clients don't accept applications directly. 
              Instead, they will reach out to you if they're interested, or you can proactively reach out to them through their listed phone number. 
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
            <h3 className="text-lg font-bold text-black">How Invitations Work</h3>
            <p className="text-gray-700 text-sm">Understanding the invitation process</p>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm border border-gray-200 rounded-2xl p-4">
          <p className="text-gray-800 leading-relaxed">
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
            <h3 className="text-2xl font-bold text-black mb-4">{title}</h3>
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
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-white border border-gray-200 rounded-3xl p-8 mb-8 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isHelper ? 'My Applications & Invitations' : 'Applications on My Posts'}
                </h1>
                <p className="text-gray-700 text-lg">{isHelper ? 'Track your applications and invitations' : 'Review applications from helpers'}</p>
              </div>
            </div>
          </div>
        </div>

        

        {/* Tab Navigation */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white border border-gray-400 rounded-2xl p-2 inline-flex shadow-sm">
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
                <div key={i} className="relative overflow-hidden bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                  <div className="animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="relative overflow-hidden bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm">
              <div className="relative z-10 flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-1">Error Loading Data</h3>
                  <p className="text-red-700">{error}</p>
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
