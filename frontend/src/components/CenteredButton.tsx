'use client';

import { motion } from 'framer-motion';

interface CenteredButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
}

export default function CenteredButton({ 
  text, 
  onClick, 
  className = '' 
}: CenteredButtonProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`
          bg-white text-black font-semibold 
          px-8 py-4 rounded-full 
          shadow-lg hover:shadow-xl 
          transition-all duration-300
          text-lg md:text-xl
          ${className}
        `}
      >
        {text}
      </motion.button>
    </div>
  );
}
