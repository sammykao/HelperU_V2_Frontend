import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { helperApi, HelperResponse, HelperSearchRequest } from '../../lib/api/helpers';
import { applicationApi, InvitationResponse } from '../../lib/api/applications';
import { taskApi, TaskResponse } from '../../lib/api/tasks';
import { useAuth } from '../../lib/contexts/AuthContext';
import CreateChatButton from '../chat/CreateChatButton';
import toast from 'react-hot-toast';
import collegesData from '../../data/colleges.json';

interface ModernHelperSearchProps {
  onBack?: () => void;
}

const ModernHelperSearch: React.FC<ModernHelperSearchProps> = ({ onBack }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authRoute, isAuthenticated } = useAuth();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [helpers, setHelpers] = useState<HelperResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [collegeFilter, setCollegeFilter] = useState('');
  const [graduationYearFilter, setGraduationYearFilter] = useState('');
  const [zipCodeFilter, setZipCodeFilter] = useState('');

  // Task invitation state
  const [selectedHelper, setSelectedHelper] = useState<HelperResponse | null>(null);
  const [showTaskSelection, setShowTaskSelection] = useState(false);
  const [userTasks, setUserTasks] = useState<TaskResponse[]>([]);
  const [taskInvitations, setTaskInvitations] = useState<Record<string, InvitationResponse[]>>({});
  const [invitingHelper, setInvitingHelper] = useState<string | null>(null);

  // Get college names for filter
  const collegeNames = useMemo(() => Object.keys(collegesData).sort(), []);

  useEffect(() => {
    if (!isAuthenticated || authRoute !== 'client') {
      navigate('/auth/client');
      return;
    }
    loadUserTasks();
  }, [isAuthenticated, authRoute, navigate]);

  const loadUserTasks = async () => {
    try {
      const response = await taskApi.getMyTasks(100, 0);
      setUserTasks(response.tasks);
      
      // Load invitations for each task
      const invitationsMap: Record<string, InvitationResponse[]> = {};
      for (const task of response.tasks) {
        try {
          const invitationsResponse = await applicationApi.getInvitationsByTask(task.id);
          invitationsMap[task.id] = invitationsResponse.invitations;
        } catch (err) {
          invitationsMap[task.id] = [];
        }
      }
      setTaskInvitations(invitationsMap);
    } catch (err) {
      console.error('Failed to load user tasks:', err);
    }
  };

  const searchHelpers = async () => {
    if (!searchQuery.trim() && !collegeFilter && !graduationYearFilter && !zipCodeFilter) {
      toast.error('Please enter a search query or apply filters');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const request: HelperSearchRequest = {
        search_query: searchQuery.trim() || undefined,
        search_college: collegeFilter || undefined,
        search_graduation_year: graduationYearFilter ? parseInt(graduationYearFilter) : undefined,
        search_zip_code: zipCodeFilter || undefined,
        limit: 50,
        offset: 0,
      };

      const response = await helperApi.searchHelpers(request);
      setHelpers(response.helpers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search helpers');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteHelper = async (helperId: string, taskId: string) => {
    try {
      setInvitingHelper(`${helperId}-${taskId}`);
      await applicationApi.inviteHelperToTask(taskId, helperId);
      toast.success('Helper invited successfully!');
      
      // Refresh invitations for this task
      const invitationsResponse = await applicationApi.getInvitationsByTask(taskId);
      setTaskInvitations(prev => ({
        ...prev,
        [taskId]: invitationsResponse.invitations
      }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to invite helper');
    } finally {
      setInvitingHelper(null);
    }
  };

  const isHelperInvitedToTask = (helperId: string, taskId: string): boolean => {
    const invitations = taskInvitations[taskId] || [];
    return invitations.some(invitation => invitation.helper_id === helperId);
  };

  const clearFilters = () => {
    setCollegeFilter('');
    setGraduationYearFilter('');
    setZipCodeFilter('');
  };

  const resetSearch = () => {
    setSearchQuery('');
    setHelpers([]);
    setHasSearched(false);
    setError(null);
    clearFilters();
  };

  if (!isAuthenticated || authRoute !== 'client') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">Find Helpers</h1>
                <p className="text-gray-300 text-sm">Search and invite helpers to your tasks</p>
              </div>
            </div>
            
            {hasSearched && (
              <button
                onClick={resetSearch}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Reset Search
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            {/* Main Search Bar */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchHelpers()}
                placeholder="Search by name, skills, or keywords..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={searchHelpers}
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Search'
                )}
              </button>
            </div>

            {/* Filters Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Advanced Filters</span>
              </button>
              
              {(collegeFilter || graduationYearFilter || zipCodeFilter) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Collapsible Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* College Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">College</label>
                    <select
                      value={collegeFilter}
                      onChange={(e) => setCollegeFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Colleges</option>
                      {collegeNames.map((college) => (
                        <option key={college} value={college} className="bg-gray-800">
                          {college}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Graduation Year Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Graduation Year</label>
                    <select
                      value={graduationYearFilter}
                      onChange={(e) => setGraduationYearFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Any Year</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                        <option key={year} value={year} className="bg-gray-800">
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Zip Code Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Zip Code</label>
                    <input
                      type="text"
                      value={zipCodeFilter}
                      onChange={(e) => setZipCodeFilter(e.target.value)}
                      placeholder="Enter zip code"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {loading ? 'Searching...' : `Found ${helpers.length} helpers`}
              </h2>
              {helpers.length > 0 && (
                <div className="text-sm text-gray-400">
                  Click "Invite" to select tasks
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            )}

            {/* No Results */}
            {!loading && helpers.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No helpers found</h3>
                <p className="text-gray-400">Try adjusting your search criteria or filters</p>
              </div>
            )}

            {/* Helper Cards */}
            {!loading && helpers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {helpers.map((helper) => (
                  <div
                    key={helper.id}
                    className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200"
                  >
                    {/* Helper Info */}
                    <div className="flex items-start space-x-4 mb-4">
                      {helper.pfp_url ? (
                        <img
                          src={helper.pfp_url}
                          alt={`${helper.first_name} ${helper.last_name}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {helper.first_name[0]}{helper.last_name[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">
                          {helper.first_name} {helper.last_name}
                        </h3>
                        <p className="text-gray-300 text-sm">{helper.college}</p>
                        {helper.graduation_year && (
                          <p className="text-gray-400 text-xs">Class of {helper.graduation_year}</p>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {helper.bio && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {helper.bio}
                      </p>
                    )}

                    {/* Location */}
                    {helper.zip_code && (
                      <div className="flex items-center text-gray-400 text-xs mb-4">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {helper.zip_code}
                      </div>
                    )}

                    {/* Invite Button */}
                    <button
                      onClick={() => {
                        setSelectedHelper(helper);
                        setShowTaskSelection(true);
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Invite Helper
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Selection Modal */}
      {showTaskSelection && selectedHelper && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Invite {selectedHelper.first_name} {selectedHelper.last_name}</h2>
                <p className="text-gray-300 text-sm">Select which tasks to invite this helper to</p>
              </div>
              <button
                onClick={() => {
                  setShowTaskSelection(false);
                  setSelectedHelper(null);
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {userTasks.map((task) => {
                const isInvited = isHelperInvitedToTask(selectedHelper.id, task.id);
                const isInviting = invitingHelper === `${selectedHelper.id}-${task.id}`;
                
                return (
                  <div
                    key={task.id}
                    className="bg-white/5 border border-white/20 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{task.title}</h3>
                        <p className="text-gray-300 text-sm mb-2 line-clamp-2">{task.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>${task.hourly_rate}/hr</span>
                          <span>{task.location_type}</span>
                          <span>{new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col space-y-2">
                        {isInvited ? (
                          <div className="flex items-center space-x-2 text-green-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium">Invited</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleInviteHelper(selectedHelper.id, task.id)}
                            disabled={isInviting}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center"
                          >
                            {isInviting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Inviting...
                              </>
                            ) : (
                              'Invite'
                            )}
                          </button>
                        )}
                        {isInvited && (
                          <CreateChatButton 
                            helperId={selectedHelper.id}
                            helperName={`${selectedHelper.first_name} ${selectedHelper.last_name}`}
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {userTasks.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No tasks available</h3>
                <p className="text-gray-400 mb-4">You need to create tasks before you can invite helpers</p>
                <button
                  onClick={() => navigate('/tasks/create')}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200"
                >
                  Create Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernHelperSearch;
