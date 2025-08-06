'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, PanInfo } from 'framer-motion';
import { Villa } from '@/types/villa';
import { formatPrice } from '@/utils/helpers';

interface VillaCardProps {
  villa: Villa;
  onSwipe: (direction: 'left' | 'right') => void;
  onCardClick: () => void;
  onBookClick: (e: React.MouseEvent) => void;
}

export default function VillaCard({ 
  villa, 
  onSwipe, 
  onCardClick, 
  onBookClick 
}: VillaCardProps) {
  const [dragX, setDragX] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      onSwipe('left'); // Swipe right goes to previous (left)
    } else if (info.offset.x < -threshold) {
      onSwipe('right'); // Swipe left goes to next (right)
    }
  };

  const nextImage = () => {
    if (villa.images && villa.images.length > 0) {
      setCurrentImageIndex((prev) => 
        (prev + 1) % villa.images.length
      );
    }
  };
  
  const prevImage = () => {
    if (villa.images && villa.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? villa.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center p-4">
      <motion.div 
        className="relative w-full max-w-md h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105"
        onClick={onCardClick}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={(event, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
      >
        {/* Image Section */}
        <div className="relative h-80 overflow-hidden rounded-t-3xl">
          <Image
            src={
              !imageError && villa.images && villa.images.length > 0 
                ? villa.images[currentImageIndex] 
                : '/villa.jpg'
            }
            alt={villa.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            priority
          />
          
          {/* Image Navigation */}
          {villa.images && villa.images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                ←
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                →
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {villa.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Price Badge */}
          <div className="absolute top-4 right-4 z-20 bg-blue-600 text-white px-3 py-1 rounded-full font-bold">
            {formatPrice(villa.price || 0)}/night
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{villa.name}</h3>
            <p className="text-gray-600">📍 {villa.location}</p>
          </div>
          
          <p className="text-gray-700 line-clamp-2">{villa.description}</p>
          
          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {villa.amenities?.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                {amenity}
              </span>
            ))}
          </div>
          
          {/* Max Guests */}
          <div className="text-sm text-gray-600">
            👥 Up to {villa.maxGuests || 2} guests
          </div>
          
          {/* Action Button */}
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-colors"
            onClick={onBookClick}
          >
            Book This Villa
          </button>
        </div>
      </motion.div>
    </div>
  );
}
