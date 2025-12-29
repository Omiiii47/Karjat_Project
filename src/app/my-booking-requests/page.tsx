'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface PendingBooking {
  villaId: string;
  villaName: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  bookingRequestId: string;
  timestamp: number;
}

export default function MyBookingRequestsPage() {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [statuses, setStatuses] = useState<Record<string, any>>({});

  useEffect(() => {
    loadPendingBookings();
  }, []);

  const loadPendingBookings = () => {
    const bookings: PendingBooking[] = [];
    
    // Search through localStorage for all booking requests
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('bookingRequest_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          bookings.push({
            villaId: key.replace('bookingRequest_', ''),
            ...data
          });
        } catch (error) {
          console.error('Error parsing booking:', error);
        }
      }
    }
    
    setPendingBookings(bookings);
    
    // Check status for each booking
    bookings.forEach(booking => {
      checkBookingStatus(booking.bookingRequestId);
    });
  };

  const checkBookingStatus = async (bookingRequestId: string) => {
    try {
      const response = await fetch(`/api/sales/booking-request?id=${bookingRequestId}`);
      const data = await response.json();
      
      if (data.success) {
        setStatuses(prev => ({
          ...prev,
          [bookingRequestId]: data
        }));
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (requestId: string) => {
    const status = statuses[requestId];
    if (!status) {
      return <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-300 text-sm">Checking...</span>;
    }
    
    switch (status.status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm animate-pulse">⏳ Awaiting Response</span>;
      case 'accepted':
        return <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">✓ Accepted</span>;
      case 'declined':
        return <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">✗ Declined</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-300 text-sm">Unknown</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/" className="text-white/70 hover:text-white mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">My Booking Requests</h1>
          <p className="text-white/80">Track your pending booking requests</p>
        </motion.div>

        {/* Bookings List */}
        {pendingBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center border border-white/20"
          >
            <p className="text-white text-lg mb-4">No pending booking requests</p>
            <Link 
              href="/villas"
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Browse Villas
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map((booking, index) => (
              <motion.div
                key={booking.bookingRequestId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{booking.villaName}</h3>
                    <p className="text-white/70 text-sm">Guest: {booking.guestName}</p>
                  </div>
                  {getStatusBadge(booking.bookingRequestId)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-white/60 text-sm">Check-in</p>
                    <p className="text-white font-medium">{formatDate(booking.checkInDate)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Check-out</p>
                    <p className="text-white font-medium">{formatDate(booking.checkOutDate)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/20">
                  <p className="text-white/50 text-sm">
                    Submitted: {new Date(booking.timestamp).toLocaleString()}
                  </p>
                  
                  <Link
                    href={`/villa/${booking.villaId}`}
                    className="text-blue-300 hover:text-blue-200 text-sm underline"
                  >
                    View Villa
                  </Link>
                </div>

                {statuses[booking.bookingRequestId]?.status === 'accepted' && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <Link
                      href={`/villa/${booking.villaId}`}
                      className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold"
                    >
                      Continue to Payment
                    </Link>
                  </div>
                )}

                {statuses[booking.bookingRequestId]?.status === 'declined' && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-red-300 text-sm text-center">
                      Our sales team will contact you shortly to discuss your booking.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {pendingBookings.length > 0 && (
          <motion.button
            onClick={loadPendingBookings}
            className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl border border-white/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Refresh Status
          </motion.button>
        )}
      </div>
    </div>
  );
}
