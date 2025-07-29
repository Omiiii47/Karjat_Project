'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  // Hide navbar on landing page for full-screen experience
  if (pathname === '/') {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Back Button and Logo Container */}
          <div className="flex items-center space-x-4">
            {/* Back Button - Hide on villas page */}
            {pathname !== '/villas' && (
              <Link
                href="/villas"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-gray-50"
                title="Back to Browse Villas"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="ml-1 hidden sm:inline">Back</span>
              </Link>
            )}
            
            {/* Logo */}
            <Link
              href="/villas"
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              onClick={closeMenu}
            >
              Solscape
            </Link>
          </div>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="relative w-8 h-8 flex flex-col justify-center items-center space-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-all duration-300 ease-in-out"
            aria-label="Toggle menu"
          >
            {/* Top line */}
            <span
              className={`block w-6 h-0.5 bg-gray-600 transform transition-all duration-300 ease-in-out ${
                isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}
            />
            {/* Middle line */}
            <span
              className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ease-in-out ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            {/* Bottom line */}
            <span
              className={`block w-6 h-0.5 bg-gray-600 transform transition-all duration-300 ease-in-out ${
                isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg transform transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 -translate-y-4 invisible'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4">
            {user && (
              <Link
                href="/trips"
                className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors text-base font-medium flex items-center"
                onClick={closeMenu}
              >
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Your Trips
              </Link>
            )}
            
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors text-base font-medium flex items-center"
              onClick={closeMenu}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About Us
            </Link>
            
            <Link
              href="/contact"
              className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors text-base font-medium flex items-center"
              onClick={closeMenu}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
            
            <div className="border-t border-gray-200 pt-4 space-y-4">
              {user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-600">Signed in as</p>
                    <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-center bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="block w-full text-center bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors font-medium"
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Link>
                  
                  <Link
                    href="/login"
                    className="block w-full text-center border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md transition-colors font-medium"
                    onClick={closeMenu}
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
