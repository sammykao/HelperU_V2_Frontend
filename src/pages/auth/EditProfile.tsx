import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../lib/contexts/AuthContext';
import { authApi, ClientProfileUpdateRequest, HelperProfileUpdateRequest } from '../../lib/api/auth';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { authRoute, profileStatus, refreshProfileStatus } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [pfpUrl, setPfpUrl] = useState('');

  // Helper fields
  const [college, setCollege] = useState('');
  const [bio, setBio] = useState('');
  const [graduationYear, setGraduationYear] = useState<number>(new Date().getFullYear());
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    // Could preload from an endpoint if available in future
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (authRoute === 'client') {
        const payload: ClientProfileUpdateRequest = {
          first_name: firstName,
          last_name: lastName,
          email,
          pfp_url: pfpUrl || undefined,
        };
        await authApi.clientCompleteProfile(payload);
      } else if (authRoute === 'helper') {
        const payload: HelperProfileUpdateRequest = {
          first_name: firstName,
          last_name: lastName,
          college,
          bio,
          graduation_year: graduationYear,
          zip_code: zipCode,
          pfp_url: pfpUrl || undefined,
        };
        await authApi.helperCompleteProfile(payload);
      }

      await refreshProfileStatus();
      navigate('/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const heading = authRoute === 'helper' ? 'Edit Helper Profile' : 'Edit Profile';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-white mb-2">{heading}</h1>
        <p className="text-gray-300 mb-6">Update your account information.</p>

        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">First Name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Last Name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white" />
            </div>
          </div>

          {authRoute === 'client' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Profile Picture URL</label>
                <input value={pfpUrl} onChange={(e) => setPfpUrl(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white" />
              </div>
            </div>
          )}

          {authRoute === 'helper' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">College</label>
                  <input value={college} onChange={(e) => setCollege(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Graduation Year</label>
                  <input type="number" value={graduationYear} onChange={(e) => setGraduationYear(parseInt(e.target.value || String(new Date().getFullYear()), 10))} className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">ZIP Code</label>
                  <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Profile Picture URL</label>
                  <input value={pfpUrl} onChange={(e) => setPfpUrl(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white" />
              </div>
            </>
          )}

          <div className="flex items-center justify-end space-x-3">
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;


