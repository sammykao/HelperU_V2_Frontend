import { apiClient } from './client';

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
};
