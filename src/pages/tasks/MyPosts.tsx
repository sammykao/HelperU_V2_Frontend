import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../components/ui/Tooltip';
import ApplicationsPreview from '../../components/tasks/ApplicationsPreview';
import { taskApi, TaskResponse } from '../../lib/api/tasks';
import { applicationApi, ApplicationResponse } from '../../lib/api/applications';
import { subscriptionApi, SubscriptionStatus } from '../../lib/api/subscriptions';
import { formatCurrency } from '../../lib/utils/format';
import { Page } from '@/lib/utils/types';

interface PostStats {
  total: number;
  completed: number;
  active: number;
}

type MyPostsProps = {
  setPage: Dispatch<SetStateAction<Page>>;
}

function MyPosts({ setPage }: MyPostsProps) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<TaskResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completingPost, setCompletingPost] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<string | null>(null);

  useEffect(() => {
    loadPostsAndSubscription();
  }, []);

  const loadPostsAndSubscription = async () => {
    try {
      setLoading(true);
      const [postsResponse, subscriptionResponse] = await Promise.all([
        taskApi.getMyTasks(50, 0),
        subscriptionApi.getStatus()
      ]);

      setPosts(postsResponse.tasks);
      setSubscriptionStatus(subscriptionResponse);

      // Load applications after posts are loaded
      loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setApplicationsLoading(true);
      const applicationsResponse = await applicationApi.getApplicationsByClient(100, 0);
      setApplications(applicationsResponse.applications);
    } catch (err) {
      console.error('Failed to load applications:', err);
      // Don't set error state for applications - posts are more important
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleCompletePost = async (postId: string) => {
    try {
      if (!window.confirm('Are you sure you want to mark this job as done? This action cannot be undone and will remove it from the Helper job board.')) {
        return;
      }
      setCompletingPost(postId);
      await taskApi.completeTask(postId);
      await loadPostsAndSubscription(); // Reload to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete post');
    } finally {
      setCompletingPost(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingPost(postId);
      await taskApi.deleteTask(postId);
      await loadPostsAndSubscription(); // Reload to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setDeletingPost(null);
    }
  };

  const handlePostAgain = (post: TaskResponse) => {
    const params = new URLSearchParams();

    // Pre-fill all fields except dates
    if (post.title) params.append('title', post.title);
    if (post.description) params.append('description', post.description);
    if (post.location_type) params.append('location_type', post.location_type);
    if (post.zip_code) params.append('zip_code', post.zip_code);
    if (post.tools_info) params.append('tools_info', post.tools_info);
    if (post.public_transport_info) params.append('public_transport_info', post.public_transport_info);
    if (post.hourly_rate) params.append('hourly_rate', post.hourly_rate.toString());

    // Switch to create post page first, then update URL with query params
    setPage('createPost');
    navigate(`/dashboard?${params.toString()}`, { replace: false });
  };

  const handlePostClick = (postId: string) => {
    navigate(`/tasks/browse/${postId}`);
  };

  const getPostStats = (): PostStats => {
    const total = posts.length;
    const completed = posts.filter(post => post.completed_at).length;
    const active = total - completed;
    return { total, completed, active };
  };

  const getTotalApplications = (): number => {
    return applications.length;
  };

  const getApplicationsForPost = (postId: string): ApplicationResponse[] => {
    return applications.filter(app => app.application.task_id === postId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const getStatusBadge = (post: TaskResponse) => {
    if (post.completed_at) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
        Active
      </span>
    );
  };

  const stats = getPostStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Posts</h1>
          <p className="text-sm sm:text-base text-gray-700">Manage your posted opportunities</p>
        </div>


        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-700">Error</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Status & Post Limit */}
        {subscriptionStatus && (
          <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Subscription Status</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${subscriptionStatus.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {subscriptionStatus.status.charAt(0).toUpperCase() + subscriptionStatus.status.slice(1)}
                </span>
                {subscriptionStatus.plan === 'free' && (
                  <button
                    onClick={() => navigate('/subscription/upgrade')}
                    className="px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>

            {/* Plan Comparison Info */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Plan Comparison</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg border-2 ${subscriptionStatus.plan === 'free' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">Free Plan</span>
                    {subscriptionStatus.plan === 'free' && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Current</span>
                    )}
                  </div>
                  <ul className="text-xs text-gray-700 space-y-1 mb-3">
                    <li className="flex items-start">
                      <svg className="w-3 h-3 mr-1.5 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      1 post per month (free)
                    </li>
                    <li className="flex items-start">
                      <svg className="w-3 h-3 mr-1.5 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Basic support
                    </li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-gray-300 bg-green-50 rounded-md p-2">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-1.5 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800 mb-0.5">Reached your limit?</p>
                        <p className="text-sm text-green-700">Pay just <span className="font-bold">$5 per post</span> to continue posting without upgrading</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border-2 ${subscriptionStatus.plan !== 'free' ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">Premium Plan</span>
                    {subscriptionStatus.plan !== 'free' && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">Current</span>
                    )}
                  </div>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li className="flex items-start">
                      <svg className="w-3 h-3 mr-1.5 mt-0.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Unlimited posts
                    </li>
                    <li className="flex items-start">
                      <svg className="w-3 h-3 mr-1.5 mt-0.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Priority support
                    </li>
                    <li className="flex items-start">
                      <svg className="w-3 h-3 mr-1.5 mt-0.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Money back guarantee if you are not satisfied
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                <div className="text-sm text-gray-700 mb-1">Plan</div>
                <div className="text-lg font-semibold text-gray-900 capitalize">{subscriptionStatus.plan}</div>
              </div>

              <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                <div className="text-sm text-gray-700 mb-1">Posts Used This Month</div>
                <div className="text-lg font-semibold text-gray-900">
                  {subscriptionStatus.posts_used} / {subscriptionStatus.plan === "free" ? '1' : '∞'}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 sm:p-4 sm:col-span-2 lg:col-span-1 border border-gray-200">
                <div className="text-sm text-gray-700 mb-1">Remaining Posts This Month</div>
                <div className={`text-lg font-semibold ${subscriptionStatus.post_limit === -1
                  ? 'text-green-700'
                  : subscriptionStatus.post_limit - subscriptionStatus.posts_used > 0
                    ? 'text-gray-900'
                    : 'text-red-600'
                  }`}>
                  {subscriptionStatus.post_limit === -1
                    ? 'Unlimited'
                    : Math.max(0, subscriptionStatus.post_limit - subscriptionStatus.posts_used)
                  }
                </div>
              </div>
            </div>
            {/* Insert info about subscription plan and one time payment on free plan here */}
          </div>
        )}

        {/* Post Statistics */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-700">Total Posts</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completed}</div>
                <div className="text-sm text-gray-700">Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.active}</div>
                <div className="text-sm text-gray-700">Active</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {applicationsLoading ? (
                    <div className="flex items-center">
                      <div className="animate-pulse bg-purple-300 rounded h-8 w-16"></div>
                    </div>
                  ) : (
                    getTotalApplications()
                  )}
                </div>
                <div className="text-sm text-gray-700">Total Applications</div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Posts</h2>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Posts Yet</h3>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 px-4">
                You haven't created any posts yet. Create your first opportunity to get started!
              </p>
              <button
                onClick={() => setPage("createPost")}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm sm:text-base rounded-lg transition-all duration-200"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="group bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:shadow-sm transition-colors duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                    <div
                      className="flex-1 cursor-pointer min-w-0"
                      onClick={() => handlePostClick(post.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-700 transition-colors truncate">{post.title}</h3>
                          <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(post)}
                        </div>
                      </div>

                      <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 line-clamp-2">{post.description}</p>
                      <p className="text-xs text-gray-500 mb-2 sm:mb-3">Click to view details</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-600">Rate:</span>
                          <span className="text-gray-900 ml-2 font-medium">{formatCurrency(post.hourly_rate)}/hr</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="text-gray-900 ml-2 font-medium capitalize">{post.location_type === 'in_person' ? 'In Person' : 'Remote'}</span>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-900 ml-2 font-medium">{formatDate(post.created_at)}</span>
                        </div>
                      </div>

                      {post.dates && post.dates.length > 0 && (
                        <div className="mt-2 sm:mt-3">
                          <span className="text-gray-600 text-xs sm:text-sm">Dates:</span>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                            {post.dates.map((date, index) => (
                              <span key={index} className="px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs">
                                {formatDate(date)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {post.tools_info && (
                        <div className="mt-2 sm:mt-3">
                          <span className="text-gray-600 text-xs sm:text-sm">Tools Required:</span>
                          <p className="text-gray-700 text-xs sm:text-sm mt-1">{post.tools_info}</p>
                        </div>
                      )}

                      {post.public_transport_info && (
                        <div className="mt-2 sm:mt-3">
                          <span className="text-gray-600 text-xs sm:text-sm">Public Transport:</span>
                          <p className="text-gray-700 text-xs sm:text-sm mt-1">{post.public_transport_info}</p>
                        </div>
                      )}

                      {/* Applications Preview */}
                      <ApplicationsPreview
                        postId={post.id}
                        applications={applications}
                        applicationsLoading={applicationsLoading}
                        onViewAll={handlePostClick}
                      />
                    </div>

                    <div
                      className="flex flex-row lg:flex-col gap-2 lg:ml-4 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {post.completed_at ? (
                        // Show "Post Again" button for completed posts
                        <button
                          onClick={() => handlePostAgain(post)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-medium shadow-sm hover:shadow-md flex-1 sm:flex-none"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="hidden sm:inline">Post Again</span>
                          <span className="sm:hidden">Again</span>
                        </button>
                      ) : (
                        // Show "Complete" button for active posts
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleCompletePost(post.id)}
                                disabled={completingPost === post.id}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-500 disabled:to-emerald-500 text-white rounded-lg transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-medium shadow-sm hover:shadow-md flex-1 sm:flex-none"
                              >
                                {completingPost === post.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                                ) : (
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                <span className="hidden sm:inline">Job Done?</span>
                                <span className="sm:hidden">Done</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Pressing this marks the job as complete and removes it from the Helper job board.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingPost === post.id || !!post.completed_at}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-medium shadow-sm hover:shadow-md flex-1 sm:flex-none ${post.completed_at
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 hover:bg-gray-200 text-red-600 hover:text-red-700 disabled:bg-gray-100 disabled:text-red-400'
                          }`}
                        title={post.completed_at ? 'Cannot delete completed posts' : 'Delete post'}
                      >
                        {deletingPost === post.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-red-600 mr-1 sm:mr-2"></div>
                        ) : (
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPosts;
