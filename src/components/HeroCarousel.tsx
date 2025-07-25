'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroCarouselProps {
  images: string[];
  autoSlideInterval?: number;
}

export default function HeroCarousel({ 
  images, 
  autoSlideInterval = 3000 
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState<number[]>([]);

  // Debug logging
  useEffect(() => {
    console.log('HeroCarousel received images:', images);
    console.log('Current image:', images[currentIndex]);
  }, [images, currentIndex]);

  useEffect(() => {
    if (images.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [images.length, autoSlideInterval]);

  const handleImageError = (index: number) => {
    console.error('Image failed to load:', images[index]);
    setImageLoadError(prev => [...prev, index]);
  };

  const handleImageLoad = (index: number) => {
    console.log('Image loaded successfully:', images[index]);
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">No images to display</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={images[currentIndex]}
            alt={`Villa image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onLoad={() => handleImageLoad(currentIndex)}
            onError={() => handleImageError(currentIndex)}
            style={{
              display: imageLoadError.includes(currentIndex) ? 'none' : 'block'
            }}
          />
          
          {/* Fallback content if image fails to load */}
          {imageLoadError.includes(currentIndex) && (
            <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-4">Luxury Villa</h2>
                <p className="text-xl">Experience Paradise</p>
              </div>
            </div>
          )}
          
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-20" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
