'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.nav 
      className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-lg"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Back Button and Logo Container */}
          <div className="flex items-center space-x-4">
            {/* Back Button - Hide on villas page */}
            {pathname !== '/villas' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Link
                  href="/villas"
                  className="flex items-center text-white/80 hover:text-white transition-all duration-300 p-2 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-white/10"
                  title="Back to Browse Villas"
                >
                  <motion.svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ x: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </motion.svg>
                  <span className="ml-1 hidden sm:inline font-medium">Back</span>
                </Link>
              </motion.div>
            )}
            
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Link
                href="/villas"
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all duration-300"
                onClick={closeMenu}
              >
                Solscape
              </Link>
            </motion.div>
          </div>
          
          {/* Desktop Menu - Hidden on mobile, visible on lg screens */}
          <div className="hidden lg:flex items-center space-x-6">
            {user && (
              <Link
                href="/trips"
                className="text-white/90 hover:text-white transition-colors duration-300 text-base font-medium flex items-center group"
              >
                <svg 
                  className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Your Trips
              </Link>
            )}
            
            <Link
              href="/about"
              className="text-white/90 hover:text-white transition-colors duration-300 text-base font-medium flex items-center group"
            >
              <svg 
                className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About Us
            </Link>
            
            <Link
              href="/contact"
              className="text-white/90 hover:text-white transition-colors duration-300 text-base font-medium flex items-center group"
            >
              <svg 
                className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
            
            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/20">
                <span className="text-white/70 text-sm">
                  {user.firstName} {user.lastName}
                </span>
                <motion.button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Out
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/20">
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm shadow-lg"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm border border-white/30"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu Button - Visible on mobile, hidden on lg screens */}
          <motion.button
            onClick={toggleMenu}
            className="lg:hidden relative w-10 h-10 flex flex-col justify-center items-center bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
            aria-label="Toggle menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Top line */}
            <motion.span
              className="block w-6 h-0.5 bg-white"
              animate={{
                rotate: isMenuOpen ? 45 : 0,
                y: isMenuOpen ? 6 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Middle line */}
            <motion.span
              className="block w-6 h-0.5 bg-white my-1"
              animate={{
                opacity: isMenuOpen ? 0 : 1,
                scale: isMenuOpen ? 0.8 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
            {/* Bottom line */}
            <motion.span
              className="block w-6 h-0.5 bg-white"
              animate={{
                rotate: isMenuOpen ? -45 : 0,
                y: isMenuOpen ? -6 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/20 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Floating particles for menu background */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-white/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    repeat: Infinity,
                    delay: Math.random(),
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <motion.div 
                className="flex flex-col space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <Link
                      href="/trips"
                      className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300 text-base font-medium flex items-center backdrop-blur-sm border border-white/10 group"
                      onClick={closeMenu}
                    >
                      <motion.svg 
                        className="h-5 w-5 mr-3 group-hover:scale-110" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        transition={{ duration: 0.2 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </motion.svg>
                      Your Trips
                    </Link>
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <Link
                    href="/about"
                    className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300 text-base font-medium flex items-center backdrop-blur-sm border border-white/10 group"
                    onClick={closeMenu}
                  >
                    <motion.svg 
                      className="h-5 w-5 mr-3 group-hover:scale-110" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </motion.svg>
                    About Us
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <Link
                    href="/contact"
                    className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300 text-base font-medium flex items-center backdrop-blur-sm border border-white/10 group"
                    onClick={closeMenu}
                  >
                    <motion.svg 
                      className="h-5 w-5 mr-3 group-hover:scale-110" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </motion.svg>
                    Contact Us
                  </Link>
                </motion.div>
                
                <motion.div 
                  className="border-t border-white/20 pt-4 space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <p className="text-sm text-white/70 font-medium">Signed in as</p>
                        <p className="font-semibold text-white">{user.firstName} {user.lastName}</p>
                      </div>
                      <motion.button
                        onClick={handleLogout}
                        className="block w-full text-center bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg backdrop-blur-sm border border-red-400/30"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Sign Out
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href="/signup"
                          className="block w-full text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg backdrop-blur-sm border border-blue-400/30"
                          onClick={closeMenu}
                        >
                          Sign Up
                        </Link>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href="/login"
                          className="block w-full text-center bg-white/10 backdrop-blur-md text-white hover:bg-white/20 px-6 py-3 rounded-xl transition-all duration-300 font-semibold border border-white/30"
                          onClick={closeMenu}
                        >
                          Log In
                        </Link>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
