'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface PendingBooking {
  _id: string;
  villaId: string;
  villaName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfKids: number;
  numberOfPets: number;
  purposeOfVisit: string;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
  specialRequests?: string;
  status: string;
  bookingType?: string;
  bookingSource?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  customOffer?: {
    isCustomOffer: boolean;
    adjustedPricePerNight: number;
    adjustedTotalAmount: number;
    discountAmount: number;
    discountPercentage: number;
    salesNotes?: string;
    offerExpiresAt?: string;
    offeredBy?: string;
    offeredAt?: string;
  };
}

export default function MyBookingRequestsPage() {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPendingBookings();
  }, []);

  const loadPendingBookings = async () => {
    try {
      setLoading(true);
      
      // Get current user from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('Please log in to view your booking requests');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const userId = user._id || user.id;

      if (!userId) {
        setError('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Fetch booking requests from database
      const response = await fetch(`/api/sales/booking-request?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setPendingBookings(data.bookingRequests || []);
      } else {
        setError(data.message || 'Failed to load booking requests');
      }
    } catch (error) {
      console.error('Error loading booking requests:', error);
      setError('Failed to load booking requests. Please try again.');
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status: string, bookingSource?: string) => {
    // Call team bookings are ready for payment immediately
    if (bookingSource === 'CALL' && status === 'pending') {
      return <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">✓ Ready for Payment</span>;
    }
    
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm animate-pulse">⏳ Awaiting Response</span>;
      case 'accepted':
        return <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">✓ Accepted</span>;
      case 'declined':
        return <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">✗ Declined</span>;
      case 'custom-offer':
        return <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm font-semibold">🎁 Custom Offer Available!</span>;
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
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{booking.villaName}</h3>
                    <p className="text-white/70 text-sm">Guest: {booking.guestName}</p>
                    {booking.bookingSource && (
                      <p className="text-white/50 text-xs mt-1">Source: {booking.bookingSource}</p>
                    )}
                  </div>
                  {getStatusBadge(booking.status, booking.bookingSource)}
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
                    Submitted: {new Date(booking.createdAt).toLocaleString()}
                  </p>
                  
                  <Link
                    href={`/villa/${booking.villaId}`}
                    className="text-blue-300 hover:text-blue-200 text-sm underline"
                  >
                    View Villa
                  </Link>
                </div>

                {booking.status === 'custom-offer' && booking.customOffer && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    {/* Custom Offer Details */}
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                      <h4 className="text-yellow-300 font-bold text-lg mb-3">🎉 Special Offer from Sales Team</h4>
                      
                      {/* Guest Details */}
                      <div className="bg-white/10 rounded-lg p-3 mb-4">
                        <p className="text-white/60 text-xs mb-2">Booking Details:</p>
                        <div className="space-y-1 text-sm text-white/90">
                          <p>👥 {booking.numberOfAdults} Adult{booking.numberOfAdults !== 1 ? 's' : ''}</p>
                          <p>👶 {booking.numberOfKids} Kid{booking.numberOfKids !== 1 ? 's' : ''}</p>
                          <p>🐾 {booking.numberOfPets} Pet{booking.numberOfPets !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Original Price:</span>
                          <span className="text-white/50 line-through">₹{booking.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">New Price:</span>
                          <span className="text-green-300 font-bold text-xl">₹{booking.customOffer.adjustedTotalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">You Save:</span>
                          <span className="text-yellow-300 font-bold">₹{booking.customOffer.discountAmount.toLocaleString()} ({booking.customOffer.discountPercentage.toFixed(1)}% OFF)</span>
                        </div>
                      </div>

                      {/* Sales Notes */}
                      {booking.customOffer.salesNotes && (
                        <div className="bg-white/10 rounded-lg p-3 mb-4">
                          <p className="text-white/90 text-sm">
                            <strong className="text-yellow-300">Message from Sales Team:</strong><br />
                            {booking.customOffer.salesNotes}
                          </p>
                        </div>
                      )}

                      {/* Offer Expiry */}
                      {booking.customOffer.offerExpiresAt && (
                        <p className="text-orange-300 text-xs mb-4">
                          ⏰ Offer expires on: {new Date(booking.customOffer.offerExpiresAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/villa/${booking.villaId}?bookingRequestId=${booking._id}&customOffer=true`}
                      className="block w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-center px-6 py-4 rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all font-bold text-lg shadow-lg"
                    >
                      Accept Offer & Proceed to Payment
                    </Link>
                  </div>
                )}

                {(booking.status === 'accepted' || (booking.status === 'pending' && booking.bookingSource === 'CALL')) && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <Link
                      href={`/villa/${booking.villaId}?bookingRequestId=${booking._id}&paymentOnly=true`}
                      className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold"
                    >
                      Continue to Payment
                    </Link>
                  </div>
                )}

                {booking.status === 'declined' && (
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
