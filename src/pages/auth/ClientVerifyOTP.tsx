import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OTPInput } from '../../components/auth/OTPInput';
import { authApi, PhoneOTPVerifyRequest } from '../../lib/api/auth';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';

const ClientVerifyOTP: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, setAuthRoute } = useAuth();
  const [, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const phone = location.state?.phone;
  const isSignup = location.state?.isSignup;

  useEffect(() => {
    if (!phone) {
      navigate('/auth/client');
    }
  }, [phone, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOTPComplete = async (otpValue: string) => {
    setOtp(otpValue);
    setError('');

    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const request: PhoneOTPVerifyRequest = { phone, token: otpValue };
      const response = await authApi.clientVerifyOTP(request);

      if (response.success && response.access_token) {
        login(response.access_token, { id: response.user_id || '' } as any, null, response.refresh_token);
        toast.success(isSignup ? 'Successfully verified!' : 'Successfully signed in!');

        // Check profile status to determine next step
        try {
          const isClientCompleted = await authApi.clientCheckCompletion();
          if (isClientCompleted.does_exist) {
            // Profile already exists, set auth route immediately
            setAuthRoute('client');
            navigate('/dashboard?page=createPost');
          } else {
            // Profile doesn't exist, go to profile completion
            navigate('/auth/client/complete-profile');
          }
        } catch (clientError) {
          // If we can't check client status, go to profile completion
          navigate('/auth/client/complete-profile');
        }

      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError('');

    try {
      if (isSignup) {
        await authApi.clientSignup({ phone });
      } else {
        await authApi.clientSignin({ phone });
      }

      setResendCooldown(60);
      toast.success('OTP resent!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
      toast.error(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (!phone) {
    return null;
  }

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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verify Your Phone</h2>
          <p className="text-gray-600">
            Enter the 6-digit code sent to<br />
            <span className="text-blue-700 font-medium">{phone}</span>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="space-y-6">
            <OTPInput
              onComplete={handleOTPComplete}
              disabled={isLoading}
              error={error}
            />

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendOTP}
                disabled={isLoading || resendCooldown > 0}
                className="text-blue-700 hover:text-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend OTP'
                }
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-700 transition-colors text-sm"
            >
              ← Back to {isSignup ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientVerifyOTP;
