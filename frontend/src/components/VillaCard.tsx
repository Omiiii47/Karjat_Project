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
    <div className="relative w-full h-screen flex items-center justify-center p-4 pt-22">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={(event, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.02 }}
        className="relative w-full max-w-md h-[645px] bg-white rounded-3xl shadow-2xl overflow-hidden cursor-pointer"
        onClick={onCardClick}
        style={{ x: dragX }}
      >
        <img
          src={
            !imageError && villa.images && villa.images.length > 0 
              ? villa.images[currentImageIndex]
              : '/villa.jpg'
          }
          alt={villa.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <motion.h2 
            className="text-2xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {villa.name}
          </motion.h2>
          
          <motion.p 
            className="text-lg mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
        📍{villa.location}
          </motion.p>
          
          <motion.p 
            className="text-xl font-semibold mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {formatPrice(villa.price || 0)}/night
          </motion.p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBookClick}
            className="
              bg-white text-black font-semibold 
              px-6 py-3 rounded-full 
              shadow-lg hover:shadow-xl 
              transition-all duration-300
            "
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Book Now
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
