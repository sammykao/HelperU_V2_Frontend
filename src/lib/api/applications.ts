import { apiClient } from './client';

// Application Types
export interface ApplicationInfo {
  id: string;
  task_id: string;
  helper_id: string;
  introduction_message: string;
  supplements_url?: string;
  created_at: string;
  updated_at: string;
}

export interface HelperResponse {
  id: string;
  first_name: string;
  last_name: string;
  college: string;
  bio: string;
  graduation_year: number;
  zip_code: string;
  pfp_url?: string;
  phone?: string;
  email?: string;
  email_verified: boolean;
  phone_verified: boolean;
}

export interface ApplicationResponse {
  application: ApplicationInfo;
  helper: HelperResponse;
}

export interface ApplicationListResponse {
  applications: ApplicationResponse[];
  total_count: number;
}

export interface ApplicationCreateRequest {
  task_id: string;
  helper_id: string;
  introduction_message: string;
  supplements_url?: string;
}

export interface ApplicationCreateData {
  introduction_message: string;
  supplements_url?: string;
}

export interface InvitationResponse {
  id: string;
  task_id: string;
  helper_id: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  helpers?: HelperResponse;
}

export interface InvitationListResponse {
  invitations: InvitationResponse[];
  total_count: number;
}

// Application API Functions
export const applicationApi = {
  // Get applications by task
  getApplicationsByTask: (taskId: string): Promise<ApplicationListResponse> =>
    apiClient.get(`/applications/task/${taskId}`),

  // Get applications by client
  getApplicationsByClient: (limit = 20, offset = 0): Promise<ApplicationListResponse> =>
    apiClient.get(`/applications/client?limit=${limit}&offset=${offset}`),

  // Get applications by helper
  getApplicationsByHelper: (): Promise<ApplicationListResponse> =>
    apiClient.get('/applications/helper'),

  // Create application
  createApplication: (taskId: string, data: ApplicationCreateData): Promise<ApplicationResponse> =>
    apiClient.post(`/applications/`, { task_id: taskId, ...data }),

  // Get specific application
  getApplication: (applicationId: string): Promise<ApplicationResponse> =>
    apiClient.get(`/applications/${applicationId}`),

  // Invitation endpoints
  getInvitationsByTask: (taskId: string): Promise<InvitationListResponse> =>
    apiClient.get(`/applications/task/${taskId}/invitations`),

  getInvitationsByHelper: (): Promise<InvitationListResponse> =>
    apiClient.get('/applications/helper/invitations'),

  inviteHelperToTask: (taskId: string, helperId: string): Promise<InvitationResponse> =>
    apiClient.post(`/applications/task/${taskId}/invite/${helperId}`),
};
