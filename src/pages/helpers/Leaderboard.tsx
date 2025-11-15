import { useState, useEffect } from 'react';
import { helperApi } from '../../lib/api/helpers';
import { taskApi } from '../../lib/api/tasks';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Trophy, Award, Medal, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  count: number;
  pfp_url?: string;
  college?: string;
  graduation_year?: number;
}

interface ClientLeaderboardEntry {
  id: string;
  name: string;
  number_of_posts: number;
  pfp_url?: string;
}

function Leaderboard() {
  const { authRoute, isAuthenticated } = useAuth();
  const [helperLeaderboard, setHelperLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [clientLeaderboard, setClientLeaderboard] = useState<ClientLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || authRoute !== 'helper') {
      return;
    }

    const loadLeaderboards = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all helpers to build application leaderboard
        const helpersResponse = await helperApi.getHelpers(1000, 0);
        const helpersWithApps = helpersResponse.helpers
          .filter(h => h.number_of_applications !== undefined && h.number_of_applications > 0)
          .map(h => ({
            id: h.id,
            name: `${h.first_name} ${h.last_name}`,
            count: h.number_of_applications || 0,
            pfp_url: h.pfp_url,
            college: h.college,
            graduation_year: h.graduation_year,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 50); // Top 50

        setHelperLeaderboard(helpersWithApps);

        // Fetch tasks to build client post leaderboard
        // Use number_of_posts directly from client data
        const tasksResponse = await taskApi.getTasks({
          search_zip_code: '00000', // Dummy zip to get all tasks
          search_limit: 1000,
          search_offset: 0,
          sort_by: 'post_date',
        });

        // Collect unique clients with their number_of_posts
        const clientPostMap = new Map<string, ClientLeaderboardEntry>();

        tasksResponse.tasks.forEach(task => {
          if (task.client && task.client.number_of_posts !== undefined) {
            const clientId = task.client.id;
            if (!clientPostMap.has(clientId)) {
              clientPostMap.set(clientId, {
                id: clientId,
                name: `${task.client.first_name} ${task.client.last_name}`,
                number_of_posts: task.client.number_of_posts,
                pfp_url: task.client.pfp_url,
              });
            }
          }
        });

        const clientsWithPosts = Array.from(clientPostMap.values())
          .filter(client => client.number_of_posts > 0) // Only show clients with posts
          .sort((a, b) => b.number_of_posts - a.number_of_posts)
          .slice(0, 50); // Top 50

        setClientLeaderboard(clientsWithPosts);
      } catch (err: any) {
        console.error('Failed to load leaderboards:', err);
        setError(err.message || 'Failed to load leaderboards');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboards();
  }, [isAuthenticated, authRoute]);

  if (!isAuthenticated || authRoute !== 'helper') {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be logged in as a helper to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    } else if (rank === 2) {
      return <Award className="w-5 h-5 text-gray-400" />;
    } else if (rank === 3) {
      return <Medal className="w-5 h-5 text-amber-600" />;
    }
    return <span className="text-gray-500 font-semibold text-sm w-5 h-5 flex items-center justify-center">{rank}</span>;
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Leaderboards
          </h1>
          <p className="text-gray-600">
            See who's leading the way with the most applications and task posts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Helper Applications Leaderboard */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Top Helpers by Applications
              </h2>
              <p className="text-blue-100 text-sm mt-1">Most applications submitted</p>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {helperLeaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No helpers with applications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {helperLeaderboard.map((helper, index) => {
                    const rank = index + 1;
                    return (
                      <div
                        key={helper.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md ${getRankBgColor(rank)}`}
                      >
                        <div className="flex-shrink-0 w-8 flex items-center justify-center">
                          {getRankIcon(rank)}
                        </div>
                        {helper.pfp_url ? (
                          <img
                            src={helper.pfp_url}
                            alt={helper.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {helper.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {helper.name}
                          </h3>
                          {helper.college && (
                            <p className="text-xs text-gray-600 truncate">{helper.college}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {helper.count}
                          </div>
                          <div className="text-xs text-gray-500">
                            {helper.count === 1 ? 'app' : 'apps'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Client Posts Leaderboard */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-6 h-6" />
                Top Clients by Task Posts
              </h2>
              <p className="text-green-100 text-sm mt-1">Most tasks posted</p>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {clientLeaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No clients with posts yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientLeaderboard.map((client, index) => {
                    const rank = index + 1;
                    return (
                      <div
                        key={client.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md ${getRankBgColor(rank)}`}
                      >
                        <div className="flex-shrink-0 w-8 flex items-center justify-center">
                          {getRankIcon(rank)}
                        </div>
                        {client.pfp_url ? (
                          <img
                            src={client.pfp_url}
                            alt={client.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {client.name}
                          </h3>
                        </div>
                         <div className="flex-shrink-0 text-right">
                           <div className="text-lg font-bold text-green-600">
                             {client.number_of_posts}
                           </div>
                           <div className="text-xs text-gray-500">
                             {client.number_of_posts === 1 ? 'post' : 'posts'}
                           </div>
                         </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;

