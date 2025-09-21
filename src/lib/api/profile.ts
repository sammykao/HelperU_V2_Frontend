import { apiClient } from './client';

export interface ProfileStatus {
  profile_completed: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  user_type: 'client' | 'helper' | string;
}

export interface ClientProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  pfp_url?: string;
  number_of_posts?: number;
  created_at?: string;
  updated_at?: string;
}

export interface HelperProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  college?: string;
  bio?: string;
  graduation_year?: number;
  zip_code?: string;
  pfp_url?: string;
  number_of_applications?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionStatus {
  plan: string;
  status: string;
  post_limit: number;
  posts_used: number;
}

export interface GetSubscriptionResponse {
  success: boolean;
  plan: string;
  status: string;
  post_limit: number;
  posts_used: number;
}

export interface GetProfileResponse {
  success: boolean;
  profile_status: ProfileStatus;
  profile: { client?: ClientProfileData; helper?: HelperProfileData } | null;
}

export const profileApi = {
  getProfile: (): Promise<GetProfileResponse> => apiClient.get('/profile/'),
  getSubscriptionStatus: (): Promise<SubscriptionStatus> => apiClient.get('/subscriptions/status'),
};


