import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ModernHelperSearch from '../../components/helpers/ModernHelperSearch';
import { useAuth } from '../../lib/contexts/AuthContext';

const SearchHelpers: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authRoute, isAuthenticated } = useAuth();
  const taskId = searchParams.get('task_id');

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // Fallback to dashboard if no history
      navigate('/dashboard');
    }
  };

  if (!isAuthenticated || authRoute !== 'client') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      <ModernHelperSearch onBack={handleBack} />
    </div>
  );
};

export default SearchHelpers;