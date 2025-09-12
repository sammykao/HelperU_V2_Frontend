import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { taskApi, TaskResponse } from '../../lib/api/tasks';
import { subscriptionApi, SubscriptionStatus } from '../../lib/api/subscriptions';

interface PostStats {
  total: number;
  completed: number;
  active: number;
}

const MyPosts: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<TaskResponse[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingPost, setCompletingPost] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsResponse, subscriptionResponse] = await Promise.all([
        taskApi.getMyTasks(50, 0),
        subscriptionApi.getStatus()
      ]);
      
      setPosts(postsResponse.tasks);
      setSubscriptionStatus(subscriptionResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePost = async (postId: string) => {
    try {
      setCompletingPost(postId);
      await taskApi.completeTask(postId);
      await loadData(); // Reload to get updated data
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
      await loadData(); // Reload to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setDeletingPost(null);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
          <h1 className="text-3xl font-bold text-white mb-2">My Posts</h1>
          <p className="text-gray-300">Manage your posted opportunities</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-400">Error</h3>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Status & Post Limit */}
        {subscriptionStatus && (
          <div className="mb-8 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <h2 className="text-xl font-semibold text-white">Subscription Status</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscriptionStatus.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {subscriptionStatus.status.charAt(0).toUpperCase() + subscriptionStatus.status.slice(1)}
                </span>
                {subscriptionStatus.plan === 'free' && (
                  <button
                    onClick={() => navigate('/subscription/upgrade')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                <div className="text-sm text-gray-300 mb-1">Plan</div>
                <div className="text-lg font-semibold text-white capitalize">{subscriptionStatus.plan}</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                <div className="text-sm text-gray-300 mb-1">Posts Used This Month</div>
                <div className="text-lg font-semibold text-white">
                  {subscriptionStatus.posts_used} / {subscriptionStatus.plan === "free" ? '1' : '∞'}
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
                <div className="text-sm text-gray-300 mb-1">Remaining Posts This Month</div>
                <div className={`text-lg font-semibold ${
                  subscriptionStatus.post_limit === -1 
                    ? 'text-green-400' 
                    : subscriptionStatus.post_limit - subscriptionStatus.posts_used > 0 
                      ? 'text-white' 
                      : 'text-red-400'
                }`}>
                  {subscriptionStatus.post_limit === -1 
                    ? 'Unlimited' 
                    : Math.max(0, subscriptionStatus.post_limit - subscriptionStatus.posts_used)
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Post Statistics */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-gray-300">Total Posts</div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">{stats.completed}</div>
                <div className="text-sm text-gray-300">Completed</div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">{stats.active}</div>
                <div className="text-sm text-gray-300">Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
            <h2 className="text-xl font-semibold text-white">Your Posts</h2>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center self-start sm:self-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Posts Yet</h3>
            <p className="text-gray-300 mb-6">
                You haven't created any posts yet. Create your first opportunity to get started!
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-200">
                Create Your First Post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="group bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-colors duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handlePostClick(post.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white hover:text-blue-300 transition-colors">{post.title}</h3>
                          <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        {getStatusBadge(post)}
                      </div>
                      
                      <p className="text-gray-300 mb-4 line-clamp-2">{post.description}</p>
                      <p className="text-xs text-gray-500 mb-2">Click to view details</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Rate:</span>
                          <span className="text-white ml-2 font-medium">{formatCurrency(post.hourly_rate)}/hr</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Location:</span>
                          <span className="text-white ml-2 font-medium capitalize">{post.location_type}</span>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1">
                          <span className="text-gray-400">Created:</span>
                          <span className="text-white ml-2 font-medium">{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                      
                      {post.dates && post.dates.length > 0 && (
                        <div className="mt-3">
                          <span className="text-gray-400 text-sm">Dates:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {post.dates.map((date, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                {formatDate(date)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {post.tools_info && (
                        <div className="mt-3">
                          <span className="text-gray-400 text-sm">Tools Required:</span>
                          <p className="text-gray-300 text-sm mt-1">{post.tools_info}</p>
                        </div>
                      )}
                      
                      {post.public_transport_info && (
                        <div className="mt-3">
                          <span className="text-gray-400 text-sm">Public Transport:</span>
                          <p className="text-gray-300 text-sm mt-1">{post.public_transport_info}</p>
                        </div>
                      )}
                    </div>
                    
                    <div 
                      className="flex flex-row lg:flex-col gap-2 lg:ml-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!post.completed_at && (
                        <button
                          onClick={() => handleCompletePost(post.id)}
                          disabled={completingPost === post.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors duration-200 flex items-center text-sm"
                        >
                          {completingPost === post.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          Complete
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingPost === post.id || !!post.completed_at}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center text-sm ${
                          post.completed_at 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white'
                        }`}
                        title={post.completed_at ? 'Cannot delete completed posts' : 'Delete post'}
                      >
                        {deletingPost === post.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        Delete
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
