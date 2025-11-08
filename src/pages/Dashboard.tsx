import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import ClientDashboard from './dashboards/ClientDashboard';
import HelperDashboard from './dashboards/HelperDashboard';
import { profileApi, ClientProfileData, HelperProfileData } from '@/lib/api/profile';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { authRoute, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ClientProfileData | HelperProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileApi.getProfile();
        // New shape: profile is an object with optional client/helper keys
        let next: ClientProfileData | HelperProfileData | null = null;
        if (authRoute === 'client' && res.profile?.client) next = res.profile.client;
        if (authRoute === 'helper' && res.profile?.helper) next = res.profile.helper;
        setProfile(next);
      } catch (error) {
        toast.error((error as Error).message || 'Error fetching profile information');
      } finally {
        setLoading(false)
      }
    }

    fetchProfile();
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please sign in to access your dashboard</h1>
          <a href="/auth/client" className="text-blue-400 hover:text-blue-300">Sign In</a>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on auth route
  if (authRoute === 'client') {
    return (
      <ClientDashboard isLoading={loading} profile={profile as ClientProfileData} />
    );
  } else if (authRoute === 'helper') {
    return (
      <HelperDashboard isLoading={loading} profile={profile as HelperProfileData} />
    );
  }

  // Fallback for unknown auth route
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Unable to determine user type</h1>
        <p className="text-gray-300">Please sign in again</p>
      </div>
    </div>
  );
};

export default Dashboard;
