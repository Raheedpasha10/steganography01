'use client'

import { motion } from 'framer-motion'

export default function AnimatedCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 400,
        damping: 30,
        delay 
      }}
      whileHover={{ 
        y: -4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        transition: { duration: 0.2 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}