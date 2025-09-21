import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 overflow-hidden">
      <Navbar />
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse-blue"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse-blue animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse-blue animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-sky-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-wave"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-7xl md:text-9xl font-display font-black bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent leading-tight mb-6 animate-neon-glow">
              HelperU
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium">
              The future of reaching college students
            </p>
          </div>

          {/* Glassmorphism CTA */}
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto mb-12 animate-glow">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/client" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 font-display text-center">
                I Want to Post
              </Link>
              <Link to="/auth/helper" className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm font-display text-center">
                I'm a Student
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-4 font-mono">No credit card required • Join 1,000+ users</p>
          </div>

          {/* Floating Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="backdrop-blur-lg bg-blue-500/5 border border-blue-300/10 rounded-xl p-6 hover:bg-blue-500/10 transition-all duration-300 animate-float">
              <div className="text-3xl font-bold text-blue-300 mb-2 font-display">1,000+</div>
              <div className="text-blue-200">Active Boston Area Students</div>
            </div>
            <div className="backdrop-blur-lg bg-blue-500/5 border border-blue-300/10 rounded-xl p-6 hover:bg-blue-500/10 transition-all duration-300 animate-float animation-delay-2000">
              <div className="text-3xl font-bold text-blue-300 mb-2 font-display">100+</div>
              <div className="text-blue-200">Posts Completed</div>
            </div>
            <div className="backdrop-blur-lg bg-blue-500/5 border border-blue-300/10 rounded-xl p-6 hover:bg-blue-500/10 transition-all duration-300 animate-float animation-delay-4000">
              <div className="text-3xl font-bold text-blue-300 mb-2 font-display">FREE</div>
              <div className="text-blue-200">No money required to use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
              What is HelperU?
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto font-medium">
             A platform to share opportunities with college students — from getting task help, to company jobs, to advertisements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group backdrop-blur-lg bg-blue-500/5 border border-blue-300/10 rounded-2xl p-8 hover:bg-blue-500/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 animate-glow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 font-display">Lightning Fast</h3>
              <p className="text-blue-200">Post tasks, jobs, and advertisements. Then, reach students in seconds.</p>
            </div>

            {/* Feature 2 */}
            <div className="group backdrop-blur-lg bg-blue-500/5 border border-blue-300/10 rounded-2xl p-8 hover:bg-blue-500/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 animate-glow-cyan">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 font-display">Find the Right Helper</h3>
              <p className="text-blue-200">Search for and invite the perfect student helper to your post.</p>
            </div>

            {/* Feature 3 */}
            <div className="group backdrop-blur-lg bg-blue-500/5 border border-blue-300/10 rounded-2xl p-8 hover:bg-blue-500/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 animate-glow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 font-display">In App Messaging</h3>
              <p className="text-blue-200">Communicate with students directly in the app.</p>
            </div>

            {/* Feature 4 */}
            <div className="group backdrop-blur-lg bg-blue-500/5 border border-blue-300/10 rounded-2xl p-8 hover:bg-blue-500/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 animate-glow-cyan">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 font-display">24/7 Support</h3>
              <p className="text-blue-200">Round-the-clock customer support to help you whenever you need assistance.</p>
            </div>

            {/* Feature 5 */}
            <div className="group backdrop-blur-lg bg-blue-500/5 border border-blue-300/10 rounded-2xl p-8 hover:bg-blue-500/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 animate-glow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 font-display">AI Powered</h3>
              <p className="text-blue-200">Our AI assistant helps you post and find the perfect student helper.</p>
            </div>

            {/* Feature 6 */}
            <div className="group backdrop-blur-lg bg-blue-500/5 border border-blue-300/10 rounded-2xl p-8 hover:bg-blue-500/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 animate-glow-cyan">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 font-display">Real-time Monitoring</h3>
              <p className="text-blue-200">Our team constantly monitors your posts to ensure students apply.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
              How It Works
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto font-medium">
              Get things done in three simple steps. Our streamlined process makes assistance effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-glow">
                  <span className="text-2xl font-bold text-white font-display">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse-blue">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 font-display">Post Your Anything</h3>
              <p className="text-blue-200">Describe what you need help with or want students to see. Post it to our platform manually or with our AI assistant.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-glow-cyan">
                  <span className="text-2xl font-bold text-white font-display">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse-blue">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 font-display">Invite and Get Applications</h3>
              <p className="text-blue-200">Students will apply to your post. You can search for and invite any student on our platform to apply. You can do this manually or with our AI assistant.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-glow">
                  <span className="text-2xl font-bold text-white font-display">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse-blue">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 font-display">Mark It Done</h3>
              <p className="text-blue-200">You don't need to accept or decline applications. Just mark the post done when you don't want students to see it anymore. </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="backdrop-blur-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-300/20 rounded-3xl p-12 animate-glow">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto font-medium">
              Join thousands of users who are already experiencing the future of the college student market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/client" className="px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 text-lg font-display text-center">
                Begin your first post
              </Link>
              <Link to="/auth/helper" className="px-10 py-4 bg-white/20 text-white font-semibold rounded-xl border border-blue-300/30 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm text-lg font-display text-center">
                Become a Helper
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-blue-300/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-white text-lg font-semibold mb-4 font-display">HelperU</div>
          <p className="text-blue-200 mb-6 font-medium">The future of the college student market is here.</p>
          <div className="flex justify-center space-x-6 text-blue-300">
            <Link to="/privacy-policy" className="hover:text-white transition-colors font-medium">Privacy</Link>
            <Link to="/terms-of-use" className="hover:text-white transition-colors font-medium">Terms</Link>
            <Link to="/faqs" className="hover:text-white transition-colors font-medium">Support</Link>
            <Link to="/contact" className="hover:text-white transition-colors font-medium">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { HomePage };