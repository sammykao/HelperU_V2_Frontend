import React, { useEffect, useState, useRef } from 'react';
//
import Navbar from '../../components/Navbar';
import { useAuth } from '../../lib/contexts/AuthContext';
import { profileApi, ClientProfileData, HelperProfileData } from '../../lib/api/profile';
import { authApi, ClientProfileUpdateRequest, HelperProfileUpdateRequest } from '../../lib/api/auth';

const Profile: React.FC = () => {
  const { authRoute } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ClientProfileData | HelperProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      } catch (e: any) {
        setError(e?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authRoute]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);

      // Convert to base64 for now (in production, you'd upload to a service like Cloudinary)
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (profile) {
          setProfile({ ...profile, pfp_url: result });
        }
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      setError(e?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
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
                    <button
                      onClick={triggerImageUpload}
                      disabled={uploadingImage}
                      className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition-colors disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
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

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

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
                        <label className="block text-sm font-medium text-gray-300 mb-1">College</label>
                        <input 
                          className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                          value={(profile as HelperProfileData).college || ''} 
                          onChange={(e) => setProfile({ ...(profile as HelperProfileData), college: e.target.value })}
                          placeholder="Enter your college"
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


