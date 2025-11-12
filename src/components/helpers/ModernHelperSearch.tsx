import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { helperApi, HelperResponse, HelperSearchRequest } from '../../lib/api/helpers';
import { applicationApi, InvitationResponse } from '../../lib/api/applications';
import { taskApi, TaskResponse } from '../../lib/api/tasks';
import { useAuth } from '../../lib/contexts/AuthContext';
import CollegeInput from '../ui/CollegeInput';
import toast from 'react-hot-toast';
import { ClientPage } from '@/lib/utils/types';

type ModernHelperSearchProps = {
  setPage: Dispatch<SetStateAction<ClientPage>>;
}

function ModernHelperSearch({ setPage }: ModernHelperSearchProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authRoute, isAuthenticated } = useAuth();
  const taskIdFromUrl = searchParams.get('taskId');

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

  useEffect(() => {
    if (!isAuthenticated || authRoute !== 'client') {
      navigate('/auth/client');
      return;
    }
    loadUserTasks();
  }, [isAuthenticated, authRoute, navigate]);

  // Reload tasks when taskId is in URL to ensure newly created task is loaded
  useEffect(() => {
    if (taskIdFromUrl && isAuthenticated && authRoute === 'client') {
      loadUserTasks();
    }
  }, [taskIdFromUrl, isAuthenticated, authRoute]);

  // Auto-search on component mount
  useEffect(() => {
    if (isAuthenticated && authRoute === 'client' && !hasSearched) {
      searchHelpers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authRoute]);

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
    <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-white border border-gray-200 shadow-sm mx-0 sm:mx-4 md:mx-8 lg:mx-52 rounded-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Find Helpers</h1>
                <p className="text-gray-700 text-xs sm:text-sm">Search and invite helpers to your tasks</p>
              </div>
            </div>

            {hasSearched && (
              <button
                onClick={resetSearch}
                className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                Reset Search
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">

        {/* Search Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            {/* Main Search Bar */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchHelpers()}
                placeholder="Search by name, skills, or keywords..."
                className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={searchHelpers}
                disabled={loading}
                className="absolute right-1 sm:right-2 top-1 sm:top-2 bottom-1 sm:bottom-2 px-3 sm:px-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-xs sm:text-sm font-medium rounded-md sm:rounded-lg transition-all duration-200 flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                ) : (
                  'Search'
                )}
              </button>
            </div>

            {/* Filters Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-sm sm:text-base text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Advanced Filters</span>
              </button>

              {(collegeFilter || graduationYearFilter || zipCodeFilter) && (
                <button
                  onClick={clearFilters}
                  className="text-xs sm:text-sm text-blue-700 hover:text-blue-800 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Collapsible Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* College Filter */}

                  <div className='flex flex-col sm:col-span-2 lg:col-span-1'>
                    <span className='text-gray-600 tracking-tight text-xs sm:text-sm font-semibold mb-2'>Helper School</span>
                    <CollegeInput onChange={((val) => setCollegeFilter(val.label))} value={""} />
                  </div>

                  {/* Graduation Year Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-2">Graduation Year</label>
                    <select
                      value={graduationYearFilter}
                      onChange={(e) => setGraduationYearFilter(e.target.value)}
                      className="h-9 sm:h-10 w-full px-3 py-2 text-sm sm:text-base bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Year</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                        <option key={year} value={year} className="bg-white text-gray-900">
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Zip Code Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-2">Zip Code</label>
                    <input
                      type="text"
                      value={zipCodeFilter}
                      onChange={(e) => setZipCodeFilter(e.target.value)}
                      placeholder="Enter zip code"
                      className="h-9 sm:h-10 w-full px-3 py-2 text-sm sm:text-base bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {loading ? 'Searching...' : `Found ${helpers.length} helpers`}
              </h2>
              {helpers.length > 0 && (
                <div className="text-xs sm:text-sm text-gray-600">
                  Click "Invite" to select tasks
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* No Results */}
            {!loading && helpers.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No helpers found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            )}

            {/* Helper Cards */}
            {!loading && helpers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {helpers.map((helper) => (
                  <div
                    key={helper.id}
                    className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-sm transition-all duration-200 flex flex-col items-start justify-between"
                  >
                    {/* Helper Info */}
                    <div className="flex items-start space-x-4 mb-4">
                      {helper.pfp_url ? (
                        <img
                          src={helper.pfp_url}
                          alt={`${helper.first_name} ${helper.last_name}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {helper.first_name[0]}{helper.last_name[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {helper.first_name} {helper.last_name}
                        </h3>
                        <p className="text-gray-700 text-sm">{helper.college}</p>
                        {helper.graduation_year && (
                          <p className="text-gray-500 text-xs">Class of {helper.graduation_year}</p>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {helper.bio && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                        {helper.bio}
                      </p>
                    )}

                    {/* Location */}
                    {helper.zip_code && (
                      <div className="flex items-center text-gray-600 text-xs mb-4">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {helper.zip_code}
                      </div>
                    )}

                    {/* Invite Button */}
                    {(() => {
                      const isInvited = taskIdFromUrl ? isHelperInvitedToTask(helper.id, taskIdFromUrl) : false;
                      const isInviting = taskIdFromUrl ? invitingHelper === `${helper.id}-${taskIdFromUrl}` : false;
                      
                      if (taskIdFromUrl && isInvited) {
                        return (
                          <div className="w-full px-4 py-2 bg-green-50 border border-green-200 text-green-700 font-medium rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Invited
                          </div>
                        );
                      }
                      
                      return (
                        <button
                          onClick={() => {
                            // If taskId is in URL, directly invite to that task
                            if (taskIdFromUrl && userTasks.some(task => task.id === taskIdFromUrl)) {
                              handleInviteHelper(helper.id, taskIdFromUrl);
                            } else {
                              // Otherwise, show task selection modal
                              setSelectedHelper(helper);
                              setShowTaskSelection(true);
                            }
                          }}
                          disabled={isInviting}
                          className="w-full px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center disabled:cursor-not-allowed"
                        >
                          {isInviting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Inviting...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Invite Helper
                            </>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Selection Modal */}
      {showTaskSelection && selectedHelper && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto shadow-sm">
            <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Invite {selectedHelper.first_name} {selectedHelper.last_name}</h2>
                <p className="text-gray-900 text-sm sm:text-base mt-1">This helper will be notified by text message when you invite them to a task.</p>
              </div>
              <button
                onClick={() => {
                  setShowTaskSelection(false);
                  setSelectedHelper(null);
                }}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 font-medium mb-1 text-sm sm:text-base">{task.title}</h3>
                        <p className="text-gray-700 text-xs sm:text-sm mb-2 line-clamp-2">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-600">
                          <span>${task.hourly_rate}/hr</span>
                          <span className="capitalize">{task.location_type}</span>
                          <span>{new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 sm:space-y-2 sm:ml-4">
                        {isInvited ? (
                          <div className="flex items-center space-x-2 text-green-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium">Invited</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleInviteHelper(selectedHelper.id, task.id)}
                            disabled={isInviting}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
                          >
                            {isInviting ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                                Inviting...
                              </>
                            ) : (
                              'Invite'
                            )}
                          </button>
                        )}
                        {isInvited && (
                          <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-green-100 text-green-700 font-medium rounded-lg border border-green-200 whitespace-nowrap">
                            Invited
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {userTasks.length === 0 && (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No tasks available</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">You need to create tasks before you can invite helpers</p>
                <button
                  onClick={() => setPage("createPost")}
                  className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base font-medium rounded-lg transition-all duration-200"
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
