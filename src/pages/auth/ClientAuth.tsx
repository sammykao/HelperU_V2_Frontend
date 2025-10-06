import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PhoneInput } from '../../components/auth/PhoneInput';
import { authApi, PhoneOTPRequest } from '../../lib/api/auth';
import { validatePhone } from '../../lib/utils/validation';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';

const ClientAuth: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError('Phone number is required');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);

    try {
      const request: PhoneOTPRequest = { phone };
      
      // Try to sign in first (check if account exists)
      try {
        await authApi.clientSignin(request);
        toast.success('OTP sent to your phone!');
        navigate('/auth/client/verify-otp', { 
          state: { phone, isSignup: false } 
        });
      } catch (signinError: any) {
        // If signin fails, try signup (account doesn't exist)
        if (signinError.message?.includes('not found') || signinError.message?.includes('404')) {
          await authApi.clientSignup(request);
          toast.success('OTP sent to your phone!');
          navigate('/auth/client/verify-otp', { 
            state: { phone, isSignup: true } 
          });
        } else {
          throw signinError;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center px-4">
      {/* Background Effects (subtle) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/40 rounded-full mix-blend-multiply blur-2xl opacity-70 animate-pulse-blue"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/40 rounded-full mix-blend-multiply blur-2xl opacity-70 animate-pulse-blue animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent drop-shadow-md mb-2">
            HelperU
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Join or Sign in as a Client</h2>
          <p className="text-gray-600">Enter your phone number to continue</p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              placeholder="Enter your phone number"
              error={error}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !phone}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending OTP...
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm mt-2">
              Want to help as a student?{' '}
              <Link 
                to="/auth/helper" 
                className="text-blue-700 hover:text-blue-800 transition-colors"
              >
                Go to Helper Sign in
              </Link>
            </p>
            <p className="text-gray-400 text-xs mt-2">By continuing, you agree to our <Link to="/terms-of-use" className="text-gray-400 hover:text-cyan-300 transition-colors">Terms of Service</Link> and <Link to="/privacy-policy" className="text-gray-400 hover:text-cyan-300 transition-colors">Privacy Policy</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAuth;
