import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { taskApi, TaskSearchResponse, TaskSearchRequest } from '../../lib/api/tasks';
import { formatCurrency, formatDate, formatDistance } from '../../lib/utils/format';
import { profileApi } from '../../lib/api/profile';
import { applicationApi, ApplicationInfo } from '../../lib/api/applications';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';

const BrowseTasks: React.FC = () => {
  const { authRoute } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskSearchResponse[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskSearchResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<TaskSearchRequest>({
    search_zip_code: '', // Will be set from user profile
    search_limit: 20,
    search_offset: 0,
    sort_by: 'post_date',
  });
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'post_date'>('post_date');
  const [showFilters, setShowFilters] = useState(false);
  const [distanceRadius, setDistanceRadius] = useState<number | undefined>(100);

  // Load applications for helper
  const loadApplications = async () => {
    if (authRoute !== 'helper') return;
    
    try {
      const response = await applicationApi.getApplicationsByHelper();
      setApplications(response.applications.map(app => app.application));
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  };

  // Fetch user profile and set zip code on mount, then automatically load tasks
  useEffect(() => {
    const initializeZipCodeAndLoadTasks = async () => {
      if (authRoute === 'helper') {
        // Load applications first
        await loadApplications();
        
        try {
          const profileResponse = await profileApi.getProfile();
          if (profileResponse.profile?.helper?.zip_code) {
            const zipCode = profileResponse.profile!.helper!.zip_code!;
            setSearchParams(prev => ({
              ...prev,
              search_zip_code: zipCode
            }));
            
            // Automatically load tasks with the user's ZIP code
            setIsLoading(true);
            try {
              const response = await taskApi.getTasks({
                search_zip_code: zipCode,
                search_limit: 20,
                search_offset: 0,
                sort_by: 'post_date',
                distance_radius: distanceRadius,
              });
              
              setTasks(response.tasks);
              setTotalCount(response.tasks.length < response.limit ? 
                response.tasks.length : 
                response.tasks.length + 1
              );
              setHasSearched(true);
            } catch (error: any) {
              toast.error('Failed to load tasks');
              console.error('Error fetching tasks:', error);
            } finally {
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.log('Could not fetch profile for zip code');
        }
      }
    };
    
    initializeZipCodeAndLoadTasks();
  }, [authRoute]);

  // Filter tasks to remove those already applied to (for helpers)
  useEffect(() => {
    if (authRoute === 'helper' && applications.length > 0) {
      const appliedTaskIds = new Set(applications.map(app => app.task_id));
      const filtered = tasks.filter(task => !appliedTaskIds.has(task.id));
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }, [tasks, applications, authRoute]);

  const fetchTasks = async () => {
    setIsLoading(true);
    
    // Reload applications for helpers
    if (authRoute === 'helper') {
      await loadApplications();
    }
    
    try {
      const response = await taskApi.getTasks({
        ...searchParams,
        distance_radius: distanceRadius,
      });
      
      if ((searchParams.search_offset || 0) === 0) {
        // First page or new search - replace tasks
        setTasks(response.tasks);
      } else {
        // Load more - append tasks
        setTasks(prev => [...prev, ...response.tasks]);
      }
      
      // Update total count based on whether we got a full page
      setTotalCount(response.tasks.length < response.limit ? 
        ((searchParams.search_offset || 0) + response.tasks.length) : 
        ((searchParams.search_offset || 0) + response.tasks.length + 1)
      );
    } catch (error: any) {
      toast.error('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.search_zip_code.trim()) {
      toast.error('ZIP code is required');
      return;
    }
    setSearchParams(prev => ({ ...prev, search_offset: 0 }));
    setHasSearched(true);
    fetchTasks();
  };

  const handleFilterChange = (key: keyof TaskSearchRequest, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value, search_offset: 0 }));
  };

  // On sort change, push to server-side sort and reset pagination
  useEffect(() => {
    setSearchParams(prev => ({ ...prev, sort_by: sortBy, search_offset: 0 } as any));
  }, [sortBy]);

  // Auto-search when filters or pagination change (debounced)
  useEffect(() => {
    if (!hasSearched || !searchParams.search_zip_code) return;

    const timeoutId = setTimeout(() => {
      fetchTasks();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    searchParams.search_query,
    searchParams.search_location_type,
    searchParams.min_hourly_rate,
    searchParams.max_hourly_rate,
    searchParams.search_offset,
    searchParams.search_limit,
    searchParams.search_zip_code,
    distanceRadius,
    hasSearched
  ]);

  const loadMore = () => {
    setSearchParams(prev => ({ 
      ...prev, 
      search_offset: (prev.search_offset || 0) + (prev.search_limit || 20)
    }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Browse Opportunities</h1>
          <p className="text-sm sm:text-base text-gray-700">
            {hasSearched 
              ? `Showing opportunities near ${searchParams.search_zip_code} - modify filters below to refine your search`
              : 'Find posts that match your skills and interests'
            }
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Search Filters</p>
                <p className="text-xs text-gray-500">Tap to {showFilters ? 'hide' : 'show'} filters</p>
              </div>
            </div>
            <div className={`transform transition-transform duration-300 ${showFilters ? 'rotate-180' : 'rotate-0'}`}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Search and Filters */}
        <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 sm:mb-8 transition-all duration-500 ease-in-out ${
          showFilters ? 'p-4 sm:p-6 opacity-100 max-h-screen' : 'sm:p-6 p-0 opacity-0 max-h-0 sm:opacity-100 sm:max-h-screen overflow-hidden'
        }`}>
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                  {hasSearched ? 'Refine Your Search' : 'Search Filters'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-700">
                  {hasSearched 
                    ? 'Adjust the filters below to find more specific opportunities'
                    : 'Set your search criteria to find opportunities'
                  }
                </p>
              </div>
              {isLoading && hasSearched && (
                <div className="flex items-center space-x-2 text-blue-700">
                  <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs sm:text-sm">Updating...</span>  
                </div>
              )}
            </div>
          </div>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchParams.search_query || ''}
                  onChange={(e) => handleFilterChange('search_query', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Search posts..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Location Type
                </label>
                <select
                  value={searchParams.search_location_type || ''}
                  onChange={(e) => handleFilterChange('search_location_type', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-no-repeat bg-right pr-8 sm:pr-10 text-sm sm:text-base"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23637489' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1rem 1rem'
                  }}
                >
                  <option value="" className="bg-white text-gray-900">All Locations</option>
                  <option value="remote" className="bg-white text-gray-900">Remote</option>
                  <option value="in_person" className="bg-white text-gray-900">In-Person</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'distance' | 'post_date')}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-no-repeat bg-right pr-8 sm:pr-10 text-sm sm:text-base"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23637489' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1rem 1rem'
                  }}
                >
                  <option value="distance" className="bg-white text-gray-900">Distance</option>
                  <option value="post_date" className="bg-white text-gray-900">Post Date</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Min Rate ($/hr)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={searchParams.min_hourly_rate || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                    if (value !== undefined && value < 0) return; // Prevent negative values
                    handleFilterChange('min_hourly_rate', value);
                  }}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Max Rate ($/hr)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={searchParams.max_hourly_rate || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                    if (value !== undefined && value < 0) return; // Prevent negative values
                    handleFilterChange('max_hourly_rate', value);
                  }}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Distance (miles)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  step="1"
                  value={distanceRadius || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    if (value !== undefined && value < 1) return;
                    if (value !== undefined && value > 500) return;
                    setDistanceRadius(value);
                  }}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
              <div className="flex-1 sm:flex-none">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Your ZIP Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={searchParams.search_zip_code}
                  onChange={(e) => handleFilterChange('search_zip_code', e.target.value)}
                  className="w-full sm:w-32 px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="02138"
                  maxLength={5}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm sm:text-base"
              >
                {hasSearched ? 'Update Search' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        

        {/* Results */}
        {hasSearched && (
          <div className="mb-4">
            <p className="text-sm sm:text-base text-gray-700">
              {filteredTasks.length} opportunit{filteredTasks.length !== 1 ? 'ies' : 'y'} found
            </p>
          </div>
        )}

        {/* Task Cards */}
        {!hasSearched ? (
          <div className="text-center py-12">
            <div className="relative w-20 h-20 mx-auto mb-6">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
              
              {/* Inner pulsing circle */}
              <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 animate-pulse">Loading Opportunities</h3>
            <p className="text-gray-700">Finding opportunities near your location...</p>
            <div className="flex justify-center mt-4 space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-sm">
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>
                
                <div className="relative">
                  <div className="h-4 bg-gray-100 rounded mb-4 animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded mb-2 animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                  <div className="h-3 bg-gray-100 rounded mb-4 animate-pulse" style={{animationDelay: `${i * 0.1 + 0.1}s`}}></div>
                  <div className="h-8 bg-gray-100 rounded animate-pulse" style={{animationDelay: `${i * 0.1 + 0.2}s`}}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-700">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/browse/${task.id}`}
                className="block bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 mb-2">{task.title}</h3>
                    <div className="flex items-center space-x-2">
                      {task.client.pfp_url && (
                        <img 
                          src={task.client.pfp_url} 
                          alt={`${task.client.first_name} {task.client.last_name}`}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-gray-200 flex-shrink-0"
                        />
                      )}
                      <span className="text-xs sm:text-sm text-gray-700 truncate">
                        Posted by {task.client.first_name} {task.client.last_name}
                      </span>
                    </div>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-blue-700 flex-shrink-0 ml-2">{formatCurrency(task.hourly_rate)}/hr</span>
                </div>

                <p className="text-gray-700 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">{task.description}</p>

                <div className="space-y-2 mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs sm:text-sm text-gray-700 capitalize">{task.location_type === 'in_person' ? 'In Person' : 'Remote'}</span>
                    {task.location_type !== 'remote' && task.zip_code && (
                      <span className="text-xs sm:text-sm text-blue-700">• {task.zip_code}</span>
                    )}
                    {task.location_type !== 'remote' && task.distance !== undefined && task.distance !== null && (
                      <span className="text-xs sm:text-sm text-blue-700">• {formatDistance(task.distance)}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs sm:text-sm text-gray-700">{task.dates.length} date{task.dates.length !== 1 ? 's' : ''}</span>
                    {task.dates.length > 0 && (
                      <span className="text-xs sm:text-sm text-blue-700">
                        • {task.dates.slice(0, 2).map(date => {
                          const d = new Date(date);
                          return d.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          });
                        }).join(', ')}{task.dates.length > 2 ? '...' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{formatDate(task.created_at)}</span>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <span className="text-xs hidden sm:inline">Click to view</span>
                    <span className="text-xs sm:hidden">View</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
        {tasks.length > 0 && tasks.length >= (searchParams.search_limit || 20) && (
          <div className="text-center mt-6 sm:mt-8">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-white text-gray-900 font-medium rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Load More</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseTasks;


