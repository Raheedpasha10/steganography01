'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Unlock, Copy, Check, Loader2, ArrowLeft, AlertTriangle, Search, Sparkles, Eye, Clipboard, Trash2 } from 'lucide-react'
import { getUser } from '@/lib/supabase'
import { aiDetect } from '@/lib/ai-detection'
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
  'zero-width': { module: zeroWidth, name: 'Zero-Width', icon: '⚡', color: 'from-purple-500 to-pink-500' },
  'whitespace': { module: whitespace, name: 'Whitespace', icon: '◌', color: 'from-cyan-500 to-blue-500' },
  'homoglyph': { module: homoglyph, name: 'Homoglyph', icon: '⊕', color: 'from-orange-500 to-red-500' },
  'unicode-normalization': { module: unicodeNorm, name: 'Unicode', icon: 'Ü', color: 'from-violet-500 to-purple-500' },
  'synonym': { module: synonym, name: 'Synonym', icon: '≈', color: 'from-gray-600 to-gray-700' },
  'frequency': { module: frequency, name: 'Frequency', icon: '≋', color: 'from-gray-600 to-gray-700' },
  'punctuation': { module: punctuation, name: 'Punctuation', icon: '¿', color: 'from-gray-600 to-gray-700' },
  'invisible-ink': { module: invisibleInk, name: 'Invisible Ink', icon: '🎨', color: 'from-gray-600 to-gray-700' },
}

export default function DecodePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [encodedText, setEncodedText] = useState('')
  const [selectedTechnique, setSelectedTechnique] = useState(null) // null = auto-detect
  const [decodedMessage, setDecodedMessage] = useState('')
  const [decoding, setDecoding] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [detectionResults, setDetectionResults] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

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
      const devMode = localStorage.getItem('devMode')
      if (devMode === 'enabled') {
        setUser({ id: 'dev-user', email: 'dev@local.com' })
        setLoading(false)
      } else {
        router.push('/login')
      }
    }
  }

  const handleAutoDetect = async () => {
    if (!encodedText) return

    setDetecting(true)
    setDetectionResults(null)
    setError('')

    try {
      // Try AI detection first
      const aiResult = await aiDetect(encodedText)
      
      // Try all techniques and get confidence scores
      const results = []
      for (const [key, { module, name }] of Object.entries(TECHNIQUES)) {
        // Try BOTH compressed and uncompressed (we don't know which was used)
        const attempts = [
          { compressed: false, label: 'uncompressed' },
          { compressed: true, label: 'compressed' }
        ]
        
        for (const attempt of attempts) {
          const result = module.decode(encodedText, attempt)
          
          if (result.success && result.message && result.message.trim().length > 0) {
            // Calculate confidence based on message quality
            const hasValidChars = /^[\x20-\x7E\s]+$/.test(result.message)
            const hasWords = result.message.split(/\s+/).filter(w => w.length > 2).length > 0
            const noWeirdChars = !/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/.test(result.message)
            
            // Higher confidence for clean, readable messages
            let confidence = 0.3
            if (hasValidChars && noWeirdChars) confidence = 0.6
            if (hasValidChars && hasWords && noWeirdChars) confidence = 0.8
            
            results.push({
              technique: key,
              name,
              message: result.message,
              confidence,
              metadata: result.metadata,
              compressionUsed: attempt.compressed
            })
          }
        }
      }

      // Sort by confidence
      results.sort((a, b) => b.confidence - a.confidence)
      
      setDetectionResults(results)
      
      if (results.length > 0) {
        // Auto-select the best result
        setSelectedTechnique(results[0].technique)
        setDecodedMessage(results[0].message)
        
        // Save to history
        await saveToHistory({
          type: 'decode',
          technique: results[0].technique,
          encodedText: encodedText.substring(0, 100),
          decodedMessage: results[0].message.substring(0, 50),
          success: true,
        })
      } else {
        setError('No hidden message detected. Try selecting a specific technique.')
      }

    } catch (error) {
      console.error('Detection error:', error)
      setError('Detection failed. Please try a specific technique.')
    } finally {
      setDetecting(false)
    }
  }

  const handleDecode = async () => {
    if (!encodedText || !selectedTechnique) return

    setDecoding(true)
    setDecodedMessage('')
    setError('')

    try {
      const technique = TECHNIQUES[selectedTechnique].module
      
      // Try uncompressed first (most common for short messages), then compressed
      let result = technique.decode(encodedText, { compressed: false })
      
      // If uncompressed gives garbage or fails, try compressed
      if (!result.success || !result.message || result.message.trim().length === 0 || /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/.test(result.message)) {
        result = technique.decode(encodedText, { compressed: true })
      }

      if (result.success && result.message) {
        setDecodedMessage(result.message)
        
        // Save to history
        await saveToHistory({
          type: 'decode',
          technique: selectedTechnique,
          encodedText: encodedText.substring(0, 100),
          decodedMessage: result.message.substring(0, 50),
          success: true,
        })
      } else {
        setError(result.error || 'Decoding failed. Try a different technique.')
      }
    } catch (error) {
      console.error('Decoding error:', error)
      setError('Decoding failed. The text may not contain a hidden message with this technique.')
    } finally {
      setDecoding(false)
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
          text_preview: data.encodedText,
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
        text_preview: data.encodedText,
        success: data.success,
      })
      console.log('✅ Saved to local storage')
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setEncodedText(text)
      setDecodedMessage('')
      setDetectionResults(null)
      setError('')
    } catch (error) {
      console.error('Failed to paste:', error)
    }
  }

  const handleClear = () => {
    setEncodedText('')
    setDecodedMessage('')
    setDetectionResults(null)
    setError('')
    setSelectedTechnique(null)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(decodedMessage)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Decode Message
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reveal the hidden secret</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Input & Detection */}
          <div className="space-y-6">
            
            {/* Encoded Text Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Unlock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Encoded Text</h2>
                    <p className="text-sm text-gray-500">Paste the text with hidden message</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePaste}
                    className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1"
                  >
                    <Clipboard className="w-4 h-4" />
                    Paste
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
              
              <textarea
                value={encodedText}
                onChange={(e) => {
                  setEncodedText(e.target.value)
                  setDecodedMessage('')
                  setDetectionResults(null)
                  setError('')
                }}
                placeholder="Paste your encoded text here..."
                className="w-full h-48 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none text-gray-900 dark:text-white"
              />
              
              <div className="mt-2 text-sm text-gray-500">
                {encodedText.length} characters
              </div>
            </motion.div>

            {/* Auto-Detect Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={handleAutoDetect}
              disabled={!encodedText || detecting}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${
                !encodedText || detecting
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-2xl hover:scale-[1.02]'
              }`}
            >
              {detecting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Detecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  <span>Auto-Detect Technique</span>
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
            </motion.button>

            {/* Detection Results */}
            <AnimatePresence>
              {detectionResults && detectionResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-purple-200 dark:border-purple-700"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🎯 Detected Techniques
                  </h3>
                  
                  <div className="space-y-3">
                    {detectionResults.slice(0, 3).map((result, index) => (
                      <button
                        key={result.technique}
                        onClick={() => {
                          setSelectedTechnique(result.technique)
                          setDecodedMessage(result.message)
                        }}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          selectedTechnique === result.technique
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{TECHNIQUES[result.technique].icon}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {result.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                Best Match
                              </span>
                            )}
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {Math.round(result.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          Preview: {result.message.substring(0, 50)}...
                        </p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-2xl p-4 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400">Decoding Failed</h4>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Manual Selection & Result */}
          <div className="space-y-6">
            
            {/* Manual Technique Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Or Select Manually
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(TECHNIQUES).map(([key, { name, icon }]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTechnique(key)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedTechnique === key
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg scale-105'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">{icon}</span>
                      <span className="font-semibold text-sm text-gray-900 dark:text-white text-center">
                        {name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Decode Button */}
            {selectedTechnique && !detectionResults && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleDecode}
                disabled={!encodedText || decoding}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${
                  !encodedText || decoding
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-2xl hover:scale-[1.02]'
                }`}
              >
                {decoding ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Decoding...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Unlock className="w-5 h-5" />
                    <span>Decode with {TECHNIQUES[selectedTechnique].name}</span>
                  </div>
                )}
              </motion.button>
            )}

            {/* Decoded Result */}
            <AnimatePresence>
              {decodedMessage && (
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
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Secret Revealed!</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Decoded with {TECHNIQUES[selectedTechnique].name}
                        </p>
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
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                    <p className="text-lg text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                      {decodedMessage}
                    </p>
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

