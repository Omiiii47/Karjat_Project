'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Villa } from '@/types/villa';
import { sampleVillas } from '@/utils/helpers';
import VillaGallery from '@/components/VillaGallery';
import VillaInfo from '@/components/VillaInfo';
import BookingForm from '@/components/BookingForm';

export default function VillaDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);

  const villaId = params.id as string;
  const shouldShowBooking = searchParams.get('book') === 'true';

  useEffect(() => {
    fetchVilla();
  }, [villaId]);

  const fetchVilla = async () => {
    try {
      const response = await fetch(`/api/villas/${villaId}`);
      if (response.ok) {
        const villaData = await response.json();
        setVilla(villaData);
      } else {
        // Fallback to sample villas
        const foundVilla = sampleVillas.find(v => v.id === villaId);
        setVilla(foundVilla || null);
      }
    } catch (error) {
      console.error('Error fetching villa:', error);
      // Fallback to sample villas
      const foundVilla = sampleVillas.find(v => v.id === villaId);
      setVilla(foundVilla || null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading villa details...</p>
        </div>
      </div>
    );
  }

  if (!villa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Villa Not Found</h1>
          <p className="text-gray-600 mb-8">The villa you're looking for doesn't exist.</p>
          <a
            href="/villas"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Villas
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <VillaGallery images={villa.images} villaName={villa.name} />
            <VillaInfo villa={villa} />
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Book Your Stay
              </h3>
              
              <BookingForm
                villaId={villa.id}
                villaName={villa.name}
                pricePerNight={villa.price}
                maxGuests={villa.maxGuests}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}