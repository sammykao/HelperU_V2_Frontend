import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OTPInput } from '../../components/auth/OTPInput';
import { authApi, PhoneOTPVerifyRequest } from '../../lib/api/auth';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';

const HelperVerifyOTP: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const phone = location.state?.phone;

  useEffect(() => {
    if (!phone) {
      navigate('/auth/helper');
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
      const response = await authApi.helperVerifyOTP(request);
      
      if (response.success && response.access_token) {
        login(response.access_token, { id: response.user_id || '' } as any);
        toast.success('Successfully signed in!');
        
        // Check profile status to determine next step
        try {
          const profileStatus = await authApi.getProfileStatus();
          // If email verified AND profile complete -> dashboard
          if (!profileStatus.email_verified) {
            // Check email verification status
            try {
              navigate('/auth/helper/verify-email', { 
                state: { 
                  user_id: response.user_id 
                } 
              });
            } catch (emailError) {
              navigate('/auth/helper/verify-email', { 
                state: { 
                  user_id: response.user_id 
                }
              });
            }
          } else {
            const isHelperCompleted = await authApi.checkHelperCompletion();
            if (isHelperCompleted) {
              navigate('/dashboard');
            } else {
              navigate('/auth/helper/complete-profile');
            }
          }
        } catch (profileError) {
          // If we can't check profile status, go to email verification
          navigate('/auth/helper/verify-email', { 
            state: { 
              user_id: response.user_id 
            } 
          });
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
      await authApi.helperSignin({ phone });
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
          <h2 className="text-2xl font-semibold text-white mb-2">Verify Your Phone</h2>
          <p className="text-gray-300">
            Enter the 6-digit code sent to<br />
            <span className="text-blue-400 font-medium">{phone}</span>
          </p>
        </div>

        {/* Form */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8">
          <div className="space-y-6">
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
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth/helper/signin')}
              className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperVerifyOTP;
