'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeDeck from '../../components/SwipeDeck';
import { sampleVillas } from '../../utils/helpers';
import { Villa } from '@/types/villa';
import Link from 'next/link';
import Image from 'next/image';

function VillaImageGallery({ villa }: { villa: Villa }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const previousImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : villa.images.length - 1));
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev < villa.images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="relative h-full aspect-[16/9] max-w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${villa.id}-${selectedImageIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="relative w-full h-full rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
        >
          <Image
            src={villa.images[selectedImageIndex]}
            alt={`${villa.name} - Image ${selectedImageIndex + 1}`}
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {villa.images.length > 1 && (
        <>
          <motion.button
            onClick={previousImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg z-10"
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-2xl">←</span>
          </motion.button>

          <motion.button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg z-10"
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-2xl">→</span>
          </motion.button>
        </>
      )}

      {/* Image Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20 z-10">
        {selectedImageIndex + 1} / {villa.images.length}
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        {villa.images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImageIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === selectedImageIndex
                ? 'bg-white w-6'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function VillasPage() {
  const [villas, setVillas] = useState<Villa[]>(sampleVillas);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchVillas();
  }, []);

  const fetchVillas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/villas');
      if (response.ok) {
        const data = await response.json();
        if (data.villas && data.villas.length > 0) {
          setVillas(data.villas);
        } else {
          setVillas(sampleVillas);
        }
      } else {
        console.error('Failed to fetch villas, using sample data');
        setVillas(sampleVillas);
      }
    } catch (error) {
      console.error('Error fetching villas:', error);
      setVillas(sampleVillas);
    } finally {
      setLoading(false);
    }
  };

  const previousVilla = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : villas.length - 1));
  };

  const nextVilla = () => {
    setCurrentIndex((prev) => (prev < villas.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900">
        {/* Animated Loading Screen */}
        <div className="text-center">
          <motion.div
            className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Discovering Amazing Villas</h2>
            <p className="text-gray-300">Loading your perfect getaway...</p>
          </motion.div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                  scale: [1, 1.5, 1],
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
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - Swipe Deck */}
      <motion.div 
        className="lg:hidden w-full h-screen overflow-hidden fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
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

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full h-full"
        >
          <SwipeDeck villas={villas} />
        </motion.div>
      </motion.div>

      {/* Desktop View - Grid with Side Navigation */}
      <div className="hidden lg:block min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background */}
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

        <div className="relative z-10 max-w-[1800px] mx-auto px-16 py-12">
          {/* Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Discover Your Perfect Villa
            </h1>
          </motion.div>

          {/* Main Content Area - Side by Side Layout */}
          <motion.div
            className="flex gap-12 items-stretch"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Left Side - Villa Images */}
            <div className="flex-[1.2] flex items-center justify-start">
              <VillaImageGallery villa={villas[currentIndex]} />
            </div>

            {/* Right Side - Villa Information */}
            <div className="flex-[0.8]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-13 shadow-2xl h-full flex flex-col"
                >
                  <div className="flex-1">
                    <h2 className="text-4xl font-bold text-white mb-4">
                      {villas[currentIndex].name}
                    </h2>
                    
                    <div className="flex items-center text-white/70 mb-6">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {villas[currentIndex].location}
                    </div>

                    <p className="text-white/80 text-lg mb-8 leading-relaxed">
                      {villas[currentIndex].description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <p className="text-white/60 text-base mb-2">Max Guests</p>
                        <p className="text-white text-3xl font-bold">{villas[currentIndex].maxGuests}</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <p className="text-white/60 text-base mb-2">Price per night</p>
                        <p className="text-white text-3xl font-bold">₹{villas[currentIndex].price.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-8">
                      {villas[currentIndex].amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium border border-blue-400/30"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link href={`/villa/${villas[currentIndex].id}`}>
                    <motion.button
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl text-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Book Now
                    </motion.button>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            className="flex justify-between items-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              onClick={previousVilla}
              disabled={currentIndex === 0}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-lg group transition-all duration-300 ${
                currentIndex === 0
                  ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'
              }`}
              whileHover={currentIndex > 0 ? { scale: 1.05, x: -5 } : {}}
              whileTap={currentIndex > 0 ? { scale: 0.95 } : {}}
            >
              <span className="text-2xl">←</span>
              <span className="font-semibold text-lg">Previous Villa</span>
            </motion.button>

            <div className="flex items-center gap-3">
              {villas.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'bg-blue-500 w-8'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            <motion.button
              onClick={nextVilla}
              disabled={currentIndex === villas.length - 1}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-lg group transition-all duration-300 ${
                currentIndex === villas.length - 1
                  ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'
              }`}
              whileHover={currentIndex < villas.length - 1 ? { scale: 1.05, x: 5 } : {}}
              whileTap={currentIndex < villas.length - 1 ? { scale: 0.95 } : {}}
            >
              <span className="font-semibold text-lg">Next Villa</span>
              <span className="text-2xl">→</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
