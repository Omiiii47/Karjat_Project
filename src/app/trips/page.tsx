'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface Booking {
  _id: string;
  villaId: string;
  villaName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingReference: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  userId?: string;
}

export default function TripsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, user not authenticated');
        setBookings([]);
        setLoading(false);
        return;
      }

      console.log('Fetching trips with token...');
      
      const response = await fetch('/api/trips', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      console.log('Trips API response:', data);
      
      if (data.success && data.trips) {
        // Map the trips data to match the Booking interface
        const mappedBookings = data.trips.map((trip: any) => ({
          _id: trip.id,
          villaId: trip.villa.id,
          villaName: trip.villa.name,
          checkInDate: trip.checkIn,
          checkOutDate: trip.checkOut,
          numberOfGuests: trip.guests,
          totalAmount: trip.totalAmount,
          guestName: user?.firstName + ' ' + user?.lastName || '',
          guestEmail: user?.email || '',
          guestPhone: user?.phone || '',
          bookingReference: trip.bookingReference,
          status: trip.status,
          createdAt: trip.bookingDate,
          userId: user?._id
        }));
        
        setBookings(mappedBookings);
      } else {
        console.error('Failed to fetch trips:', data.error || 'Unknown error');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (checkInDate: string) => {
    return new Date(checkInDate) > new Date();
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to cancel booking');
        return;
      }

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'cancel',
          tripId: bookingId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking cancelled successfully!');
        // Refresh bookings
        fetchBookings();
      } else {
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const upcomingBookings = bookings.filter(booking => 
    isUpcoming(booking.checkInDate) && (booking.status || 'confirmed') !== 'cancelled'
  );
  
  const pastBookings = bookings.filter(booking => 
    !isUpcoming(booking.checkInDate) || (booking.status || 'confirmed') === 'cancelled' || (booking.status || 'confirmed') === 'completed'
  );

  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilCheckIn = (checkInDate: string) => {
    const checkIn = new Date(checkInDate);
    const today = new Date();
    const diffTime = checkIn.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>
        
        <motion.div 
          className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-white mt-4 text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading your trips...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Your Bookings
          </motion.h1>
          <motion.p 
            className="text-white/80 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Manage your villa bookings and trip history
          </motion.p>
          {!user && (
            <motion.div 
              className="mt-4 p-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-md border border-yellow-400/30 rounded-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-yellow-100 text-sm">
                <Link 
                  href="/login" 
                  className="font-medium text-yellow-300 hover:text-yellow-200 transition-colors duration-300 underline decoration-2 underline-offset-2"
                >
                  Sign in
                </Link> to view your bookings, or check your email for booking confirmations.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div 
          className="flex bg-white/10 backdrop-blur-md rounded-2xl p-2 mb-8 border border-white/20 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'upcoming'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl transform scale-105'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            whileHover={{ scale: activeTab === 'upcoming' ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Upcoming ({upcomingBookings.length})
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'past'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl transform scale-105'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            whileHover={{ scale: activeTab === 'past' ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Past Bookings ({pastBookings.length})
          </motion.button>
        </motion.div>

        {/* Bookings List */}
        <AnimatePresence mode="wait">
          {currentBookings.length === 0 ? (
            <motion.div 
              className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.svg 
                  className="mx-auto h-20 w-20 text-white/50" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </motion.svg>
              </motion.div>
              <motion.h3 
                className="text-xl font-semibold text-white mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                No {activeTab} bookings
              </motion.h3>
              <motion.p 
                className="text-white/70 mb-8 text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming bookings. Start planning your next getaway!"
                  : "You haven't completed any bookings yet."
                }
              </motion.p>
              {activeTab === 'upcoming' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    href="/villas"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
                  >
                    <motion.span
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      Browse Villas
                    </motion.span>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {currentBookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <BookingCard 
                    booking={booking}
                    getDaysUntilCheckIn={getDaysUntilCheckIn}
                    getStatusColor={getStatusColor}
                    onCancelBooking={handleCancelBooking}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BookingCard({ 
  booking, 
  getDaysUntilCheckIn,
  getStatusColor,
  onCancelBooking
}: { 
  booking: Booking; 
  getDaysUntilCheckIn: (date: string) => number;
  getStatusColor: (status: string) => string;
  onCancelBooking: (bookingId: string) => void;
}) {
  const isUpcoming = new Date(booking.checkInDate) > new Date();
  const daysUntil = getDaysUntilCheckIn(booking.checkInDate);
  const numberOfNights = Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24));

  const getThemeStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-400/30';
      case 'confirmed': return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-400/30';
      case 'cancelled': return 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border-red-400/30';
      case 'completed': return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/30';
      default: return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-400/30';
    }
  };

  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 group"
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <motion.h3 
              className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {booking.villaName}
            </motion.h3>
            <motion.p 
              className="text-white/70 text-sm font-mono"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Booking Reference: <span className="text-blue-300 font-semibold">{booking.bookingReference}</span>
            </motion.p>
          </div>
          <motion.div 
            className="flex flex-col items-end gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span 
              className={`px-4 py-2 rounded-xl text-xs font-semibold border backdrop-blur-md ${getThemeStatusColor(booking.status || 'confirmed')}`}
              whileHover={{ scale: 1.05 }}
            >
              {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Confirmed'}
            </motion.span>
            {isUpcoming && daysUntil > 0 && (
              <motion.span 
                className="text-xs text-blue-200 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-3 py-1 rounded-xl border border-blue-400/30 backdrop-blur-md"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                {daysUntil} days to go
              </motion.span>
            )}
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-xs text-white/60 mb-2 font-medium uppercase tracking-wider">Check-in</p>
            <p className="font-bold text-white text-lg">
              {new Date(booking.checkInDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-xs text-white/60 mb-2 font-medium uppercase tracking-wider">Check-out</p>
            <p className="font-bold text-white text-lg">
              {new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-xs text-white/60 mb-2 font-medium uppercase tracking-wider">Guests</p>
            <p className="font-bold text-white text-lg">{booking.numberOfGuests}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-xs text-white/60 mb-2 font-medium uppercase tracking-wider">Total Amount</p>
            <p className="font-bold text-white text-lg">₹{booking.totalAmount.toLocaleString()}</p>
          </div>
        </motion.div>

        <motion.div 
          className="border-t border-white/20 pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
            <div className="text-white/70">
              <span className="font-semibold text-white">{numberOfNights} night{numberOfNights > 1 ? 's' : ''}</span>
              <span className="mx-3 text-white/40">•</span>
              <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={`/villa/${booking.villaId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 font-semibold rounded-lg border border-blue-400/30 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Villa
                </Link>
              </motion.div>
              {/* Only show cancel button for pending bookings */}
              {isUpcoming && booking.status === 'pending' && (
                <motion.button 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 font-semibold rounded-lg border border-red-400/30 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this booking?')) {
                      onCancelBooking(booking._id);
                    }
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Booking
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
