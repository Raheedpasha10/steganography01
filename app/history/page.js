'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Lock, ArrowLeft, Trash2, Eye, EyeOff, Filter } from 'lucide-react'
import { getUser, getSession, supabase } from '@/lib/supabase'
import AnimatedCard from '@/components/AnimatedCard'
import { Button } from '@/components/ui/button'
import { getLocalHistory, clearLocalHistory } from '@/lib/local-history'

export default function HistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState({ encoded: [], decoded: [] })
  const [filter, setFilter] = useState('all') // 'all', 'encoded', 'decoded'

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check for dev mode
      const devMode = localStorage.getItem('devMode')
      if (devMode === 'enabled') {
        setUser({ id: 'dev-user', email: 'dev@local.com' })
        await fetchHistory('dev-user')
        setLoading(false)
        return
      }

      const currentUser = await getUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      await fetchHistory(currentUser.id)
      setLoading(false)
    } catch (error) {
      console.error('Auth check failed:', error)
      // Try dev mode as fallback
      const devMode = localStorage.getItem('devMode')
      if (devMode === 'enabled') {
        setUser({ id: 'dev-user', email: 'dev@local.com' })
        await fetchHistory('dev-user')
        setLoading(false)
      } else {
        router.push('/login')
      }
    }
  }

  const fetchHistory = async (userId) => {
    try {
      // Try database first
      const response = await fetch(`/api/history?user_id=${userId}&limit=1000`)
      
      if (!response.ok) {
        throw new Error('Database not available')
      }
      
      const data = await response.json()
      
      if (data.history && Array.isArray(data.history)) {
        setHistory({
          encoded: data.history.filter(item => item.action === 'encode'),
          decoded: data.history.filter(item => item.action === 'decode'),
        })
      }
    } catch (error) {
      console.log('Database not available, using local storage:', error)
      // Fallback to local storage
      const localHistory = getLocalHistory()
      setHistory({
        encoded: localHistory.filter(item => item.action === 'encode'),
        decoded: localHistory.filter(item => item.action === 'decode'),
      })
    }
  }

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      // Try database first
      const response = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchHistory(user.id)
      } else {
        throw new Error('Database delete failed')
      }
    } catch (error) {
      console.log('Database not available, deleting from local storage:', error)
      // Fallback to local storage
      const localHistory = getLocalHistory()
      const updatedHistory = localHistory.filter(item => item.id !== id)
      localStorage.setItem('steganotext_history', JSON.stringify(updatedHistory))
      await fetchHistory(user.id)
    }
  }

  const getFilteredHistory = () => {
    const items = []
    
    if (filter === 'all' || filter === 'encoded') {
      history.encoded.forEach(item => {
        items.push({ ...item, type: 'encoded' })
      })
    }
    
    if (filter === 'all' || filter === 'decoded') {
      history.decoded.forEach(item => {
        items.push({ ...item, type: 'decoded' })
      })
    }
    
    // Sort by created_at descending
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    return items
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const filteredItems = getFilteredHistory()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Lock className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold gradient-text">History</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div className="flex gap-2">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All
            </Button>
            <Button
              onClick={() => setFilter('encoded')}
              variant={filter === 'encoded' ? 'default' : 'outline'}
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Encoded ({history.encoded.length})
            </Button>
            <Button
              onClick={() => setFilter('decoded')}
              variant={filter === 'decoded' ? 'default' : 'outline'}
              size="sm"
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Decoded ({history.decoded.length})
            </Button>
          </div>
        </motion.div>

        {/* History Items */}
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Lock className="w-20 h-20 mx-auto mb-6 text-gray-300 dark:text-gray-700" />
            <h2 className="text-2xl font-bold mb-2">No History Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your encoded and decoded messages will appear here
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/encode')}>
                <Eye className="w-4 h-4 mr-2" />
                Encode Message
              </Button>
              <Button onClick={() => router.push('/decode')} variant="outline">
                <EyeOff className="w-4 h-4 mr-2" />
                Decode Message
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item, index) => (
              <AnimatedCard
                key={item.id}
                delay={index * 0.05}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.type === 'encoded'
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                          : 'bg-gradient-to-br from-green-500 to-teal-500'
                      }`}>
                        {item.type === 'encoded' ? (
                          <Eye className="w-5 h-5 text-white" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {item.type === 'encoded' ? 'Encoded' : 'Decoded'} Message
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Technique: </span>
                        <span className="font-semibold capitalize">{item.technique?.replace(/-/g, ' ')}</span>
                      </div>
                      {item.text_preview && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Preview: </span>
                          <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {item.text_preview.length > 80 
                              ? item.text_preview.substring(0, 80) + '...' 
                              : item.text_preview}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.success 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {item.success ? '✓ Success' : '✗ Failed'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(item.id, item.type)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}