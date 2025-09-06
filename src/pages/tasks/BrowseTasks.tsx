import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { taskApi, TaskSearchResponse, TaskSearchRequest } from '../../lib/api/tasks';
import { formatCurrency, formatDate, formatDistance } from '../../lib/utils/format';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';

const BrowseTasks: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<TaskSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<TaskSearchRequest>({
    search_zip_code: '02138', // Default to Harvard area
    limit: 20,
    offset: 0,
  });
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, [searchParams]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskApi.getTasks(searchParams);
      setTasks(response.tasks);
      setTotalCount(response.total_count);
    } catch (error: any) {
      toast.error('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => ({ ...prev, offset: 0 }));
  };

  const handleFilterChange = (key: keyof TaskSearchRequest, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const loadMore = () => {
    setSearchParams(prev => ({ 
      ...prev, 
      offset: prev.offset + prev.limit 
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
                  value={searchParams.query || ''}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Search posts..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location Type
                </label>
                <select
                  value={searchParams.location_type || ''}
                  onChange={(e) => handleFilterChange('location_type', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min Rate ($/hr)
                </label>
                <input
                  type="number"
                  value={searchParams.min_hourly_rate || ''}
                  onChange={(e) => handleFilterChange('min_hourly_rate', e.target.value ? parseFloat(e.target.value) : undefined)}
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
                  value={searchParams.max_hourly_rate || ''}
                  onChange={(e) => handleFilterChange('max_hourly_rate', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your ZIP Code
                </label>
                <input
                  type="text"
                  value={searchParams.search_zip_code}
                  onChange={(e) => handleFilterChange('search_zip_code', e.target.value)}
                  className="w-32 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="02138"
                  maxLength={5}
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
        <div className="mb-4">
          <p className="text-gray-300">
            {totalCount} opportunity{totalCount !== 1 ? 'ies' : ''} found
          </p>
        </div>

        {/* Task Cards */}
        {isLoading ? (
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
              <div key={task.id} className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white line-clamp-2">{task.title}</h3>
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
                    {task.distance && (
                      <span className="text-sm text-blue-400">• {formatDistance(task.distance)}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-300">{task.dates.length} date{task.dates.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{formatDate(task.created_at)}</span>
                  <Link
                    to={`/tasks/${task.id}`}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {tasks.length < totalCount && (
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
