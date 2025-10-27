/**
 * Local storage fallback for history when database is not available
 */

const HISTORY_KEY = 'steganotext_history'
const MAX_HISTORY_ITEMS = 100

export function saveToLocalHistory(entry) {
  try {
    const history = getLocalHistory()
    history.unshift({
      ...entry,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    })
    
    // Keep only last 100 items
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS)
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    return true
  } catch (error) {
    console.error('Error saving to local history:', error)
    return false
  }
}

export function getLocalHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading local history:', error)
    return []
  }
}

export function clearLocalHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY)
    return true
  } catch (error) {
    console.error('Error clearing local history:', error)
    return false
  }
}

export function getLocalStats() {
  try {
    const history = getLocalHistory()
    const encoded = history.filter(h => h.action === 'encode').length
    const decoded = history.filter(h => h.action === 'decode').length
    const successful = history.filter(h => h.success).length
    const successRate = history.length > 0 
      ? Math.round((successful / history.length) * 100)
      : 100

    return {
      totalEncoded: encoded,
      totalDecoded: decoded,
      successRate: successRate,
      recentActivity: history.slice(0, 5)
    }
  } catch (error) {
    console.error('Error calculating local stats:', error)
    return {
      totalEncoded: 0,
      totalDecoded: 0,
      successRate: 100,
      recentActivity: []
    }
  }
}

