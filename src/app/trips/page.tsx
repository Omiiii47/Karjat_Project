'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  status: 'confirmed' | 'cancelled' | 'completed';
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
      const response = await fetch('/api/booking');
      const data = await response.json();
      
      if (data.bookings) {
        // Filter bookings by user if authenticated
        let userBookings = data.bookings;
        if (user) {
          userBookings = data.bookings.filter((booking: Booking) => 
            booking.userId === user._id || booking.guestEmail === user.email
          );
        }
        setBookings(userBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (checkInDate: string) => {
    return new Date(checkInDate) > new Date();
  };

  const upcomingBookings = bookings.filter(booking => 
    isUpcoming(booking.checkInDate) && booking.status !== 'cancelled'
  );
  
  const pastBookings = bookings.filter(booking => 
    !isUpcoming(booking.checkInDate) || booking.status === 'cancelled' || booking.status === 'completed'
  );

  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const getStatusColor = (status: string) => {
    switch(status) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Your Bookings
          </h1>
          <p className="text-gray-600">
            Manage your villa bookings and trip history
          </p>
          {!user && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <Link href="/login" className="font-medium underline hover:text-yellow-900">
                  Sign in
                </Link> to view your bookings, or check your email for booking confirmations.
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-lg p-1 mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'past'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Past Bookings ({pastBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {currentBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} bookings
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming bookings. Start planning your next getaway!"
                : "You haven't completed any bookings yet."
              }
            </p>
            {activeTab === 'upcoming' && (
              <Link
                href="/villas"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Villas
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentBookings.map((booking) => (
              <BookingCard 
                key={booking._id} 
                booking={booking}
                getDaysUntilCheckIn={getDaysUntilCheckIn}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ 
  booking, 
  getDaysUntilCheckIn,
  getStatusColor
}: { 
  booking: Booking; 
  getDaysUntilCheckIn: (date: string) => number;
  getStatusColor: (status: string) => string;
}) {
  const isUpcoming = new Date(booking.checkInDate) > new Date();
  const daysUntil = getDaysUntilCheckIn(booking.checkInDate);
  const numberOfNights = Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {booking.villaName}
            </h3>
            <p className="text-gray-600 text-sm">
              Booking Reference: <span className="font-mono font-medium">{booking.bookingReference}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            {isUpcoming && daysUntil > 0 && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {daysUntil} days to go
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Check-in</p>
            <p className="font-semibold text-gray-900">
              {new Date(booking.checkInDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Check-out</p>
            <p className="font-semibold text-gray-900">
              {new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Guests</p>
            <p className="font-semibold text-gray-900">{booking.numberOfGuests}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
            <p className="font-semibold text-gray-900">₹{booking.totalAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <span className="font-medium">{numberOfNights} night{numberOfNights > 1 ? 's' : ''}</span>
              <span className="mx-2">•</span>
              <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/villa/${booking.villaId}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Villa
              </Link>
              {isUpcoming && booking.status === 'confirmed' && (
                <button className="text-red-600 hover:text-red-800 font-medium ml-4">
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
