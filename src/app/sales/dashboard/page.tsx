'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SalesGuard from '@/components/SalesGuard';

interface BookingRequest {
  _id: string;
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
  otherPurpose?: string;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
  specialRequests?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export default function SalesDashboardPage() {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [allBookingRequests, setAllBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingRequests();
    fetchAllBookingRequests();
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchBookingRequests();
      fetchAllBookingRequests();
    }, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchBookingRequests = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/sales/requests?status=${filter}`);
      const data = await response.json();
      if (data.success) {
        setBookingRequests(data.bookingRequests);
      }
    } catch (error) {
      console.error('Error fetching booking requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBookingRequests = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/sales/requests`);
      const data = await response.json();
      if (data.success) {
        setAllBookingRequests(data.bookingRequests);
      }
    } catch (error) {
      console.error('Error fetching all booking requests:', error);
    }
  };

  const getCountForStatus = (status: 'pending' | 'accepted' | 'declined') => {
    return allBookingRequests.filter(req => req.status === status).length;
  };

  const handleAction = async (id: string, action: 'accept' | 'decline') => {
    setProcessingId(id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/sales/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the list
        await fetchBookingRequests();
      } else {
        alert(data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error processing booking request:', error);
      alert('Failed to process request');
    } finally {
      setProcessingId(null);
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SalesGuard>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </SalesGuard>
    );
  }

  return (
    <SalesGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Sales Dashboard</h1>
          <p className="text-white/80">Manage booking requests from customers</p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          {(['pending', 'accepted', 'declined'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-white text-purple-900'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 bg-white/20 px-2 py-1 rounded text-sm">
                {getCountForStatus(status)}
              </span>
            </button>
          ))}
        </div>

        {/* Booking Requests List */}
        <div className="space-y-4">
          <AnimatePresence>
            {bookingRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center text-white"
              >
                <p className="text-xl">No {filter} booking requests</p>
              </motion.div>
            ) : (
              bookingRequests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Guest Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{request.villaName}</h3>
                        <p className="text-white/60 text-sm">Requested {formatDateTime(request.createdAt)}</p>
                      </div>

                      <div className="bg-white/10 rounded-lg p-4 space-y-2">
                        <h4 className="text-white font-semibold mb-2">Guest Information</h4>
                        <p className="text-white/90"><strong>Name:</strong> {request.guestName}</p>
                        <p className="text-white/90"><strong>Email:</strong> {request.guestEmail}</p>
                        <p className="text-white/90"><strong>Phone:</strong> {request.guestPhone}</p>
                      </div>

                      <div className="bg-white/10 rounded-lg p-4 space-y-2">
                        <h4 className="text-white font-semibold mb-2">Guest Details</h4>
                        <p className="text-white/90"><strong>Adults:</strong> {request.numberOfAdults}</p>
                        <p className="text-white/90"><strong>Kids:</strong> {request.numberOfKids}</p>
                        <p className="text-white/90"><strong>Pets:</strong> {request.numberOfPets}</p>
                        <p className="text-white/90"><strong>Total Guests:</strong> {request.numberOfGuests}</p>
                      </div>

                      <div className="bg-white/10 rounded-lg p-4 space-y-2">
                        <h4 className="text-white font-semibold mb-2">Purpose of Visit</h4>
                        <p className="text-white/90">
                          {request.purposeOfVisit === 'others' 
                            ? request.otherPurpose 
                            : request.purposeOfVisit.charAt(0).toUpperCase() + request.purposeOfVisit.slice(1)}
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Booking Details */}
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-lg p-4 space-y-2">
                        <h4 className="text-white font-semibold mb-2">Booking Details</h4>
                        <p className="text-white/90"><strong>Check-in:</strong> {formatDate(request.checkInDate)}</p>
                        <p className="text-white/90"><strong>Check-out:</strong> {formatDate(request.checkOutDate)}</p>
                        <p className="text-white/90"><strong>Nights:</strong> {request.numberOfNights}</p>
                      </div>

                      <div className="bg-white/10 rounded-lg p-4 space-y-2">
                        <h4 className="text-white font-semibold mb-2">Pricing</h4>
                        <p className="text-white/90"><strong>Per Night:</strong> ₹{request.pricePerNight.toLocaleString()}</p>
                        <p className="text-white/90 text-xl"><strong>Total:</strong> ₹{request.totalAmount.toLocaleString()}</p>
                      </div>

                      {request.specialRequests && (
                        <div className="bg-white/10 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2">Special Requests</h4>
                          <p className="text-white/80">{request.specialRequests}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {filter === 'pending' && (
                        <div className="space-y-3 pt-4">
                          <motion.button
                            onClick={() => handleAction(request._id, 'accept')}
                            disabled={processingId === request._id}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
                            whileHover={{ scale: processingId === request._id ? 1 : 1.02 }}
                            whileTap={{ scale: processingId === request._id ? 1 : 0.98 }}
                          >
                            {processingId === request._id ? 'Processing...' : '✓ Accept Original Price'}
                          </motion.button>

                          <motion.button
                            onClick={() => window.location.href = `/sales/dashboard/create-offer/${request._id}`}
                            disabled={processingId === request._id}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg text-lg"
                            whileHover={{ scale: processingId === request._id ? 1 : 1.02 }}
                            whileTap={{ scale: processingId === request._id ? 1 : 0.98 }}
                          >
                            💰 Create Custom Offer (Adjust Price)
                          </motion.button>
                        </div>
                      )}

                      {filter === 'accepted' && (
                        <div className="p-4 rounded-lg text-center font-semibold bg-green-500/20 text-green-300">
                          Accepted ✓
                        </div>
                      )}

                      {filter === 'declined' && (
                        <div className="space-y-3 pt-4">
                          <div className="p-4 rounded-lg text-center bg-red-500/20 text-red-300 mb-2">
                            <p className="font-semibold">Previously Declined</p>
                            <p className="text-sm text-red-200 mt-1">Create a custom offer to re-engage this customer</p>
                          </div>
                          <motion.button
                            onClick={() => window.location.href = `/sales/dashboard/create-offer/${request._id}`}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all font-bold shadow-lg text-lg"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            💰 Create Custom Offer
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </SalesGuard>
  );
}
