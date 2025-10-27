'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function GlassCard({ children, className, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/70 dark:bg-gray-900/70',
        'backdrop-blur-xl border border-white/20 dark:border-gray-700/20',
        'shadow-lg shadow-black/5 dark:shadow-black/50',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent dark:from-white/5" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
