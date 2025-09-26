import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { subscriptionApi, SubscriptionStatus } from '../../lib/api/subscriptions';

const SubscriptionUpgrade: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const status = await subscriptionApi.getStatus();
      setSubscriptionStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      setError(null); // Clear any previous errors
      const result = await subscriptionApi.createCheckoutSession({});
      
      // Redirect to Stripe Checkout
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upgrade subscription';
      setError(errorMessage);
      console.error('Subscription upgrade error:', err);
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setOpeningPortal(true);
      setError(null);
      const result = await subscriptionApi.createPortalSession();
      
      // Redirect to Stripe Customer Portal
      if (result.portal_url) {
        window.location.href = result.portal_url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open subscription management';
      setError(errorMessage);
      console.error('Portal session error:', err);
    } finally {
      setOpeningPortal(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'month',
      description: 'Perfect for trying out HelperU',
      features: [
        '1 post per month',
        'Basic support',
        'Access to student helpers',
        'Standard response time'
      ],
      current: subscriptionStatus?.plan === 'free',
      popular: false
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      description: 'Best for regular users',
      features: [
        'Unlimited posts',
        'Priority support',
        'Access to student helpers',
        '24/7 personal assistance to get applicants for your task',
        'Faster response time',
        'Money back guarantee if you are not satisfied'
      ],
      current: subscriptionStatus?.plan === 'premium',
      popular: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h1>
          <p className="text-gray-300">Upgrade to unlock unlimited posts and premium features</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-400">Upgrade Failed</h3>
                <p className="text-sm text-red-300 mt-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan Status */}
        {subscriptionStatus && (
          <div className="mb-8 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-4">Current Plan</h2>
              <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-lg mb-4">
                <span className="text-lg font-semibold text-white capitalize">{subscriptionStatus.plan}</span>
                <span className="ml-2 text-sm text-gray-300">
                  ({subscriptionStatus.posts_used} / {subscriptionStatus.plan === "free" ? '1' : '∞'} posts used)
                </span>
              </div>
              
              {/* Manage Subscription Button for Paid Users */}
              {subscriptionStatus.plan !== 'free' && (
                <button
                  onClick={handleManageSubscription}
                  disabled={openingPortal}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 flex items-center text-sm font-medium mx-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {openingPortal ? 'Opening...' : 'Manage Subscription'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative backdrop-blur-lg border rounded-2xl p-6 transition-all duration-200 ${
                plan.popular
                  ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50'
                  : 'bg-white/10 border-white/20 hover:bg-white/15'
              } ${plan.current ? 'ring-2 ring-green-500/50' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-300">/{plan.period}</span>
                </div>
                <p className="text-gray-300 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (plan.current) {
                    navigate('/tasks/my-posts');
                  } else if (plan.name === 'Free') {
                    navigate('/tasks/my-posts');
                  } else {
                    handleUpgrade();
                  }
                }}
                disabled={plan.current || upgrading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  plan.current
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {plan.current ? 'Current Plan' : upgrading ? 'Processing...' : plan.name === 'Free' ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>

        {/* Plan Comparison */}
        <div className="mb-8 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Plan Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white text-center">Free Plan</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Posts per month</span>
                  <span className="text-white font-medium">1</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Support level</span>
                  <span className="text-white font-medium">Basic</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Response time</span>
                  <span className="text-white font-medium">Standard</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white text-center">Premium Plan</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
                  <span className="text-gray-300">Posts per month</span>
                  <span className="text-white font-medium">Unlimited</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
                  <span className="text-gray-300">Support level</span>
                  <span className="text-white font-medium">Priority</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
                  <span className="text-gray-300">Response time</span>
                  <span className="text-white font-medium">Faster</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-white mb-1">Can I upgrade anytime?</h3>
              <p className="text-sm text-gray-300">Yes, you can upgrade from Free to Premium at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-1">What's the difference between Free and Premium?</h3>
              <p className="text-sm text-gray-300">Free gives you 1 post per month with basic support. Premium gives you unlimited posts with priority support and advanced features.</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-1">Is there a free trial?</h3>
              <p className="text-sm text-gray-300">Yes! The free plan gives you 1 post per month to try out our platform before upgrading.</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-1">Can I cancel anytime?</h3>
              <p className="text-sm text-gray-300">Yes, you can cancel your Premium subscription anytime and return to the Free plan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionUpgrade;
