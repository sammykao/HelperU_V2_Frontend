import { apiClient } from './client';

// Auth Types
export interface PhoneOTPRequest {
  phone: string;
}

export interface PhoneOTPVerifyRequest {
  phone: string;
  token: string;
}

export interface ClientSignupRequest {
  phone: string;
}

export interface ClientProfileUpdateRequest {
  first_name: string;
  last_name: string;
  email: string;
  pfp_url?: string;
}

export interface HelperSignupRequest {
  email: string;
  phone: string;
}

export interface HelperProfileUpdateRequest {
  first_name: string;
  last_name: string;
  college: string;
  bio: string;
  graduation_year: number;
  zip_code: string;
  pfp_url?: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
}

export interface ClientProfileResponse {
  success: boolean;
  message: string;
  user_id?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface ClientAccountExistanceResponse {
  does_exist: boolean;
}

export interface HelperAccountResponse {
  success: boolean;
  message: string;
  user_id?: string;
}

export interface HelperProfileResponse {
  success: boolean;
  message: string;
  user_id?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface ProfileStatusResponse {
  profile_completed: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  user_type: string;
  profile_type: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface CurrentUser {
  id: string;
  email?: string;
  phone?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  created_at?: string;
}

// Auth API Functions
export const authApi = {
  // Client Auth
  clientSignup: (data: ClientSignupRequest): Promise<OTPResponse> =>
    apiClient.post('/auth/client/signup', data),

  clientSignin: (data: PhoneOTPRequest): Promise<OTPResponse> =>
    apiClient.post('/auth/client/signin', data),

  clientVerifyOTP: (data: PhoneOTPVerifyRequest): Promise<ClientProfileResponse> =>
    apiClient.post('/auth/client/verify-otp', data),

  clientCompleteProfile: (data: ClientProfileUpdateRequest): Promise<ClientProfileResponse> =>
    apiClient.post('/auth/client/complete-profile', data),

  clientCheckCompletion: (): Promise<ClientAccountExistanceResponse> =>
    apiClient.get('/auth/client/check-completion'),

  // Helper Auth
  helperSignup: (data: HelperSignupRequest): Promise<HelperAccountResponse> =>
    apiClient.post('/auth/helper/signup', data),

  helperSignin: (data: PhoneOTPRequest): Promise<OTPResponse> =>
    apiClient.post('/auth/helper/signin', data),

  helperVerifyOTP: (data: PhoneOTPVerifyRequest): Promise<HelperProfileResponse> =>
    apiClient.post('/auth/helper/verify-otp', data),

  helperCompleteProfile: (data: HelperProfileUpdateRequest): Promise<HelperProfileResponse> =>
    apiClient.post('/auth/helper/complete-profile', data),

  // Profile Status
  getProfileStatus: (): Promise<ProfileStatusResponse> =>
    apiClient.get('/auth/profile-status'),

  // Logout
  logout: (): Promise<LogoutResponse> =>
    apiClient.post('/auth/logout'),

  // Email Verification
  resendEmailVerification: (email: string): Promise<OTPResponse> =>
    apiClient.post('/auth/resend-email-verification', { email }),

  verifyEmailOTP: (email: string, otp_code: string): Promise<OTPResponse> =>
    apiClient.post('/auth/verify-email-otp', { email, otp_code }),

  checkHelperEmailVerification: (user_id: string): Promise<any> =>
    apiClient.get(`/auth/helper/email-verification-status/${user_id}`),

  updateHelperEmail: (user_id: string, email: string): Promise<OTPResponse> =>
    apiClient.post('/auth/helper/update-email', { user_id, email }),

  checkHelperCompletion: (): Promise<boolean> =>
    apiClient.get('/auth/helper/check-completion'),
};
