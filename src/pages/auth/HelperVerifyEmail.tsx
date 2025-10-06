import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OTPInput } from '../../components/auth/OTPInput';
import { authApi } from '../../lib/api/auth';
import { validateEmail } from '../../lib/utils/validation';
import toast from 'react-hot-toast';

const HelperVerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showEmailInput, setShowEmailInput] = useState(true);

  const user_id = location.state?.user_id;

  useEffect(() => {
    if (!user_id) {
      navigate('/auth/helper/signup');
    }
  }, [user_id, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateEduEmail = (email: string): boolean => {
    if (!validateEmail(email)) {
      return false;
    }
    return email.toLowerCase().endsWith('.edu');
  };

  const handleSendEmail = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEduEmail(email)) {
      setError('Please enter a valid .edu email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.updateHelperEmail(user_id, email);
      toast.success('OTP sent to your email!');
      setShowEmailInput(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPComplete = async (otpValue: string) => {
    setOtp(otpValue);
    setError('');

    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.verifyEmailOTP(email, otpValue);
      toast.success('Email verified successfully!');
      navigate('/auth/helper/complete-profile');
      return;
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    if (!validateEduEmail(email)) {
      setError('Please enter a valid .edu email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.resendEmailVerification(email);
      setResendCooldown(60);
      toast.success('OTP resent!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
      toast.error(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user_id) {
    return null;
  }

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
          <h2 className="text-2xl font-semibold text-white mb-2">
            {showEmailInput ? 'Enter Your Educational Email' : 'Verify Your Email'}
          </h2>
          <p className="text-gray-300">
            {showEmailInput ? (
              'Please enter your .edu email address to receive a verification code'
            ) : (
              <>
                Enter the 6-digit code sent to<br />
                <span className="text-blue-400 font-medium">{email}</span>
              </>
            )}
          </p>
        </div>

        {/* Form */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8">
          <div className="space-y-6">
            {showEmailInput ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Educational Email Address (.edu)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your .edu email address"
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                </div>

                <button
                  onClick={handleSendEmail}
                  disabled={isLoading || !email}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </>
            ) : (
              <>
                <OTPInput
                  onComplete={handleOTPComplete}
                  disabled={isLoading}
                  error={error}
                />

                <div className="text-center">
                  <p className="text-gray-300 mb-4">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={handleResendOTP}
                    disabled={isLoading || resendCooldown > 0}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 
                      ? `Resend in ${resendCooldown}s` 
                      : 'Resend OTP'
                    }
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth/helper')}
              className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
            >
              ← Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperVerifyEmail;
