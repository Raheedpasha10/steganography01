'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Lock, Copy, Check, Loader2, ArrowLeft, Sparkles, Zap, ShieldCheck, Clipboard, Trash2 } from 'lucide-react'
import { getUser } from '@/lib/supabase'
import CleanSuggestions from '@/components/CleanSuggestions'
import { saveToLocalHistory } from '@/lib/local-history'
import * as zeroWidth from '@/lib/stego/zero-width'
import * as whitespace from '@/lib/stego/whitespace'
import * as homoglyph from '@/lib/stego/homoglyph'
import * as unicodeNorm from '@/lib/stego/unicode-norm'
import * as synonym from '@/lib/stego/synonym'
import * as frequency from '@/lib/stego/frequency'
import * as punctuation from '@/lib/stego/punctuation'
import * as invisibleInk from '@/lib/stego/invisible-ink'

const TECHNIQUES = {
  'zero-width': { module: zeroWidth, name: 'Zero-Width', icon: '⚡', color: 'from-purple-500 to-pink-500', desc: 'Invisible characters' },
  'whitespace': { module: whitespace, name: 'Whitespace', icon: '◌', color: 'from-cyan-500 to-blue-500', desc: 'Space manipulation' },
  'homoglyph': { module: homoglyph, name: 'Homoglyph', icon: '⊕', color: 'from-orange-500 to-red-500', desc: 'Similar characters' },
  'unicode-normalization': { module: unicodeNorm, name: 'Unicode', icon: 'Ü', color: 'from-violet-500 to-purple-500', desc: 'Accented chars' },
  'synonym': { module: synonym, name: 'Synonym', icon: '≈', color: 'from-gray-600 to-gray-700', desc: 'Word substitution' },
  'frequency': { module: frequency, name: 'Frequency', icon: '≋', color: 'from-gray-600 to-gray-700', desc: 'Character frequency' },
  'punctuation': { module: punctuation, name: 'Punctuation', icon: '¿', color: 'from-gray-600 to-gray-700', desc: 'Punctuation marks' },
  'invisible-ink': { module: invisibleInk, name: 'Invisible Ink', icon: '🎨', color: 'from-gray-600 to-gray-700', desc: 'Color coding' },
}

export default function EncodePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [coverText, setCoverText] = useState('')
  const [secretMessage, setSecretMessage] = useState('')
  const [selectedTechnique, setSelectedTechnique] = useState('zero-width')
  const [encodedText, setEncodedText] = useState('')
  const [encoding, setEncoding] = useState(false)
  const [copied, setCopied] = useState(false)
  const [capacities, setCapacities] = useState({})

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (coverText) {
      calculateCapacities()
    }
  }, [coverText])

  const checkAuth = async () => {
    try {
      const devMode = localStorage.getItem('devMode')
      if (devMode === 'enabled') {
        setUser({ id: 'dev-user', email: 'dev@local.com' })
        setLoading(false)
        return
      }
      const currentUser = await getUser()
      if (currentUser) {
        setUser(currentUser)
        setLoading(false)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      const devMode = localStorage.getItem('devMode')
      if (devMode === 'enabled') {
        setUser({ id: 'dev-user', email: 'dev@local.com' })
        setLoading(false)
      } else {
        router.push('/login')
      }
    }
  }

  const calculateCapacities = () => {
    const caps = {}
    Object.entries(TECHNIQUES).forEach(([key, { module }]) => {
      caps[key] = module.getCapacity(coverText)
    })
    setCapacities(caps)
  }

  const handleEncode = async () => {
    if (!coverText || !secretMessage || !selectedTechnique) return

    setEncoding(true)
    setEncodedText('')

    try {
      const technique = TECHNIQUES[selectedTechnique].module
      const useCompression = secretMessage.length > 20
      
      const result = technique.encode(coverText, secretMessage, {
        compress: useCompression,
      })

      if (result.success) {
        setEncodedText(result.encodedText)
        
        // Save to history
        await saveToHistory({
          type: 'encode',
          technique: selectedTechnique,
          coverText: coverText.substring(0, 100),
          secretMessage: secretMessage.substring(0, 50),
          encodedText: result.encodedText.substring(0, 100),
          success: true,
        })
      } else {
        console.error('Encoding failed:', result.error)
      }
    } catch (error) {
      console.error('Encoding error:', error)
    } finally {
      setEncoding(false)
    }
  }

  const saveToHistory = async (data) => {
    // Make sure we have a user
    if (!user || !user.id) {
      console.log('No user found, skipping history save')
      return
    }

    console.log('💾 Saving to history:', {
      user_id: user.id,
      action: data.type,
      technique: data.technique,
    })

    // Try to save to database first
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          action: data.type,
          technique: data.technique,
          text_preview: data.coverText || data.encodedText,
          success: data.success,
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Database save failed:', errorText)
        throw new Error('Database save failed')
      }
      
      const result = await response.json()
      console.log('✅ Saved to database:', result)
    } catch (error) {
      console.log('⚠️ Database not available, using local storage:', error.message)
      // Fallback to local storage
      saveToLocalHistory({
        user_id: user.id,
        action: data.type,
        technique: data.technique,
        text_preview: data.coverText || data.encodedText,
        success: data.success,
      })
      console.log('✅ Saved to local storage')
    }
  }

  const handlePasteCover = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setCoverText(text)
    } catch (error) {
      console.error('Failed to paste:', error)
    }
  }

  const handleClearCover = () => {
    setCoverText('')
    setEncodedText('')
  }

  const handlePasteSecret = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setSecretMessage(text)
    } catch (error) {
      console.error('Failed to paste:', error)
    }
  }

  const handleClearSecret = () => {
    setSecretMessage('')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(encodedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Encode Message
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hide your secret message</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Input */}
          <div className="space-y-6">
            
            {/* Cover Text Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-xl">📝</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cover Text</h2>
                    <p className="text-sm text-gray-500">Your public message</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePasteCover}
                    className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                  >
                    <Clipboard className="w-4 h-4" />
                    Paste
                  </button>
                  <button
                    onClick={handleClearCover}
                    className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
              
              <textarea
                value={coverText}
                onChange={(e) => setCoverText(e.target.value)}
                placeholder="Type your cover text here... e.g., 'Hello, how are you doing today?'"
                className="w-full h-32 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none text-gray-900 dark:text-white"
              />
              
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">{coverText.length} characters</span>
                <span className="text-gray-500">{coverText.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </motion.div>

            {/* Secret Message Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Secret Message</h2>
                    <p className="text-sm text-gray-500">Your hidden message</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePasteSecret}
                    className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1"
                  >
                    <Clipboard className="w-4 h-4" />
                    Paste
                  </button>
                  <button
                    onClick={handleClearSecret}
                    className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
              
              <textarea
                value={secretMessage}
                onChange={(e) => setSecretMessage(e.target.value)}
                placeholder="Type your secret message here..."
                className="w-full h-32 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none text-gray-900 dark:text-white"
              />
              
              <div className="mt-2 text-sm text-gray-500">
                {secretMessage.length} characters
              </div>
            </motion.div>

            {/* Smart Suggestions */}
            {coverText && secretMessage && selectedTechnique && (
              <CleanSuggestions
                coverText={coverText}
                secretMessage={secretMessage}
                selectedTechnique={selectedTechnique}
                capacity={capacities[selectedTechnique]}
                capacities={capacities}
                onTechniqueSwitch={(newTechnique) => setSelectedTechnique(newTechnique)}
                techniqueModule={TECHNIQUES[selectedTechnique].module}
                onAutoFill={(extension) => {
                  const needsSpace = !coverText.match(/[.!?]\s*$/)
                  const separator = needsSpace ? ' ' : ' '
                  setCoverText(coverText + separator + extension)
                }}
              />
            )}
          </div>

          {/* Right Column - Technique Selection & Result */}
          <div className="space-y-6">
            
            {/* Technique Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Technique</h2>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(TECHNIQUES).map(([key, { name, icon, color, desc }]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTechnique(key)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      selectedTechnique === key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className={`text-3xl ${selectedTechnique === key ? 'scale-110' : ''} transition-transform`}>
                        {icon}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">{name}</div>
                        <div className="text-xs text-gray-500 mt-1">{desc}</div>
                        {capacities[key] !== undefined && (
                          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
                            {capacities[key]} bytes
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedTechnique === key && (
                      <motion.div
                        layoutId="selected"
                        className="absolute inset-0 rounded-xl border-2 border-blue-500"
                        initial={false}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Encode Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={handleEncode}
              disabled={!coverText || !secretMessage || encoding}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${
                !coverText || !secretMessage || encoding
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-2xl hover:scale-[1.02]'
              }`}
            >
              {encoding ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Encoding...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>Encode Message</span>
                </div>
              )}
            </motion.button>

            {/* Encoded Result */}
            <AnimatePresence>
              {encodedText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-xl p-6 border-2 border-green-200 dark:border-green-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Encoded!</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ready to share</p>
                      </div>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-h-64 overflow-y-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                      {encodedText}
                    </code>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

