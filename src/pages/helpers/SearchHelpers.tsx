import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { helperApi, HelperResponse, HelperSearchRequest } from '../../lib/api/helpers';
import { applicationApi } from '../../lib/api/applications';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';

const SearchHelpers: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authRoute, isAuthenticated } = useAuth();
  const taskId = searchParams.get('task_id');

  const [helpers, setHelpers] = useState<HelperResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [graduationYearFilter, setGraduationYearFilter] = useState('');
  const [zipCodeFilter, setZipCodeFilter] = useState('');
  const [invitingHelper, setInvitingHelper] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || authRoute !== 'client') {
      navigate('/auth/client');
      return;
    }
    loadHelpers();
  }, [isAuthenticated, authRoute, navigate]);

  const loadHelpers = async (searchRequest?: HelperSearchRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const request: HelperSearchRequest = {
        search_query: searchRequest?.search_query || searchQuery || undefined,
        search_college: searchRequest?.search_college || collegeFilter || undefined,
        search_graduation_year: searchRequest?.search_graduation_year || (graduationYearFilter ? parseInt(graduationYearFilter) : undefined),
        search_zip_code: searchRequest?.search_zip_code || zipCodeFilter || undefined,
        limit: 50,
        offset: 0,
      };

      const response = await helperApi.searchHelpers(request);
      setHelpers(response.helpers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load helpers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadHelpers({
      search_query: searchQuery || undefined,
      search_college: collegeFilter || undefined,
      search_graduation_year: graduationYearFilter ? parseInt(graduationYearFilter) : undefined,
      search_zip_code: zipCodeFilter || undefined,
    });
  };

  const handleInviteHelper = async (helperId: string) => {
    if (!taskId) {
      toast.error('No task ID provided');
      return;
    }

    try {
      setInvitingHelper(helperId);
      await applicationApi.inviteHelperToTask(taskId, helperId);
      toast.success('Helper invited successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to invite helper');
    } finally {
      setInvitingHelper(null);
    }
  };

  const handleBack = () => {
    if (taskId) {
      navigate(`/tasks/browse/${taskId}`);
    } else {
      navigate('/tasks/my-posts');
    }
  };

  if (!isAuthenticated || authRoute !== 'client') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Search Helpers</h1>
              <p className="text-gray-300">Find and invite helpers to your task</p>
            </div>
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

        {/* Search Filters */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Search Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Query</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, bio, college..."
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">College</label>
              <input
                type="text"
                value={collegeFilter}
                onChange={(e) => setCollegeFilter(e.target.value)}
                placeholder="College name..."
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Graduation Year</label>
              <input
                type="number"
                value={graduationYearFilter}
                onChange={(e) => setGraduationYearFilter(e.target.value)}
                placeholder="2024"
                min="1900"
                max="2100"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code</label>
              <input
                type="text"
                value={zipCodeFilter}
                onChange={(e) => setZipCodeFilter(e.target.value)}
                placeholder="12345"
                maxLength={10}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              {loading ? 'Searching...' : 'Search Helpers'}
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Available Helpers</h2>
              <span className="text-gray-300">{helpers.length} helpers found</span>
            </div>

            {helpers.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Helpers Found</h3>
                <p className="text-gray-300">Try adjusting your search filters to find more helpers.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {helpers.map((helper) => (
                  <div key={helper.id} className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      {helper.pfp_url ? (
                        <img
                          src={helper.pfp_url}
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center border-2 border-white/20">
                          <span className="text-xl text-white">👤</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">
                          {helper.first_name} {helper.last_name}
                        </h3>
                        <p className="text-gray-300 text-sm">{helper.college}</p>
                        <p className="text-gray-400 text-xs">Class of {helper.graduation_year}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-300 text-sm line-clamp-3">{helper.bio}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span>📍 {helper.zip_code}</span>
                    </div>

                    <button
                      onClick={() => handleInviteHelper(helper.id)}
                      disabled={invitingHelper === helper.id}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                      {invitingHelper === helper.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Inviting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Invite to Task
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHelpers;
