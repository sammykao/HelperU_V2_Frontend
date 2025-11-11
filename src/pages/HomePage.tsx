import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/contexts/AuthContext';
import Navbar from '../components/Navbar';
import landingImg from '../data/landing.jpg';

const HomePage: React.FC = () => {
  const { isAuthenticated, authRoute, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if logged in (but wait for auth to finish loading)
  useEffect(() => {
    if (!isLoading && isAuthenticated && authRoute) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authRoute, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 overflow-hidden">
      <Navbar />
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse-blue"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/40 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse-blue animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-sky-200/40 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse-blue animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-blue-100/50 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-wave"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[50vh] sm:min-h-[80vh] flex items-start sm:items-center px-4 py-16 sm:py-2">
        <div className="absolute inset-0">
          <img src={landingImg} alt="HelperU background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative max-w-6xl mx-auto w-full">
          <div className="max-w-sm sm:max-w-2xl md:max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl p-3 sm:p-6 md:p-10 shadow-lg">
            {/* Main Heading */}
            <div className="mb-4 sm:mb-8 text-center">
              <h1 className="text-2xl sm:text-5xl md:text-7xl font-display font-black text-gray-900 leading-tight mb-2 sm:mb-6">
                HelperU
              </h1>
              <p className="text-xs sm:text-lg md:text-2xl text-gray-600 max-w-xl sm:max-w-2xl mx-auto leading-normal sm:leading-relaxed font-medium">
                The future of reaching college students
              </p>
            </div>

            {/* CTA */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-5 md:p-8 max-w-sm sm:max-w-2xl mx-auto shadow-sm">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                <Link to="/auth/client" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow hover:shadow-blue-500/20 font-display text-center">
                  Create a Post
                </Link>
                <Link to="/auth/helper" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-50 text-blue-700 font-semibold rounded-xl border border-blue-200 hover:bg-blue-100 transition-all duration-300 font-display text-center">
                  I'm a Student
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 max-w-xs sm:max-w-2xl md:max-w-4xl mx-auto mt-6 sm:mt-8 md:mt-10">
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-4 md:p-6 transition-all duration-300 animate-float">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 mb-1 sm:mb-2 font-display">1,000+</div>
                <div className="text-[10px] sm:text-sm text-gray-600 leading-snug">Active Students</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-4 md:p-6 transition-all duration-300 animate-float animation-delay-2000">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 mb-1 sm:mb-2 font-display">100+</div>
                <div className="text-[10px] sm:text-sm text-gray-600 leading-snug">Posts Completed</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-4 md:p-6 transition-all duration-300 animate-float animation-delay-4000">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 mb-1 sm:mb-2 font-display">FREE</div>
                <div className="text-[10px] sm:text-sm text-gray-600 leading-snug">No Cost to Use</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 font-display">
              What is HelperU?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-medium">
             A platform to share opportunities with college students — from getting task help, to company jobs, to advertisements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-display">Lightning Fast</h3>
              <p className="text-gray-600">Post tasks, jobs, and advertisements. Then, reach students in seconds.</p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-cyan-50 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-display">Find the Right Helper</h3>
              <p className="text-gray-600">Search for and invite the perfect student helper to your post.</p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-display">In App Messaging</h3>
              <p className="text-gray-600">Communicate with students directly in the app.</p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-sky-50 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-display">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support to help you whenever you need assistance.</p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-display">AI Powered</h3>
              <p className="text-gray-600">Our AI assistant helps you post and find the perfect student helper.</p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-cyan-50 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-display">Real-time Monitoring</h3>
              <p className="text-gray-600">Our team constantly monitors your posts to ensure students apply.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 font-display">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              Get things done in three simple steps. Our streamlined process makes assistance effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-blue-700 font-display">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center animate-pulse-blue">
                  <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-display">Post Your Anything</h3>
              <p className="text-gray-600">Describe what you need help with or want students to see. Post it to our platform manually or with our AI assistant.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-cyan-700 font-display">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-200 rounded-full flex items-center justify-center animate-pulse-blue">
                  <svg className="w-4 h-4 text-cyan-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-display">Invite and Get Applications</h3>
              <p className="text-gray-600">Students will apply to your post. You can search for and invite any student on our platform to apply. You can do this manually or with our AI assistant.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-indigo-700 font-display">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center animate-pulse-blue">
                  <svg className="w-4 h-4 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-display">Mark It Done</h3>
              <p className="text-gray-600">You don't need to accept or decline applications. Just mark the post done when you don't want students to see it anymore. </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 shadow-sm">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 font-display">
              Ready to Get Started?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto font-medium">
              Join thousands of users who are already experiencing the future of the college student market.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/auth/client" className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow hover:shadow-blue-500/20 text-base sm:text-lg font-display text-center">
                Begin your first post
              </Link>
              <Link to="/auth/helper" className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-blue-50 text-blue-700 font-semibold rounded-xl border border-blue-200 hover:bg-blue-100 transition-all duration-300 text-base sm:text-lg font-display text-center">
                Become a Helper
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-gray-900 text-lg font-semibold mb-4 font-display">HelperU</div>
          <p className="text-gray-600 mb-6 font-medium">The future of the college student market is here.</p>
          <div className="flex justify-center space-x-6 text-blue-700">
            <Link to="/privacy-policy" className="hover:text-blue-900 transition-colors font-medium">Privacy</Link>
            <Link to="/terms-of-use" className="hover:text-blue-900 transition-colors font-medium">Terms</Link>
            <Link to="/faqs" className="hover:text-blue-900 transition-colors font-medium">Support</Link>
            <Link to="/contact" className="hover:text-blue-900 transition-colors font-medium">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { HomePage };