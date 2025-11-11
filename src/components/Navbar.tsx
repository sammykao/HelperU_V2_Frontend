import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, authRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Only show logged-in state if both authenticated AND authRoute is set
  // But never show logged-in state on homepage
  const isFullyLoggedIn = isAuthenticated && authRoute && location.pathname !== '/';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close menu when route changes
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Check if click is not on the hamburger button
        const button = (event.target as HTMLElement).closest('button[aria-label="Toggle menu"]');
        if (!button) {
          closeMobileMenu();
        }
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav ref={menuRef} className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="shrink-0">
              <Link to={isFullyLoggedIn ? "/dashboard" : "/"}>
                <h1 className="text-2xl font-display font-extrabold bg-linear-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent drop-shadow-md">
                  HelperU
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {isFullyLoggedIn ? (
                  <>
                    {authRoute === 'client' ? (
                      // Client navbar
                      <>
                        <Link to="/tasks/my-posts" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                          My Posts
                        </Link>
                        <Link to="/tasks/create" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                          Create Post
                        </Link>
                        <Link to="/helpers/search" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                          Search Helpers
                        </Link>
                      </>
                    ) : (
                      // Helper navbar
                      <>
                        <Link to="/tasks/browse" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                          Browse Posts
                        </Link>
                        <Link to="/applications" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                          Applications
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  // Unauthenticated navbar
                  <>
                    <Link to="/faqs" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      FAQs
                    </Link>
                    <Link to="/contact" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Contact Us
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-4">
                {isFullyLoggedIn ? (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-gray-600 hover:text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-500/10"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <Link to="/auth/client" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Client
                    </Link>
                    <Link to="/auth/helper" className="bg-linear-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105">
                      Helper
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu - Slides down from navbar */}
        <div
          className={`md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pt-2 pb-4 space-y-1">
            {isFullyLoggedIn ? (
              <>
                {authRoute === 'client' ? (
                  // Client mobile navbar
                  <>
                    <Link
                      to="/tasks/my-posts"
                      onClick={closeMobileMenu}
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2.5 rounded-md text-base font-medium transition-colors"
                    >
                      My Posts
                    </Link>
                    <Link
                      to="/tasks/create"
                      onClick={closeMobileMenu}
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2.5 rounded-md text-base font-medium transition-colors"
                    >
                      Create Post
                    </Link>
                    <Link
                      to="/helpers/search"
                      onClick={closeMobileMenu}
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2.5 rounded-md text-base font-medium transition-colors"
                    >
                      Search Helpers
                    </Link>
                  </>
                ) : (
                  // Helper mobile navbar
                  <>
                    <Link
                      to="/tasks/browse"
                      onClick={closeMobileMenu}
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2.5 rounded-md text-base font-medium transition-colors"
                    >
                      Browse Posts
                    </Link>
                    <Link
                      to="/applications"
                      onClick={closeMobileMenu}
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2.5 rounded-md text-base font-medium transition-colors"
                    >
                      Applications
                    </Link>
                  </>
                )}
              </>
            ) : (
              // Unauthenticated mobile navbar
              <>
                <Link
                  to="/faqs"
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2.5 rounded-md text-base font-medium transition-colors"
                >
                  FAQs
                </Link>
                <Link
                  to="/contact"
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2.5 rounded-md text-base font-medium transition-colors"
                >
                  Contact Us
                </Link>
              </>
            )}
            <div className="pt-3 pb-2 border-t border-gray-200 mt-2">
              <div className="flex flex-col space-y-2">
                {isFullyLoggedIn ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-center space-x-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-md text-base font-medium transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        handleLogout();
                      }}
                      className="flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2.5 rounded-md text-base font-medium transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/auth/client"
                      onClick={closeMobileMenu}
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-md text-base font-medium transition-colors text-center"
                    >
                      Client
                    </Link>
                    <Link
                      to="/auth/helper"
                      onClick={closeMobileMenu}
                      className="bg-linear-to-r from-blue-600 to-cyan-600 text-white px-4 py-2.5 rounded-md text-base font-medium transition-all duration-300 text-center hover:from-blue-700 hover:to-cyan-700"
                    >
                      Helper
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
