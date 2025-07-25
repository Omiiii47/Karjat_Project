'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDateString } from '@/utils/helpers';

interface Trip {
  id: string;
  villa: {
    id: string;
    name: string;
    location: string;
    images: string[];
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancellingTrip, setCancellingTrip] = useState<string | null>(null);

  const cancelTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to cancel this trip? This action cannot be undone.')) {
      return;
    }

    try {
      setCancellingTrip(tripId);
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          tripId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the trip status locally
        setTrips(prevTrips => 
          prevTrips.map(trip => 
            trip.id === tripId 
              ? { ...trip, status: 'cancelled' as const }
              : trip
          )
        );
        alert('Trip cancelled successfully');
      } else {
        alert('Failed to cancel trip. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling trip:', error);
      alert('An error occurred while cancelling the trip.');
    } finally {
      setCancellingTrip(null);
    }
  };

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/trips');
        const data = await response.json();
        
        if (data.success) {
          setTrips(data.trips);
        } else {
          console.error('Failed to fetch trips:', data.error);
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const upcomingTrips = trips.filter(trip => new Date(trip.checkIn) >= new Date());
  const pastTrips = trips.filter(trip => new Date(trip.checkOut) < new Date());
  const currentTrips = activeTab === 'upcoming' ? upcomingTrips : pastTrips;

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
            Your Trips
          </h1>
          <p className="text-gray-600">
            Manage your villa bookings and trip history
          </p>
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
            Upcoming ({upcomingTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'past'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Past Trips ({pastTrips.length})
          </button>
        </div>

        {/* Trips List */}
        {currentTrips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} trips
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming trips. Start planning your next getaway!"
                : "You haven't completed any trips yet."
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
            {currentTrips.map((trip) => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                onCancel={cancelTrip}
                isCancelling={cancellingTrip === trip.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ 
  trip, 
  onCancel, 
  isCancelling 
}: { 
  trip: Trip; 
  onCancel: (tripId: string) => Promise<void>;
  isCancelling: boolean;
}) {
  const isUpcoming = new Date(trip.checkIn) >= new Date();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-48 h-48 md:h-auto relative">
          <Image
            src={trip.villa.images[0] || '/villa.jpg'}
            alt={trip.villa.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-gray-900">
              {trip.villa.name}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              trip.status === 'confirmed' && isUpcoming
                ? 'bg-green-100 text-green-800' 
                : trip.status === 'completed'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {trip.status === 'confirmed' && isUpcoming ? 'Confirmed' : 
               trip.status === 'completed' ? 'Completed' : 'Cancelled'}
            </span>
          </div>

          <p className="text-gray-600 mb-4 flex items-center">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {trip.villa.location}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Check-in: {formatDateString(trip.checkIn)}
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Check-out: {formatDateString(trip.checkOut)}
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 01-3 0m3 0V9a1.5 1.5 0 013 0v1.5zM21 15a6 6 0 00-9 5.197V21z" />
              </svg>
              {trip.guests} guests
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-2xl font-bold text-gray-900">
              ₹{trip.totalAmount.toLocaleString()}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Link
                href={`/villa/${trip.villa.id}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                View Villa
              </Link>
              {isUpcoming && trip.status === 'confirmed' && (
                <button 
                  onClick={() => onCancel(trip.id)}
                  disabled={isCancelling}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isCancelling ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full mr-2"></div>
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Booking'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
