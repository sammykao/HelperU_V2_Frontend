import { apiClient } from './client';

export interface HelperSearchRequest {
  search_query?: string;
  search_college?: string;
  search_graduation_year?: number;
  search_zip_code?: string;
  limit?: number;
  offset?: number;
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
}

export interface HelperListResponse {
  helpers: HelperResponse[];
  total_count: number;
  limit: number;
  offset: number;
}

export const helperApi = {
  // Search helpers with filters
  searchHelpers: (searchRequest: HelperSearchRequest): Promise<HelperListResponse> =>
    apiClient.get(`/helpers/search?${new URLSearchParams(
      Object.entries(searchRequest).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}`),

  // Get all helpers
  getHelpers: (limit = 20, offset = 0): Promise<HelperListResponse> =>
    apiClient.get(`/helpers/?limit=${limit}&offset=${offset}`),

  // Get specific helper
  getHelper: (helperId: string): Promise<HelperResponse> =>
    apiClient.get(`/helpers/${helperId}`),
};
