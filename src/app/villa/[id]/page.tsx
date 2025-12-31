'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
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
  const [customOfferDetails, setCustomOfferDetails] = useState<any>(null);

  // Handle params safely - it might be a Promise in newer Next.js
  const villaId = typeof params === 'object' && 'id' in params ? params.id as string : '';
  const shouldShowBooking = searchParams.get('book') === 'true';
  const paymentOnly = searchParams.get('paymentOnly') === 'true';
  const customOffer = searchParams.get('customOffer') === 'true';
  const bookingRequestId = searchParams.get('bookingRequestId');

  useEffect(() => {
    fetchVilla();
  }, [villaId]);

  useEffect(() => {
    if (customOffer && bookingRequestId) {
      loadCustomOfferDetails(bookingRequestId);
    }
  }, [customOffer, bookingRequestId]);

  const loadCustomOfferDetails = async (requestId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/booking/request/${requestId}`);
      const data = await response.json();
      
      if (data.success && data.bookingRequest) {
        setCustomOfferDetails(data.bookingRequest);
      }
    } catch (error) {
      console.error('Error loading custom offer details:', error);
    }
  };

  const fetchVilla = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/villa/${villaId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.villa) {
          // Transform backend data to match frontend format
          const transformedVilla = {
            id: data.villa._id,
            name: data.villa.name,
            description: data.villa.description,
            price: data.villa.price,
            location: data.villa.location,
            bedrooms: data.villa.bedrooms,
            bathrooms: data.villa.bathrooms,
            maxGuests: data.villa.maxGuests,
            images: data.villa.images?.filter((img: string) => img && img.trim() !== '') || [],
            features: data.villa.features || [],
            amenities: data.villa.amenities || []
          };
          setVilla(transformedVilla);
        } else {
          console.error('Villa not found in backend');
          setVilla(null);
        }
      } else {
        console.error('Failed to fetch villa from backend');
        setVilla(null);
      }
    } catch (error) {
      console.error('Error fetching villa:', error);
      setVilla(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Floating Particles Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-30">
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
          className="text-center relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-white/90 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading villa details...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!villa) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Floating Particles Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-30">
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
          className="text-center max-w-md mx-auto px-6 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-6xl mb-6"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏖️
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold text-white mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Villa Not Found
          </motion.h1>
          <motion.p 
            className="text-white/80 mb-8 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            The villa you're looking for doesn't exist.
          </motion.p>
          <motion.a
            href="/villas"
            className="inline-block bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full hover:bg-white/30 transition-all duration-300 font-medium border border-white/30"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Browse Villas
          </motion.a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Floating Particles Background - Enhanced */}
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

      {/* Header */}
      <motion.div 
        className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.button
            onClick={() => window.history.back()}
            className="flex items-center text-white/80 hover:text-white transition-colors group"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="text-xl mr-2"
              animate={{ x: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ←
            </motion.span>
            <span className="font-medium">Back to Villas</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <VillaGallery images={villa.images} villaName={villa.name} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <VillaInfo villa={villa} />
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 sticky top-8 border border-white/20"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <BookingForm
                  villaId={villa.id}
                  villaName={villa.name}
                  pricePerNight={customOfferDetails?.customOffer?.adjustedPricePerNight || villa.price}
                  maxGuests={villa.maxGuests}
                  paymentOnly={paymentOnly}
                  customOffer={customOffer}
                  customOfferDetails={customOfferDetails}
                  existingBookingRequestId={bookingRequestId || undefined}
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}