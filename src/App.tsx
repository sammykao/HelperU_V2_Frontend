import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './lib/contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import AIAssistantPage from './pages/AIAssistantPage';
import ChatPage from './pages/ChatPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';

// Task Pages
import BrowseTasks from './pages/tasks/BrowseTasks';
import CreateTask from './pages/tasks/CreateTask';
import EditTask from './pages/tasks/EditTask';
import MyPosts from './pages/tasks/MyPosts';
import MyApplications from './pages/tasks/MyApplications';
import SingleTask from './pages/tasks/SingleTask';

// Helper Pages
import SearchHelpers from './pages/helpers/SearchHelpers';

// Subscription Pages
import SubscriptionUpgrade from './pages/subscriptions/SubscriptionUpgrade';
import SubscriptionSuccess from './pages/subscriptions/SubscriptionSuccess';

// Auth Pages
import ClientAuth from './pages/auth/ClientAuth';
import ClientVerifyOTP from './pages/auth/ClientVerifyOTP';
import ClientCompleteProfile from './pages/auth/ClientCompleteProfile';
import HelperAuth from './pages/auth/HelperAuth';
import HelperVerifyOTP from './pages/auth/HelperVerifyOTP';
import HelperVerifyEmail from './pages/auth/HelperVerifyEmail';
import HelperCompleteProfile from './pages/auth/HelperCompleteProfile';
import Profile from './pages/auth/Profile';

/* removes print statements in production */
import "../print.config.ts";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-use" element={<TermsOfUsePage />} />
          
          {/* Auth Routes */}
          <Route path="/auth/client" element={<ClientAuth />} />
          <Route path="/auth/client/verify-otp" element={<ClientVerifyOTP />} />
          <Route path="/auth/client/complete-profile" element={<ClientCompleteProfile />} />
          
          <Route path="/auth/helper" element={<HelperAuth />} />
          <Route path="/become-helper" element={<HelperAuth />} />
          <Route path="/auth/helper/verify-otp" element={<HelperVerifyOTP />} />
          <Route path="/auth/helper/verify-email" element={<HelperVerifyEmail />} />
          <Route path="/auth/helper/complete-profile" element={<HelperCompleteProfile />} />

          {/* Task Routes */}
          <Route path="/tasks/browse/:id" element={<SingleTask />} />
          
          {/* General Protected Routes (Any authenticated user) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/ai-assistant" element={
            <ProtectedRoute>
              <AIAssistantPage />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/tasks/browse" element={
            <ProtectedRoute>
              <BrowseTasks />
            </ProtectedRoute>
          } />
          
          
          {/* Client-Only Routes */}
          <Route path="/tasks/create" element={
            <ProtectedRoute requiredRole="client">
              <CreateTask />
            </ProtectedRoute>
          } />
          <Route path="/tasks/edit/:id" element={
            <ProtectedRoute requiredRole="client">
              <EditTask />
            </ProtectedRoute>
          } />
          <Route path="/tasks/my-posts" element={
            <ProtectedRoute requiredRole="client">
              <MyPosts />
            </ProtectedRoute>
          } />
          <Route path="/subscription/upgrade" element={
            <ProtectedRoute requiredRole="client">
              <SubscriptionUpgrade />
            </ProtectedRoute>
          } />
          <Route path="/subscription/success" element={
            <ProtectedRoute requiredRole="client">
              <SubscriptionSuccess />
            </ProtectedRoute>
          } />
          <Route path="/helpers/search" element={
            <ProtectedRoute requiredRole="client">
              <SearchHelpers />
            </ProtectedRoute>
          } />
          
          {/* Helper-Only Routes */}
          <Route path="/applications" element={
            <ProtectedRoute requiredRole="helper">
              <MyApplications />
            </ProtectedRoute>
          } />
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