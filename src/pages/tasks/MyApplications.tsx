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
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
    }`}
  >
    {children}
  </button>
);

const TaskCard: React.FC<{ task: TaskResponse; subtitle?: string }> = ({ task, subtitle }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/tasks/browse/${task.id}`)}
      className="w-full text-left bg-white/10 border border-white/10 hover:border-white/20 hover:bg-white/15 rounded-xl p-4 flex items-start gap-4 transition"
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
        {task.title.slice(0, 1).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-white font-semibold line-clamp-1">{task.title}</p>
            {subtitle && <p className="text-xs text-gray-300 mt-0.5">{subtitle}</p>}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-cyan-300 font-semibold">${task.hourly_rate}/hr</p>
            <p className="text-xs text-gray-300">{task.location_type}</p>
          </div>
        </div>
        <p className="text-gray-200 mt-2 line-clamp-2">{task.description}</p>
        {task.zip_code && (
          <p className="text-xs text-gray-400 mt-2">ZIP: {task.zip_code}</p>
        )}
      </div>
    </button>
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
    const title = tab === 'applications' ? 'No applications yet' : 'No invitations yet';
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
      </div>
    );
  }, [tab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{isHelper ? 'My Applications' : 'Applications on My Posts'}</h1>
            <p className="text-gray-300">{isHelper ? 'Track your applications and invitations' : 'Review applications from helpers'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="bg-white/5 p-1 rounded-xl border border-white/10 inline-flex">
            <TabButton active={tab === 'applications'} onClick={() => { setTab('applications'); if (apps === null) loadData('applications'); }}>Applications</TabButton>
            <TabButton active={tab === 'invitations'} onClick={() => { setTab('invitations'); if (invites === null) loadData('invitations'); }}>Invitations</TabButton>
          </div>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="animate-pulse space-y-3">
              <div className="h-20 bg-white/10 rounded-xl" />
              <div className="h-20 bg-white/10 rounded-xl" />
              <div className="h-20 bg-white/10 rounded-xl" />
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl p-4">{error}</div>
          )}

          {!loading && !error && tab === 'applications' && (
            apps && apps.length > 0 ? (
              apps.map((a) => {
                const task = taskMap[a.application.task_id];
                if (!task) return null;
                return (
                  <TaskCard key={a.application.id} task={task} subtitle={`Applied on ${new Date(a.application.created_at).toLocaleDateString()}`} />
                );
              })
            ) : (
              emptyState
            )
          )}

          {!loading && !error && tab === 'invitations' && (
            invites && invites.length > 0 ? (
              invites.map((i) => {
                const task = taskMap[i.task_id];
                if (!task) return null;
                return (
                  <TaskCard key={i.id} task={task} subtitle={`Invited on ${new Date(i.created_at).toLocaleDateString()}`} />
                );
              })
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
