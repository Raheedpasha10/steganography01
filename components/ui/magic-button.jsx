'use client'

import { motion } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const MagicButton = forwardRef(({ 
  children, 
  className, 
  variant = 'default',
  size = 'default',
  disabled,
  ...props 
}, ref) => {
  const variants = {
    default: 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90',
    ghost: 'bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10',
    outline: 'border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'rounded-xl font-medium transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
})

MagicButton.displayName = 'MagicButton'

export { MagicButton }
