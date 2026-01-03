'use client';

import { motion } from 'framer-motion';
import { Villa } from '@/types/villa';
import { formatPrice } from '@/utils/helpers';

interface VillaInfoProps {
  villa: Villa;
}

export default function VillaInfo({ villa }: VillaInfoProps) {
  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-white mb-2"
            animate={{ opacity: [1, 0.8, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {villa.name}
          </motion.h1>
          <p className="text-lg text-white/80 mb-4 flex items-center">
            <span className="mr-2">📍</span>
            {villa.location}
          </p>
          <p className="text-2xl font-semibold text-white">
            {formatPrice(villa.price)} <span className="text-lg font-normal text-white/70">/ night</span>
          </p>
        </motion.div>

        {/* Villa details */}
        <motion.div 
          className="grid grid-cols-3 gap-4 py-4 border-y border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-2xl font-semibold text-white">{villa.bedrooms}</p>
            <p className="text-sm text-white/70">Bedrooms</p>
          </motion.div>
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-2xl font-semibold text-white">{villa.bathrooms}</p>
            <p className="text-sm text-white/70">Bathrooms</p>
          </motion.div>
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-2xl font-semibold text-white">{villa.maxGuests}</p>
            <p className="text-sm text-white/70">Guests</p>
          </motion.div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
          <p className="text-white/80 leading-relaxed">{villa.description}</p>
        </motion.div>

        {/* Features */}
        {villa.features.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-white mb-3">Features</h2>
            <div className="flex flex-wrap gap-2">
              {villa.features.map((feature, index) => (
                <motion.span
                  key={index}
                  className="bg-blue-500/30 text-blue-200 border border-blue-400/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.4)' }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Amenities */}
        {villa.amenities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-white mb-3">Amenities</h2>
            <div className="grid grid-cols-2 gap-2">
              {villa.amenities.map((amenity, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <motion.span 
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  ></motion.span>
                  <span className="text-white/80">{amenity}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
