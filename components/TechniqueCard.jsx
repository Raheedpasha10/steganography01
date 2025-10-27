'use client'

import { motion } from 'framer-motion'
import { Zap, Wind, Copy, Type } from 'lucide-react'

const TECHNIQUE_ICONS = {
  'zero-width': Zap,
  'whitespace': Wind,
  'homoglyph': Copy,
  'unicode-normalization': Type,
}

const TECHNIQUE_COLORS = {
  'zero-width': 'from-blue-500 to-purple-500',
  'whitespace': 'from-green-500 to-teal-500',
  'homoglyph': 'from-orange-500 to-red-500',
  'unicode-normalization': 'from-pink-500 to-purple-500',
}

export default function TechniqueCard({ 
  technique, 
  selected, 
  onClick, 
  capacity,
  detectability = 'Low'
}) {
  const Icon = TECHNIQUE_ICONS[technique] || Zap
  const colorClass = TECHNIQUE_COLORS[technique] || 'from-gray-500 to-gray-700'
  
  const displayName = technique
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ 
        scale: 1.03,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        relative p-6 rounded-xl border-2 transition-all
        ${selected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClass}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-lg mb-1">{displayName}</h3>
          <div className="flex gap-2 text-sm">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              {capacity ? `~${capacity} bytes` : 'Variable'}
            </span>
            <span className={`px-2 py-1 rounded ${
              detectability === 'Low' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
              detectability === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              {detectability} Risk
            </span>
          </div>
        </div>
      </div>
      
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  )
}