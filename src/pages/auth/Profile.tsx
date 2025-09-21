import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../lib/contexts/AuthContext';
import { profileApi, ClientProfileData, HelperProfileData, SubscriptionStatus } from '../../lib/api/profile';
import { FileUpload } from '../../components/ui/FileUpload';
import CollegeInput from '../../components/ui/CollegeInput';
import { authApi, ClientProfileUpdateRequest, HelperProfileUpdateRequest } from '../../lib/api/auth';

const Profile: React.FC = () => {
  const { authRoute } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ClientProfileData | HelperProfileData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await profileApi.getProfile();
        // New shape: profile is an object with optional client/helper keys
        let next: ClientProfileData | HelperProfileData | null = null;
        if (authRoute === 'client' && res.profile?.client) next = res.profile.client;
        if (authRoute === 'helper' && res.profile?.helper) next = res.profile.helper;
        setProfile(next);
        
        // Load subscription status for clients
        if (authRoute === 'client') {
          try {
            const subscriptionRes = await profileApi.getSubscriptionStatus();
            setSubscription(subscriptionRes);
          } catch (subError) {
            console.warn('Failed to load subscription status:', subError);
          }
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authRoute]);

  const handleFileSelect = (_file: File) => {
    // FileUpload component handles the file internally
  };

  const handleFileUpload = (url: string) => {
    if (profile) {
      setProfile({ ...profile, pfp_url: url });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="text-gray-300 mt-1">Manage your account information and preferences</p>
          </div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsEditing(false)} 
                className="px-6 py-3 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!profile) { setIsEditing(false); return; }
                  try {
                    setIsSaving(true);
                    if (authRoute === 'client') {
                      const payload: ClientProfileUpdateRequest = {
                        first_name: (profile as ClientProfileData).first_name || '',
                        last_name: (profile as ClientProfileData).last_name || '',
                        email: (profile as ClientProfileData).email || '',
                        pfp_url: (profile as ClientProfileData).pfp_url || undefined,
                      };
                      await authApi.clientCompleteProfile(payload);
                    } else {
                      const hp = profile as HelperProfileData;
                      const payload: HelperProfileUpdateRequest = {
                        first_name: hp.first_name || '',
                        last_name: hp.last_name || '',
                        college: hp.college || '',
                        bio: hp.bio || '',
                        graduation_year: hp.graduation_year || new Date().getFullYear(),
                        zip_code: hp.zip_code || '',
                        pfp_url: hp.pfp_url || undefined,
                      };
                      await authApi.helperCompleteProfile(payload);
                    }
                    setIsEditing(false);
                  } catch (e) {
                    setError((e as any)?.message || 'Failed to save profile');
                  } finally {
                    setIsSaving(false);
                  }
                }} 
                disabled={isSaving} 
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* AI Assistant Blurb */}
        <div className="mb-8 backdrop-blur-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Need Help Optimizing Your Profile?</h3>
              <p className="text-gray-300 text-sm mb-4">
                Our AI Assistant can help you improve your profile, suggest better descriptions, 
                optimize your bio for better visibility, and provide personalized tips to attract 
                more opportunities. Get expert advice to make your profile stand out.
              </p>
              <button
                onClick={() => navigate('/ai-assistant')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 flex items-center text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Try AI Assistant
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Information for Clients */}
        {authRoute === 'client' && subscription && (
          <div className="mb-8 backdrop-blur-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Subscription Plan</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 text-sm">Plan:</span>
                      <span className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded-md text-sm font-medium capitalize">
                        {subscription.plan}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 text-sm">Status:</span>
                      <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                        subscription.status === 'active' 
                          ? 'bg-green-500/30 text-green-200' 
                          : 'bg-yellow-500/30 text-yellow-200'
                      }`}>
                        {subscription.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 text-sm">Posts:</span>
                      <span className="text-white text-sm">
                        {subscription.posts_used} / {subscription.post_limit === -1 ? '∞' : subscription.post_limit} this month
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => navigate('/subscription/upgrade')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-200 flex items-center text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Manage Subscription
                </button>
                {subscription.post_limit !== -1 && subscription.posts_used >= subscription.post_limit && (
                  <span className="text-red-300 text-xs text-center">
                    Post limit reached
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        ) : !profile ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Profile Found</h3>
            <p className="text-gray-300">Please complete your profile first.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Header with Picture */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  {profile.pfp_url ? (
                    <img 
                      src={profile.pfp_url} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl" 
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white/20 shadow-2xl">
                      <span className="text-4xl text-white">👤</span>
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <FileUpload
                        onFileSelect={handleFileSelect}
                        onUpload={handleFileUpload}
                        currentUrl={profile.pfp_url || ''}
                        accept="image/*"
                        maxSize={5}
                        disabled={false}
                        variant="icon"
                      />
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-gray-300 mb-4">
                  Your Account
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  {profile.created_at && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Member since {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  )}
                  {profile.updated_at && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Updated {new Date(profile.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* Profile Details */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white border-b border-white/20 pb-2">Contact Information</h4>
                  
                  {'email' in profile && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                      <div className="flex items-center space-x-2">
                        <p className="text-white">{profile.email || 'Not provided'}</p>
                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">Read-only</span>
                      </div>
                    </div>
                  )}
                  
                  {'phone' in profile && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                      <div className="flex items-center space-x-2">
                        <p className="text-white">{profile.phone || 'Not provided'}</p>
                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">Read-only</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white border-b border-white/20 pb-2">Personal Information</h4>
                  
                  {!isEditing ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                      <p className="text-white">{profile.first_name || 'Not provided'}</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                      <input 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        value={profile.first_name || ''} 
                        onChange={(e) => setProfile({ ...(profile as ClientProfileData & HelperProfileData), first_name: e.target.value })}
                        placeholder="Enter your first name"
                      />
                    </div>
                  )}
                  
                  {!isEditing ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                      <p className="text-white">{profile.last_name || 'Not provided'}</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                      <input 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        value={profile.last_name || ''} 
                        onChange={(e) => setProfile({ ...(profile as ClientProfileData & HelperProfileData), last_name: e.target.value })}
                        placeholder="Enter your last name"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Helper-specific fields */}
              {'college' in profile && (
                <div className="mt-8">
                  <h4 className="text-lg font-medium text-white border-b border-white/20 pb-2 mb-4">Helper Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!isEditing ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">College</label>
                        <p className="text-white">{(profile as HelperProfileData).college || 'Not provided'}</p>
                      </div>
                    ) : (
                      <div>
                        <CollegeInput
                          value={(profile as HelperProfileData).college || ''}
                          onChange={(value) => setProfile({ ...(profile as HelperProfileData), college: value })}
                          placeholder="Search for your college..."
                        />
                      </div>
                    )}
                    
                    {!isEditing ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Graduation Year</label>
                        <p className="text-white">{(profile as HelperProfileData).graduation_year || 'Not provided'}</p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Graduation Year</label>
                        <input 
                          type="number" 
                          className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                          value={(profile as HelperProfileData).graduation_year || new Date().getFullYear()} 
                          onChange={(e) => setProfile({ ...(profile as HelperProfileData), graduation_year: parseInt(e.target.value || String(new Date().getFullYear()), 10) })}
                          placeholder="2024"
                        />
                      </div>
                    )}
                    
                    {!isEditing ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">ZIP Code</label>
                        <p className="text-white">{(profile as HelperProfileData).zip_code || 'Not provided'}</p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">ZIP Code</label>
                        <input 
                          className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                          value={(profile as HelperProfileData).zip_code || ''} 
                          onChange={(e) => setProfile({ ...(profile as HelperProfileData), zip_code: e.target.value })}
                          placeholder="12345"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Applications Submitted</label>
                      <p className="text-white">{(profile as HelperProfileData).number_of_applications || 0}</p>
                    </div>
                  </div>
                  
                  {!isEditing ? (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                      <p className="text-white whitespace-pre-wrap">{(profile as HelperProfileData).bio || 'Not provided'}</p>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                      <textarea 
                        rows={4} 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        value={(profile as HelperProfileData).bio || ''} 
                        onChange={(e) => setProfile({ ...(profile as HelperProfileData), bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Client-specific fields */}
              {'number_of_posts' in profile && (
                <div className="mt-8">
                  <h4 className="text-lg font-medium text-white border-b border-white/20 pb-2 mb-4">Your Stats</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Posts Created</label>
                    <p className="text-white">{(profile as ClientProfileData).number_of_posts || 0}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;


