import { useNavigate } from 'react-router-dom';

const OnetimePaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full px-6 sm:px-10 py-10 text-center space-y-6">
        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Payment Cancelled</h1>
        <p className="text-sm sm:text-base text-gray-700">
          Your post hasn&apos;t been published yet. You can return to the create post page to retry whenever you&apos;re
          ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/dashboard?page=createPost', { replace: true })}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Back to Create Post
          </button>
          <button
            onClick={() => navigate('/subscription/upgrade')}
            className="w-full px-4 py-3 rounded-xl border border-purple-500 text-purple-600 font-medium hover:bg-purple-50 transition-all"
          >
            Upgrade Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnetimePaymentCancel;


