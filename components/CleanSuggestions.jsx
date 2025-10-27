'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, X, Wand2 } from 'lucide-react'
import { getAutoFillPreview } from '@/lib/auto-extend'

export default function CleanSuggestions({ 
  coverText, 
  secretMessage, 
  selectedTechnique, 
  capacity,
  capacities,
  onTechniqueSwitch,
  techniqueModule,
  onAutoFill
}) {
  const [dismissed, setDismissed] = useState(false)
  
  // Reset dismissed state when technique changes
  useEffect(() => {
    setDismissed(false)
  }, [selectedTechnique])

  const analysis = useMemo(() => {
    if (!coverText || !secretMessage) return null
    
    const words = coverText.toLowerCase().split(/\s+/)
    const chars = Array.from(coverText)
    
    return {
      words: words.length,
      chars: chars.length,
      spaces: coverText.split(' ').length - 1,
      latinChars: (coverText.match(/[aeiopcxyABCEHKMOPTXY]/g) || []).length,
      synonymWords: words.filter(w => ['good', 'bad', 'big', 'small', 'happy', 'sad', 'fast', 'slow'].includes(w)).length,
      punctuation: (coverText.match(/[,;.!?'"]/g) || []).length,
      commas: (coverText.match(/,/g) || []).length,
      accentedChars: (coverText.match(/[àáâãäåèéêëìíîïòóôõöùúûüýÿñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸÑÇ]/g) || []).length,
    }
  }, [coverText, secretMessage])

  // Get auto-fill preview
  const autoFillPreview = useMemo(() => {
    if (!techniqueModule || !coverText || !secretMessage) return null
    return getAutoFillPreview(coverText, secretMessage, selectedTechnique, techniqueModule)
  }, [coverText, secretMessage, selectedTechnique, techniqueModule])

  if (!analysis || !selectedTechnique || dismissed) return null
  
  const currentCapacity = capacity || 0
  const messageLength = secretMessage.length
  const isOk = currentCapacity >= messageLength
  
  // Generate single most relevant suggestion
  const getSuggestion = () => {
    const needed = messageLength - currentCapacity
    
    // If capacity is sufficient, show success
    if (isOk) {
      return {
        type: 'success',
        icon: CheckCircle2,
        title: 'Perfect!',
        text: `${currentCapacity} bytes available`,
        color: 'green',
      }
    }
    
    // Don't auto-suggest switching techniques - just show auto-fill
    // This prevents the infinite loop issue
    
    // Technique-specific suggestions
    switch (selectedTechnique) {
      case 'zero-width':
        return {
          type: 'warning',
          icon: AlertCircle,
          title: 'Add more text',
          text: `Need ~${Math.ceil(needed * 4)} more characters`,
          color: 'orange',
        }
      
      case 'whitespace':
        return {
          type: 'warning',
          icon: AlertCircle,
          title: 'Add more words',
          text: `Need ~${Math.ceil(needed * 8)} more words`,
          color: 'orange',
        }
      
      case 'homoglyph':
        if (analysis.latinChars === 0) {
          return {
            type: 'warning',
            icon: AlertCircle,
            title: 'Use Latin letters',
            text: 'Add a, e, o, c, p, x, y',
            color: 'orange',
          }
        }
        return {
          type: 'warning',
          icon: AlertCircle,
          title: 'More Latin letters needed',
          text: `Current: ${analysis.latinChars}, need ~${Math.ceil(needed * 8)} more`,
          color: 'orange',
        }
      
      case 'synonym':
        return {
          type: 'warning',
          icon: AlertCircle,
          title: 'Use synonym words',
          text: 'Add: good, bad, big, small, happy, sad',
          color: 'orange',
        }
      
      case 'frequency':
        return {
          type: 'warning',
          icon: AlertCircle,
          title: 'Add spaces',
          text: `Need ~${Math.ceil(needed * 8)} more words`,
          color: 'orange',
        }
      
      case 'punctuation':
        if (analysis.punctuation === 0) {
          return {
            type: 'warning',
            icon: AlertCircle,
            title: 'Add punctuation',
            text: 'Use commas, periods, quotes',
            color: 'orange',
          }
        }
        return {
          type: 'warning',
          icon: AlertCircle,
          title: 'More punctuation needed',
          text: `Current: ${analysis.punctuation}, need ~${Math.ceil(needed * 8)} more`,
          color: 'orange',
        }
      
      case 'unicode-normalization':
        if (analysis.accentedChars === 0) {
          return {
            type: 'warning',
            icon: AlertCircle,
            title: 'Add accented characters',
            text: 'Use: café, résumé, naïve, señor',
            color: 'orange',
          }
        }
        return {
          type: 'warning',
          icon: AlertCircle,
          title: 'More accents needed',
          text: `Current: ${analysis.accentedChars}`,
          color: 'orange',
        }
      
      case 'invisible-ink':
        return {
          type: 'warning',
          icon: AlertCircle,
          title: 'Add more characters',
          text: `Need ~${Math.ceil(needed * 8)} more`,
          color: 'orange',
        }
      
      default:
        return null
    }
  }
  
  const suggestion = getSuggestion()
  if (!suggestion) return null
  
  const colorClasses = {
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
  }
  
  const iconColorClasses = {
    green: 'text-emerald-500',
    blue: 'text-blue-500',
    orange: 'text-orange-500',
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-3"
      >
        <div 
          className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border ${colorClasses[suggestion.color]} ${
            suggestion.action ? 'cursor-pointer hover:scale-[1.01] transition-transform' : ''
          }`}
          onClick={suggestion.action}
        >
          <suggestion.icon className={`w-5 h-5 flex-shrink-0 ${iconColorClasses[suggestion.color]}`} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">{suggestion.title}</div>
            <div className="text-xs opacity-80">{suggestion.text}</div>
          </div>
          {suggestion.type !== 'success' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setDismissed(true)
              }}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Auto-fill button when text is insufficient */}
        {!isOk && autoFillPreview && onAutoFill && (
          <motion.button
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={(e) => {
              e.stopPropagation()
              onAutoFill(autoFillPreview.fullExtension)
            }}
            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all font-medium text-sm shadow-lg hover:shadow-xl"
          >
            <Wand2 className="w-4 h-4" />
            <span>Auto-Fill Text ({autoFillPreview.wordsNeeded} words)</span>
            <Sparkles className="w-4 h-4" />
          </motion.button>
        )}
        
        {/* Minimal capacity indicator */}
        <div className="mt-2 px-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{currentCapacity} bytes</span>
            <span>{messageLength} bytes needed</span>
          </div>
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (currentCapacity / messageLength) * 100)}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isOk ? 'bg-emerald-500' : 'bg-orange-500'
              }`}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
