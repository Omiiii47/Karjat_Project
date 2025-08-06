'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const heroImages = [
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
];

const features = [
  {
    icon: '🏖️',
    title: 'Luxury Locations',
    description: 'Handpicked villas in the world\'s most stunning destinations'
  },
  {
    icon: '⭐',
    title: 'Premium Amenities',
    description: 'Private pools, ocean views, and world-class facilities'
  },
  {
    icon: '🔒',
    title: 'Secure Booking',
    description: 'Safe and encrypted payment processing with instant confirmation'
  },
  {
    icon: '🕐',
    title: '24/7 Support',
    description: 'Dedicated concierge service throughout your entire stay'
  }
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();

  // Auto-change hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Trigger animations after component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Track mouse movement for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const parallaxX = (mousePosition.x - 0.5) * 20;
  const parallaxY = (mousePosition.y - 0.5) * 20;

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Images */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${heroImages[currentImageIndex]})`,
                  transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
                }}
              />
              <div className="absolute inset-0 bg-black/40" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear',
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 100 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                S
              </motion.span>
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 1.1 }}
              >
                o
              </motion.span>
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 1.2 }}
              >
                l
              </motion.span>
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 1.3 }}
              >
                s
              </motion.span>
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 1.4 }}
              >
                c
              </motion.span>
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 1.5 }}
              >
                a
              </motion.span>
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 1.6 }}
              >
                p
              </motion.span>
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 1.7 }}
              >
                e
              </motion.span>
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 1, delay: 2 }}
          >
            Escape to extraordinary luxury villas in breathtaking destinations. 
            Your perfect getaway awaits with premium amenities and unforgettable experiences.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            transition={{ duration: 1, delay: 2.5 }}
          >
            <Link
              href="/villas"
              className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <span className="relative z-10">Explore Villas</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <Link
              href="/about"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full transition-all duration-300 hover:bg-white hover:text-black hover:scale-105"
            >
              Learn More
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 1, delay: 3 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-1 h-3 bg-white rounded-full mt-2" />
          </motion.div>
        </motion.div>

        {/* Image indicators */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/30'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </section>

      {/* Features Section with Scroll Animations */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Why Choose Solscape?
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              We don't just offer accommodations – we curate extraordinary experiences
              that turn your vacation dreams into unforgettable memories.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                initial={{ opacity: 0, y: 100, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1]
                }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  y: -10
                }}
              >
                <motion.div 
                  className="text-5xl mb-4"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.15 + 0.3,
                    type: "spring",
                    bounce: 0.4
                  }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.2,
                    rotate: [0, 10, -10, 0],
                    transition: { duration: 0.6 }
                  }}
                >
                  {feature.icon}
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold text-white mb-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 + 0.5 }}
                  viewport={{ once: true }}
                >
                  {feature.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-300 leading-relaxed"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.15 + 0.7 }}
                  viewport={{ once: true }}
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Enhanced Scroll Animations */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900 to-purple-900 relative overflow-hidden">
        {/* Animated background elements on scroll */}
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
        >
          {/* Floating gradient orbs */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: 200 + i * 100,
                height: 200 + i * 100,
                background: `radial-gradient(circle, ${
                  ['rgba(59, 130, 246, 0.3)', 'rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.3)'][i]
                }, transparent)`,
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
              }}
              initial={{ scale: 0, rotate: 0 }}
              whileInView={{ 
                scale: [0, 1.2, 1], 
                rotate: 360,
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ 
                duration: 2, 
                delay: i * 0.3,
                ease: [0.22, 1, 0.36, 1]
              }}
              viewport={{ once: true }}
              animate={{
                rotate: [360, 720],
                scale: [1, 1.1, 1],
              }}
            />
          ))}
        </motion.div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: 30 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              animate={{
                textShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                  '0 0 30px rgba(139, 92, 246, 0.5)',
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                ],
              }}
              style={{ transition: 'text-shadow 3s ease-in-out infinite' }}
            >
              <motion.span
                initial={{ backgroundPosition: '0% 50%' }}
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  background: [
                    'linear-gradient(45deg, #ffffff, #3b82f6)',
                    'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                    'linear-gradient(45deg, #8b5cf6, #ffffff)',
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Ready for Your Escape?
              </motion.span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-200 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join thousands of travelers who have discovered their perfect getaway with Solscape. 
              Browse our curated collection of luxury villas and start planning your dream vacation today.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ 
                duration: 1, 
                delay: 0.6,
                type: "spring",
                bounce: 0.4
              }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/villas"
                className="group relative inline-block px-12 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
              >
                <motion.span
                  className="relative z-10 flex items-center"
                  whileHover={{ letterSpacing: '0.05em' }}
                  transition={{ duration: 0.3 }}
                >
                  Start Exploring
                  <motion.span
                    className="inline-block ml-2"
                    animate={{ x: [0, 5, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    →
                  </motion.span>
                </motion.span>
                
                {/* Animated background shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8 }}
                />
                
                {/* Pulsing glow effect */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-30"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated wave at bottom */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0"
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <svg className="w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <motion.path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="rgba(255,255,255,0.1)"
              animate={{
                d: [
                  "M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z",
                  "M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                ],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>
      </section>
    </div>
  );
}
