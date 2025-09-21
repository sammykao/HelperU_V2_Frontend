import { apiClient } from './client';

export interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    category: string;
    message: string;
}

export interface ContactResponse {
    success: boolean;
    message: string;
}

// Contact API Functions    
export const contactApi = {
    // Submit contact form
    submitContactForm: (data: ContactFormData) => apiClient.post('/contact', data),

    // Health check
    healthCheck: () => apiClient.get('/contact/health'),
};