import React from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import ClientDashboard from './dashboards/ClientDashboard';
import HelperDashboard from './dashboards/HelperDashboard';

const Dashboard: React.FC = () => {
  const { authRoute, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please sign in to access your dashboard</h1>
          <a href="/auth/client" className="text-blue-400 hover:text-blue-300">Sign In</a>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on auth route
  if (authRoute === 'client') {
    return <ClientDashboard />;
  } else if (authRoute === 'helper') {
    return <HelperDashboard />;
  }

  // Fallback for unknown auth route
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Unable to determine user type</h1>
        <p className="text-gray-300">Please sign in again</p>
      </div>
    </div>
  );
};

export default Dashboard;
