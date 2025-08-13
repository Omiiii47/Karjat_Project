'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeDeck from '../../components/SwipeDeck';
import { sampleVillas } from '../../utils/helpers';
import { Villa } from '@/types/villa';

export default function VillasPage() {
  const [villas, setVillas] = useState<Villa[]>(sampleVillas);
  const [loading, setLoading] = useState(false); // Changed from true to false
  const [error, setError] = useState('');

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
    <motion.div 
      className="w-full h-screen overflow-hidden fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated background elements - Floating Particles */}
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
        
        {/* Additional floating geometric shapes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute border border-white/10 ${
              i % 2 === 0 ? 'rounded-full' : 'rounded-lg rotate-45'
            }`}
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
        
        {/* Gradient orbs */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full mix-blend-multiply"
            style={{
              width: Math.random() * 300 + 200,
              height: Math.random() * 300 + 200,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                ['rgba(59, 130, 246, 0.1)', 'rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)', 'rgba(245, 158, 11, 0.1)'][i]
              }, transparent)`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Enhanced SwipeDeck with entry animation */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full h-full"
      >
        <SwipeDeck villas={villas} />
      </motion.div>
    </motion.div>
  );
}
