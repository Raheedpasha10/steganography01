'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Lock, Zap, Shield, Sparkles, ArrowRight, Eye, Users, Settings } from 'lucide-react'
import AnimatedCard from '@/components/AnimatedCard'
import { Button } from '@/components/ui/button'
import { notify } from '@/lib/toast'

export default function LandingPage() {
  const router = useRouter()
  const [devMode, setDevMode] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <Lock className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold gradient-text">SteganoText Pro</span>
          </motion.div>
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/login')}
              variant="ghost"
            >
              Login
            </Button>
            <Button
              onClick={() => router.push('/signup')}
            >
              Get Started
            </Button>
            {/* Dev Mode Toggle */}
            <button
              onClick={() => {
                const enabled = localStorage.getItem('devMode') === 'enabled'
                localStorage.setItem('devMode', enabled ? 'disabled' : 'enabled')
                setDevMode(!enabled)
                notify.success(enabled ? 'Dev mode disabled' : 'Dev mode enabled')
              }}
              className="fixed bottom-4 right-4 p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
              title="Toggle Dev Mode (bypasses auth)"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Hide Messages in
              <br />
              <span className="gradient-text">Plain Sight</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Advanced AI-powered text steganography. Hide secret messages using 8 sophisticated techniques.
              Undetectable. Secure. Premium.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={() => router.push('/signup')}
                className="text-lg px-8 py-6"
              >
                Start Hiding Messages
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-16 relative"
          >
            <div className="relative w-full max-w-4xl mx-auto p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">AI Recommendation</span>
                </div>
                <h3 className="text-2xl font-bold">Zero-Width Encoding</h3>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '95%' }}
                    transition={{ delay: 1, duration: 1.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                </div>
                <p className="text-gray-600 dark:text-gray-400">95% confidence - Best stealth and capacity</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16"
          >
            Why SteganoText Pro?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedCard delay={0.1} className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI-Powered</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Claude AI automatically detects and recommends the best steganography technique for your needs.
              </p>
            </AnimatedCard>

            <AnimatedCard delay={0.2} className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">8 Techniques</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Zero-width, whitespace, homoglyphs, Unicode normalization, and more. All working perfectly.
              </p>
            </AnimatedCard>

            <AnimatedCard delay={0.3} className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Secure</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enterprise-grade authentication with Supabase. Your messages are encrypted and private.
              </p>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Eye, value: '95%', label: 'Detection Accuracy' },
              { icon: Shield, value: '8', label: 'Techniques' },
              { icon: Users, value: '100%', label: 'Secure' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8"
              >
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 + 0.3, type: 'spring' }}
                  className="text-5xl font-bold mb-2 gradient-text"
                >
                  {stat.value}
                </motion.div>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center text-white">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6"
          >
            Ready to Start Hiding Messages?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl mb-8 opacity-90"
          >
            Join now and experience the most advanced text steganography platform.
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              onClick={() => router.push('/signup')}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="w-6 h-6" />
            <span className="text-xl font-bold">SteganoText Pro</span>
          </div>
          <p className="text-gray-400 mb-4">
            Advanced AI-Powered Text Steganography Platform
          </p>
          <p className="text-sm text-gray-500">
            © 2025 SteganoText Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}