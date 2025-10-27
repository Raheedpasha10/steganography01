'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Lock, Zap, Eye, EyeOff, TrendingUp, Clock, LogOut } from 'lucide-react'
import { getUser, signOut } from '@/lib/supabase'
import AnimatedCard from '@/components/AnimatedCard'
import StaggerFade from '@/components/StaggerFade'
import { Button } from '@/components/ui/button'
import { getLocalStats } from '@/lib/local-history'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEncoded: 0,
    totalDecoded: 0,
    successRate: 100,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    // Check for dev mode first
    const devMode = localStorage.getItem('devMode')
    if (devMode === 'enabled') {
      setUser({ id: 'dev-user', email: 'dev@local.com' })
      await fetchStats('dev-user')
      setLoading(false)
      return
    }

    const currentUser = await getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    await fetchStats(currentUser.id)
    setLoading(false)
  }

  const fetchStats = async (userId) => {
    try {
      const response = await fetch(`/api/history?user_id=${userId}&limit=100`)
      
      if (!response.ok) {
        throw new Error('Database not available')
      }
      
      const data = await response.json()
      
      if (data.history) {
        const encoded = data.history.filter(h => h.action === 'encode').length
        const decoded = data.history.filter(h => h.action === 'decode').length
        const successful = data.history.filter(h => h.success).length
        const successRate = data.history.length > 0 
          ? Math.round((successful / data.history.length) * 100)
          : 100

        setStats({
          totalEncoded: encoded,
          totalDecoded: decoded,
          successRate: successRate,
        })
        setRecentActivity(data.history.slice(0, 5))
      }
    } catch (error) {
      console.log('Database not available, using local storage:', error)
      // Fallback to local storage
      const localStats = getLocalStats()
      setStats({
        totalEncoded: localStats.totalEncoded,
        totalDecoded: localStats.totalDecoded,
        successRate: localStats.successRate,
      })
      setRecentActivity(localStats.recentActivity)
    }
  }

  const [recentActivity, setRecentActivity] = useState([])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            <Lock className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold gradient-text">SteganoText Pro</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.email}
            </span>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to encode or decode some secret messages?
          </p>
        </motion.div>

        {/* Stats Cards */}
        <StaggerFade className="grid md:grid-cols-3 gap-6 mb-12">
          <AnimatedCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalEncoded}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Messages Encoded</div>
          </AnimatedCard>

          <AnimatedCard delay={0.1} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalDecoded}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Messages Decoded</div>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.successRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
          </AnimatedCard>
        </StaggerFade>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.button
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/encode')}
              className="p-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white shadow-lg text-left"
            >
              <Lock className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Encode Message</h3>
              <p className="text-sm opacity-90">Hide a secret message in text</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/decode')}
              className="p-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl text-white shadow-lg text-left"
            >
              <EyeOff className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Decode Message</h3>
              <p className="text-sm opacity-90">Reveal hidden messages</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/history')}
              className="p-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white shadow-lg text-left"
            >
              <Clock className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">View History</h3>
              <p className="text-sm opacity-90">See your past operations</p>
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.action === 'encode' 
                            ? 'bg-blue-100 dark:bg-blue-900/30' 
                            : 'bg-green-100 dark:bg-green-900/30'
                        }`}>
                          {activity.action === 'encode' ? (
                            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {activity.action === 'encode' ? 'Encoded' : 'Decoded'} with {activity.technique}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                            {activity.text_preview?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {activity.success && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            Success
                          </span>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(activity.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8">
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No recent activity yet. Start by encoding or decoding a message!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
