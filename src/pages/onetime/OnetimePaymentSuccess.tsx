import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OnetimePaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate('/dashboard?page=searchHelpers', { replace: true });
    }, 4000);

    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full px-6 sm:px-10 py-10 text-center space-y-6">
        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-green-100 text-green-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Payment Successful!</h1>
        <p className="text-sm sm:text-base text-gray-700">
          Your post has been published. We&apos;re redirecting you to search for helpers now.
        </p>
        <button
          onClick={() => navigate('/dashboard?page=searchHelpers', { replace: true })}
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          Go to Search Helpers
        </button>
      </div>
    </div>
  );
};

export default OnetimePaymentSuccess;


