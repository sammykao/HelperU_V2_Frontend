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
}

export interface TaskSearchRequest {
  search_zip_code: string;
  query?: string;
  location_type?: string;
  min_hourly_rate?: number;
  max_hourly_rate?: number;
  limit?: number;
  offset?: number;
}

export interface TaskSearchResponse extends TaskResponse {
  distance?: number;
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
  total_count: number;
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
  getTasks: (searchRequest: TaskSearchRequest): Promise<TaskSearchListResponse> =>
    apiClient.get(`/tasks/?${new URLSearchParams(searchRequest as any).toString()}`),

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
