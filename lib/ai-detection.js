// AI-powered steganography detection using Emergent LLM (Claude)

import * as zeroWidth from './stego/zero-width'
import * as whitespace from './stego/whitespace'
import * as homoglyph from './stego/homoglyph'
import * as unicodeNorm from './stego/unicode-norm'

const TECHNIQUES = {
  'zero-width': zeroWidth,
  'whitespace': whitespace,
  'homoglyph': homoglyph,
  'unicode-normalization': unicodeNorm,
}

// Feature extraction for AI analysis
function extractFeatures(text) {
  const chars = Array.from(text)
  
  // Character-level features
  const zeroWidthCount = chars.filter(c => 
    ['\u200B', '\u200C', '\u200D', '\uFEFF'].includes(c)
  ).length
  
  // Whitespace features
  const doubleSpaces = (text.match(/  +/g) || []).length
  const tabs = (text.match(/\t/g) || []).length
  
  // Homoglyph detection
  const cyrillicChars = chars.filter(c => 
    c.match(/[\u0400-\u04FF]/)
  ).length
  
  // Unicode combining marks
  const combiningMarks = chars.filter(c => 
    c.match(/[\u0300-\u036F]/)
  ).length
  
  // Statistical features
  const charFrequency = {}
  chars.forEach(c => {
    charFrequency[c] = (charFrequency[c] || 0) + 1
  })
  
  const entropy = Object.values(charFrequency).reduce((sum, count) => {
    const p = count / chars.length
    return sum - (p * Math.log2(p))
  }, 0)
  
  return {
    zeroWidthCount,
    doubleSpaces,
    tabs,
    cyrillicChars,
    combiningMarks,
    entropy,
    length: text.length,
  }
}

// Rule-based detection (fast, for initial filtering)
export function quickDetect(text) {
  const detections = []
  
  Object.entries(TECHNIQUES).forEach(([name, technique]) => {
    const result = technique.detect(text)
    if (result.detected) {
      detections.push({
        technique: name,
        confidence: result.confidence,
        features: result,
      })
    }
  })
  
  // Sort by confidence
  detections.sort((a, b) => b.confidence - a.confidence)
  
  return detections
}

// AI-powered detection using Claude
export async function aiDetect(text) {
  try {
    // First, do quick rule-based detection
    const quickResults = quickDetect(text)
    
    // Extract features
    const features = extractFeatures(text)
    
    // If high confidence from rule-based, return that
    if (quickResults.length > 0 && quickResults[0].confidence > 0.85) {
      return {
        success: true,
        technique: quickResults[0].technique,
        confidence: quickResults[0].confidence,
        reasoning: `Strong pattern detection: ${JSON.stringify(quickResults[0].features)}`,
        alternativePredictions: quickResults.slice(1, 4).map(r => ({
          technique: r.technique,
          confidence: r.confidence,
          reasoning: `Pattern indicators: ${JSON.stringify(r.features)}`,
        })),
        features,
        method: 'rule-based',
      }
    }
    
    // Call AI for more sophisticated analysis
    const response = await fetch('/api/ai/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, features, quickResults }),
    })
    
    if (!response.ok) {
      throw new Error('AI detection failed')
    }
    
    const aiResult = await response.json()
    return aiResult
    
  } catch (error) {
    console.error('AI detection error:', error)
    
    // Fallback to rule-based if AI fails
    const quickResults = quickDetect(text)
    if (quickResults.length > 0) {
      return {
        success: true,
        technique: quickResults[0].technique,
        confidence: quickResults[0].confidence,
        reasoning: 'Rule-based detection (AI unavailable)',
        alternativePredictions: quickResults.slice(1, 4).map(r => ({
          technique: r.technique,
          confidence: r.confidence,
          reasoning: 'Pattern-based',
        })),
        features: extractFeatures(text),
        method: 'rule-based-fallback',
      }
    }
    
    return {
      success: false,
      error: 'No steganography detected',
      features: extractFeatures(text),
    }
  }
}

// AI-powered recommendation
export async function aiRecommend(coverText, secretMessage) {
  try {
    // Calculate capacity for each technique
    const capacities = Object.entries(TECHNIQUES).map(([name, technique]) => ({
      technique: name,
      capacity: technique.getCapacity(coverText),
      required: secretMessage.length,
    }))
    
    // Filter techniques that can handle the message
    const viable = capacities.filter(c => c.capacity >= c.required)
    
    if (viable.length === 0) {
      return {
        success: false,
        error: 'Cover text too short for message in all techniques',
        capacities,
      }
    }
    
    // Call AI for recommendation
    const response = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        coverText, 
        secretMessage,
        capacities,
      }),
    })
    
    if (!response.ok) {
      throw new Error('AI recommendation failed')
    }
    
    const recommendation = await response.json()
    return recommendation
    
  } catch (error) {
    console.error('AI recommendation error:', error)
    
    // Fallback to simple recommendation
    const capacities = Object.entries(TECHNIQUES).map(([name, technique]) => ({
      technique: name,
      capacity: technique.getCapacity(coverText),
      required: secretMessage.length,
    }))
    
    const viable = capacities.filter(c => c.capacity >= c.required)
    
    if (viable.length === 0) {
      return {
        success: false,
        error: 'Cover text too short',
        capacities,
      }
    }
    
    // Simple scoring: prefer zero-width (most reliable)
    const scored = viable.map(v => ({
      ...v,
      score: v.technique === 'zero-width' ? 100 : 
             v.technique === 'whitespace' ? 80 :
             v.technique === 'homoglyph' ? 70 : 60,
    }))
    
    scored.sort((a, b) => b.score - a.score)
    
    return {
      success: true,
      recommendations: scored.slice(0, 3).map((s, idx) => ({
        rank: idx + 1,
        technique: s.technique,
        score: s.score,
        reasoning: 'Capacity and reliability based',
        pros: ['Sufficient capacity'],
        cons: [],
      })),
      method: 'rule-based-fallback',
    }
  }
}