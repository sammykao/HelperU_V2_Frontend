import { apiClient } from './client';

// Task Types
export interface TaskCreate {
  title: string;
  dates: string[];
  location_type: string;
  zip_code?: string;
  hourly_rate: number;
  description: string;
  tools_info?: string;
  public_transport_info?: string;
}

export interface TaskResponse {
  id: string;
  client_id: string;
  title: string;
  hourly_rate: number;
  dates: string[];
  location_type: string;
  zip_code?: string;
  description: string;
  tools_info?: string;
  public_transport_info?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  client?: ClientInfo;
}

export interface TaskSearchRequest {
  search_zip_code: string;
  search_query?: string;
  search_location_type?: string;
  min_hourly_rate?: number;
  max_hourly_rate?: number;
  search_limit?: number;
  search_offset?: number;
  sort_by: 'distance' | 'post_date';
}

export interface ClientInfo {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  pfp_url?: string;
}

export interface TaskSearchResponse extends TaskResponse {
  distance?: number;
  client: ClientInfo;
}

export interface TaskUpdate {
  title?: string;
  dates?: string[];
  location_type?: string;
  zip_code?: string;
  hourly_rate?: number;
  description?: string;
  tools_info?: string;
  public_transport_info?: string;
}

export interface TaskListResponse {
  tasks: TaskResponse[];
  total_count: number;
  limit: number;
  offset: number;
}

export interface TaskSearchListResponse {
  tasks: TaskSearchResponse[];
  limit: number;
  offset: number;
}

export interface PublicTask {
  id: string;
  title: string;
  description: string;
  location_type: string;
  zip_code: string;
  hourly_rate: number;
  created_at: string;
}

export interface PublicTaskResponse {
  result: PublicTask[];
  limit: number;
  total_count: number;
}

// Task API Functions
export const taskApi = {
  // Create task
  createTask: (data: TaskCreate): Promise<TaskResponse> =>
    apiClient.post('/tasks/', data),

  // Get tasks with search/filtering
  getTasks: (searchRequest: TaskSearchRequest): Promise<TaskSearchListResponse> => {
    // Filter out undefined/null values and convert to proper query params
    const params = new URLSearchParams();
    
    if (searchRequest.search_zip_code) {
      params.append('search_zip_code', searchRequest.search_zip_code);
    }
    if (searchRequest.search_query) {
      params.append('search_query', searchRequest.search_query);
    }
    if (searchRequest.search_location_type) {
      params.append('search_location_type', searchRequest.search_location_type);
    }
    if (searchRequest.min_hourly_rate !== undefined && searchRequest.min_hourly_rate !== null) {
      params.append('min_hourly_rate', searchRequest.min_hourly_rate.toString());
    }
    if (searchRequest.max_hourly_rate !== undefined && searchRequest.max_hourly_rate !== null) {
      params.append('max_hourly_rate', searchRequest.max_hourly_rate.toString());
    }
    if (searchRequest.search_limit !== undefined) {
      params.append('search_limit', searchRequest.search_limit.toString());
    }
    if (searchRequest.search_offset !== undefined) {
      params.append('search_offset', searchRequest.search_offset.toString());
    }
    if (searchRequest.sort_by) {
      params.append('sort_by', searchRequest.sort_by);
    }
    
    return apiClient.get(`/tasks/?${params.toString()}`);
  },

  // Get available tasks (public)
  getAvailableTasks: (): Promise<PublicTaskResponse> =>
    apiClient.get('/public/fetch_available_tasks'),

  // Get user's own tasks
  getMyTasks: (limit = 20, offset = 0): Promise<TaskListResponse> =>
    apiClient.get(`/tasks/my-tasks?limit=${limit}&offset=${offset}`),

  // Get specific task
  getTask: (taskId: string): Promise<TaskResponse> =>
    apiClient.get(`/tasks/${taskId}`),

  // Update task
  updateTask: (taskId: string, data: TaskUpdate): Promise<TaskResponse> =>
    apiClient.put(`/tasks/${taskId}`, data),

  // Delete task
  deleteTask: (taskId: string): Promise<{ message: string }> =>
    apiClient.delete(`/tasks/${taskId}`),

  // Complete task
  completeTask: (taskId: string): Promise<TaskResponse> =>
    apiClient.post(`/tasks/${taskId}/complete`),
};
