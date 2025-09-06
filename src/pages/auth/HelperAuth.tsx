import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PhoneInput } from '../../components/auth/PhoneInput';
import { authApi, PhoneOTPRequest } from '../../lib/api/auth';
import { validatePhone } from '../../lib/utils/validation';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';

const HelperAuth: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(''); // Email state for new accounts
  const [showEmailInput, setShowEmailInput] = useState(false);
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
        await authApi.helperSignin(request);
        toast.success('OTP sent to your phone!');
        navigate('/auth/helper/verify-otp', { 
          state: { phone, isSignup: false } 
        });
      } catch (signinError: any) {
        // If signin fails, we need to collect email for signup
        if (signinError.message?.includes('not found') || signinError.message?.includes('404')) {
          setShowEmailInput(true);
          setError('Account not found. Please enter your email to create an account.');
          return;
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || !email) {
      setError('Phone number and email are required');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);

    try {
      const signupRequest = { phone, email };
      await authApi.helperSignup(signupRequest);
      toast.success('OTP sent to your phone!');
      navigate('/auth/helper/verify-otp', { 
        state: { phone, email, isSignup: true } 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      toast.error(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent mb-2">
            HelperU
          </h1>
          <h2 className="text-2xl font-semibold text-white mb-2">Join or Sign in as a Helper</h2>
          <p className="text-gray-300">Enter your phone number to continue</p>
        </div>

        {/* Form */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8">
          <form onSubmit={showEmailInput ? handleSignup : handleSubmit} className="space-y-6">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              placeholder="Enter your phone number"
              error={error}
              disabled={isLoading}
            />
            
            {showEmailInput && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !phone || (showEmailInput && !email)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending OTP...
                </div>
              ) : (
                showEmailInput ? 'Create Account' : 'Continue'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mt-2">
              Need help instead?{' '}
              <Link 
                to="/auth/client" 
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Go to Client Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperAuth;
