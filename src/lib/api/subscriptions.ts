import { apiClient } from './client';
import type { TaskCreate } from './tasks';

// Subscription Types
export interface SubscriptionStatus {
  plan: string;
  status: string;
  post_limit: number;
  posts_used: number;
}

export interface CreateSubscriptionRequest {
  price_id?: string;
}

export interface CreateSubscriptionResponse {
  subscription_id: string;
  client_secret: string;
  status: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
}

// Subscription API Functions
export const subscriptionApi = {
  // Get subscription status
  getStatus: (): Promise<SubscriptionStatus> =>
    apiClient.get('/subscriptions/status'),

  // Create checkout session
  createCheckoutSession: (data: CreateSubscriptionRequest): Promise<{ checkout_url: string }> =>
    apiClient.post('/subscriptions/create-checkout-session', data),

  // Create subscription (legacy)
  createSubscription: (data: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> =>
    apiClient.post('/subscriptions/create', data),

  // Cancel subscription
  cancelSubscription: (): Promise<CancelSubscriptionResponse> =>
    apiClient.post('/subscriptions/cancel'),

  // Create portal session
  createPortalSession: (): Promise<{ portal_url: string }> =>
    apiClient.post('/subscriptions/create-portal-session'),

  // Create one-time payment checkout session
  // Sends task data and price_id in the request body
  // FastAPI will parse both TaskCreate fields and OnetimePaymentRequest.price_id from the same JSON body
  createOnetimePaymentSession: (taskData: TaskCreate, priceId?: string): Promise<{ checkout_url: string }> => {
    const payload = {
      ...taskData,
      ...(priceId && { price_id: priceId }), // Only include price_id if provided
    };
    return apiClient.post('/subscriptions/create-onetime-payment-session', payload);
  },
};
