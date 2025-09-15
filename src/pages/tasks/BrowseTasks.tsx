import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { taskApi, TaskSearchResponse, TaskSearchRequest } from '../../lib/api/tasks';
import { formatCurrency, formatDate, formatDistance } from '../../lib/utils/format';
import { profileApi } from '../../lib/api/profile';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';

const BrowseTasks: React.FC = () => {
  const { authRoute } = useAuth();
  const [tasks, setTasks] = useState<TaskSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<TaskSearchRequest>({
    search_zip_code: '', // Will be set from user profile
    search_limit: 20,
    search_offset: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch user profile and set zip code on mount
  useEffect(() => {
    const initializeZipCode = async () => {
      if (authRoute === 'helper') {
        try {
          const profileResponse = await profileApi.getProfile();
          if (profileResponse.profile?.helper?.zip_code) {
            setSearchParams(prev => ({
              ...prev,
              search_zip_code: profileResponse.profile!.helper!.zip_code!
            }));
          }
        } catch (error) {
          console.log('Could not fetch profile for zip code');
        }
      }
    };
    
    initializeZipCode();
  }, [authRoute]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskApi.getTasks(searchParams);
      
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

  const loadMore = () => {
    setSearchParams(prev => ({ 
      ...prev, 
      search_offset: (prev.search_offset || 0) + (prev.search_limit || 20)
    }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Opportunities</h1>
          <p className="text-gray-300">Find posts that match your skills and interests</p>
        </div>

        {/* Search and Filters */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchParams.search_query || ''}
                  onChange={(e) => handleFilterChange('search_query', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Search posts..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location Type
                </label>
                <select
                  value={searchParams.search_location_type || ''}
                  onChange={(e) => handleFilterChange('search_location_type', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none bg-no-repeat bg-right pr-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.25rem 1.25rem'
                  }}
                >
                  <option value="" className="bg-gray-800 text-white">All Locations</option>
                  <option value="remote" className="bg-gray-800 text-white">Remote</option>
                  <option value="in-person" className="bg-gray-800 text-white">In-Person</option>
                  <option value="hybrid" className="bg-gray-800 text-white">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your ZIP Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={searchParams.search_zip_code}
                  onChange={(e) => handleFilterChange('search_zip_code', e.target.value)}
                  className="w-32 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="02138"
                  maxLength={5}
                  required
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="mb-4">
            <p className="text-gray-300">
              {totalCount} opportunity{totalCount !== 1 ? 'ies' : ''} found
            </p>
          </div>
        )}

        {/* Task Cards */}
        {!hasSearched ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Search for Opportunities</h3>
            <p className="text-gray-300">Enter your ZIP code and click Search to find opportunities near you</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-4"></div>
                <div className="h-3 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/20 rounded mb-4"></div>
                <div className="h-8 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No opportunities found</h3>
            <p className="text-gray-300">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/browse/${task.id}`}
                className="block backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white line-clamp-2 mb-2">{task.title}</h3>
                    <div className="flex items-center space-x-2">
                      {task.client.pfp_url && (
                        <img 
                          src={task.client.pfp_url} 
                          alt={`${task.client.first_name} ${task.client.last_name}`}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm text-gray-300">
                        Posted by {task.client.first_name} {task.client.last_name}
                      </span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-400">{formatCurrency(task.hourly_rate)}/hr</span>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{task.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-300 capitalize">{task.location_type}</span>
                    <span className="text-sm text-blue-400">• {task.zip_code}</span>
                    {task.distance && (
                      <span className="text-sm text-blue-400">• {formatDistance(task.distance)}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-300">{task.dates.length} date{task.dates.length !== 1 ? 's' : ''}</span>
                    {task.dates.length > 0 && (
                      <span className="text-sm text-blue-400">
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
                  <span className="text-xs text-gray-400">{formatDate(task.created_at)}</span>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <span className="text-xs">Click to view</span>
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
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-3 bg-white/20 text-white font-medium rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseTasks;
