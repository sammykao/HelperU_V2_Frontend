import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './lib/contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import Dashboard from './pages/Dashboard';

// Task Pages
import BrowseTasks from './pages/tasks/BrowseTasks';
import CreateTask from './pages/tasks/CreateTask';

// Auth Pages
import ClientAuth from './pages/auth/ClientAuth';
import ClientVerifyOTP from './pages/auth/ClientVerifyOTP';
import ClientCompleteProfile from './pages/auth/ClientCompleteProfile';
import HelperAuth from './pages/auth/HelperAuth';
import HelperVerifyOTP from './pages/auth/HelperVerifyOTP';
import HelperVerifyEmail from './pages/auth/HelperVerifyEmail';
import HelperCompleteProfile from './pages/auth/HelperCompleteProfile';

/* removes print statements in production */
import "../print.config.ts";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* Auth Routes */}
          <Route path="/auth/client" element={<ClientAuth />} />
          <Route path="/auth/client/verify-otp" element={<ClientVerifyOTP />} />
          <Route path="/auth/client/complete-profile" element={<ClientCompleteProfile />} />
          
          <Route path="/auth/helper" element={<HelperAuth />} />
          <Route path="/auth/helper/verify-otp" element={<HelperVerifyOTP />} />
          <Route path="/auth/helper/verify-email" element={<HelperVerifyEmail />} />
          <Route path="/auth/helper/complete-profile" element={<HelperCompleteProfile />} />
          
          {/* Task Routes */}
          <Route path="/tasks/browse" element={<BrowseTasks />} />
          <Route path="/tasks/create" element={<CreateTask />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
