'use client';

import { useState, useEffect } from 'react';
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
  const router = useRouter();

  // Auto-swipe functionality
  useEffect(() => {
    if (isUserInteracting) return; // Don't auto-swipe if user is interacting

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        return nextIndex >= villas.length ? 0 : nextIndex;
      });
      setTimeLeft(autoSwipeInterval); // Reset timer
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
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-500 text-xl">No villas available</p>
      </div>
    );
  }

  const currentVilla = villas[currentIndex];
  const progressPercentage = ((autoSwipeInterval - timeLeft) / autoSwipeInterval) * 100;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {currentVilla && (
        <div onTouchStart={handleUserTouch} onMouseDown={handleUserTouch}>
          <VillaCard
            key={`${currentVilla.id}-${currentIndex}`}
            villa={currentVilla}
            onSwipe={handleSwipe}
            onCardClick={handleCardClick}
            onBookClick={handleBookClick}
          />
        </div>
      )}
    </div>
  );
}
