'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Villa } from '../types/villa';
import VillaCard from './VillaCard';

interface SwipeDeckProps {
  villas: Villa[];
  autoSwipeInterval?: number;
}

export default function SwipeDeck({ villas, autoSwipeInterval = 5000 }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(autoSwipeInterval);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const router = useRouter();

  // Auto-swipe functionality
  useEffect(() => {
    if (isUserInteracting) return; // Don't auto-swipe if user is interacting

    const timer = setInterval(() => {
      setSwipeDirection('right'); // Set direction for animation
      setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          return nextIndex >= villas.length ? 0 : nextIndex;
        });
        setTimeLeft(autoSwipeInterval); // Reset timer
        setSwipeDirection(null); // Clear direction after animation
      }, 100); // Small delay to ensure animation plays
    }, autoSwipeInterval);

    return () => clearInterval(timer);
  }, [villas.length, autoSwipeInterval, isUserInteracting]);

  // Progress timer
  useEffect(() => {
    if (isUserInteracting) return;

    const progressTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          return autoSwipeInterval;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(progressTimer);
  }, [autoSwipeInterval, isUserInteracting]);

  // Reset user interaction after delay
  useEffect(() => {
    if (isUserInteracting) {
      const timeout = setTimeout(() => {
        setIsUserInteracting(false);
        setTimeLeft(autoSwipeInterval);
      }, 2000); // Resume auto-swipe after 2 seconds of no interaction

      return () => clearTimeout(timeout);
    }
  }, [isUserInteracting, autoSwipeInterval]);

  const handleSwipe = (direction: 'left' | 'right') => {
    setIsUserInteracting(true);
    setSwipeDirection(direction);
    
    // Add a small delay for animation effect
    setTimeout(() => {
      if (direction === 'right') {
        // Swipe right - go to next villa
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex >= villas.length ? 0 : nextIndex);
      } else if (direction === 'left') {
        // Swipe left - go to previous villa
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex < 0 ? villas.length - 1 : prevIndex);
      }
      setTimeLeft(autoSwipeInterval);
      setSwipeDirection(null);
    }, 200);
  };

  const handleCardClick = () => {
    setIsUserInteracting(true);
    const villa = villas[currentIndex];
    router.push(`/villa/${villa.id}`);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsUserInteracting(true);
    const villa = villas[currentIndex];
    router.push(`/villa/${villa.id}?book=true`);
  };

  const handleUserTouch = () => {
    setIsUserInteracting(true);
  };

  if (!villas.length) {
    return (
      <motion.div 
        className="w-full h-screen flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏖️
          </motion.div>
          <p className="text-gray-300 text-xl">No villas available</p>
          <p className="text-gray-500 text-sm mt-2">Check back soon for amazing properties!</p>
        </motion.div>
      </motion.div>
    );
  }

  const currentVilla = villas[currentIndex];
  const progressPercentage = ((autoSwipeInterval - timeLeft) / autoSwipeInterval) * 100;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Progress indicators */}
      <motion.div 
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex space-x-2">
          {villas.map((_, index) => (
            <motion.div
              key={index}
              className="relative w-12 h-1 bg-white/20 rounded-full overflow-hidden"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ 
                  scaleX: index === currentIndex ? progressPercentage / 100 : (index < currentIndex ? 1 : 0)
                }}
                transition={{ duration: 0.3 }}
              />
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 bg-white/30 rounded-full"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Villa counter with animation */}
      <motion.div
        className="absolute top-6 left-6 z-30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div 
          className="bg-black/30 backdrop-blur-md rounded-full px-4 py-2 text-white font-semibold text-sm"
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <motion.span
            key={currentIndex}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentIndex + 1} / {villas.length}
          </motion.span>
        </motion.div>
      </motion.div>



      {/* Main villa card with enhanced animations */}
      <AnimatePresence mode="wait">
        {currentVilla && (
          <motion.div
            key={`villa-${currentVilla.id}-${currentIndex}`}
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              rotateY: swipeDirection === 'right' ? -30 : (swipeDirection === 'left' ? 30 : 0),
              x: swipeDirection === 'right' ? 100 : (swipeDirection === 'left' ? -100 : 0)
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotateY: 0,
              x: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              rotateY: swipeDirection === 'right' ? 30 : (swipeDirection === 'left' ? -30 : 0),
              x: swipeDirection === 'right' ? -100 : (swipeDirection === 'left' ? 100 : 0)
            }}
            transition={{ 
              duration: 0.6, 
              ease: [0.22, 1, 0.36, 1],
              scale: { type: "spring", damping: 20, stiffness: 300 }
            }}
            className="w-full h-full"
            onTouchStart={handleUserTouch} 
            onMouseDown={handleUserTouch}
          >
            <VillaCard
              villa={currentVilla}
              onSwipe={handleSwipe}
              onCardClick={handleCardClick}
              onBookClick={handleBookClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
