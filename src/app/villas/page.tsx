'use client';

import { useState, useEffect } from 'react';
import SwipeDeck from '../../components/SwipeDeck';
import { sampleVillas } from '../../utils/helpers';

interface Villa {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  images: string[];
  features: string[];
  amenities: string[];
}

export default function VillasPage() {
  const [villas, setVillas] = useState<Villa[]>(sampleVillas);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVillas();
  }, []);

  const fetchVillas = async () => {
    try {
      const response = await fetch('/api/villas');
      if (response.ok) {
        const data = await response.json();
        if (data.villas && data.villas.length > 0) {
          setVillas(data.villas);
        } else {
          // Fallback to sample villas if no villas in database
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

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-lg">Loading villas...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden fixed inset-0">
      <SwipeDeck villas={villas} />
    </div>
  );
}
