'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Floating Particles Background */}
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

      <div className="relative z-10 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 border border-white/20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              About Solscape
            </motion.h1>
            
            <motion.div 
              className="text-center space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <p className="text-white/90 text-xl leading-relaxed">
                Welcome to Solscape, your premier destination for luxury villa rentals. 
                We specialize in curating exceptional vacation experiences through our 
                carefully selected portfolio of stunning villas worldwide.
              </p>
              
              <p className="text-white/80 text-lg leading-relaxed">
                Our mission is to provide travelers with unforgettable stays in some of 
                the world's most beautiful locations. Each villa in our collection is 
                handpicked for its unique character, exceptional amenities, and 
                breathtaking surroundings.
              </p>
              
              <p className="text-white/80 text-lg leading-relaxed">
                Whether you're seeking a beachfront escape, a mountain retreat, or an 
                urban sanctuary, we have the perfect villa to make your vacation dreams 
                come true.
              </p>
            </motion.div>

            {/* Simple Feature Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-5xl mb-4">�️</div>
                <h3 className="text-xl font-semibold text-white mb-3">Premium Locations</h3>
                <p className="text-white/70">Handpicked villas in the world's most stunning destinations</p>
              </motion.div>

              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-5xl mb-4">⭐</div>
                <h3 className="text-xl font-semibold text-white mb-3">Luxury Experience</h3>
                <p className="text-white/70">Exceptional amenities and five-star service for every guest</p>
              </motion.div>

              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-5xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold text-white mb-3">Global Collection</h3>
                <p className="text-white/70">Discover amazing villas across beautiful destinations worldwide</p>
              </motion.div>
            </motion.div>

            {/* Call to Action */}
            <motion.div 
              className="text-center mt-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <motion.a
                href="/villas"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">Explore Our Villas</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
