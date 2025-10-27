import pako from 'pako'

// Natural English character frequency (approximate)
const NATURAL_FREQ = {
  'e': 0.127, 't': 0.091, 'a': 0.082, 'o': 0.075, 'i': 0.070,
  'n': 0.067, 's': 0.063, 'h': 0.061, 'r': 0.060, 'd': 0.043,
  'l': 0.040, 'c': 0.028, 'u': 0.028, 'm': 0.024, 'w': 0.024,
  'f': 0.022, 'g': 0.020, 'y': 0.020, 'p': 0.019, 'b': 0.015,
  'v': 0.010, 'k': 0.008, 'j': 0.002, 'x': 0.002, 'q': 0.001, 'z': 0.001,
}

export function getCapacity(coverText) {
  // Simplified: we can encode roughly 0.1 bytes per character
  // by subtly modifying character distribution
  return Math.floor(coverText.length * 0.1)
}

export function encode(coverText, secretMessage, options = {}) {
  try {
    const { compress = true } = options
    // Convert secret to binary
    const encoder = new TextEncoder()
    let bytes = encoder.encode(secretMessage)
    
    if (compress) {
      bytes = pako.deflate(bytes)
    }
    
    const binary = Array.from(bytes)
      .map(byte => byte.toString(2).padStart(8, '0'))
      .join('')
    
    const chars = coverText.split('')
    let insertPos = []
    
    // Find positions where we can insert spaces (after words)
    for (let i = 0; i < chars.length - 1; i++) {
      if (chars[i] === ' ') {
        insertPos.push(i)
      }
    }
    
    if (insertPos.length < binary.length) {
      return {
        success: false,
        error: 'Cover text is too short to hide the message',
      }
    }
    
    // Encode by adding/removing spaces based on binary
    let result = [...chars]
    let bitIndex = 0
    let offset = 0
    
    for (let pos of insertPos) {
      if (bitIndex >= binary.length) break
      
      if (binary[bitIndex] === '1') {
        // Add an extra space (subtle frequency change)
        result.splice(pos + offset + 1, 0, ' ')
        offset++
      }
      bitIndex++
    }
    
    return {
      success: true,
      encodedText: result.join(''),
      metadata: {
        technique: 'frequency',
        originalLength: secretMessage.length,
        encodedLength: result.join('').length,
        coverLength: coverText.length,
        compressed: compress,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

export function decode(encodedText, options = {}) {
  try {
    const { compressed = true } = options
    // Detect double spaces (frequency anomalies)
    let binary = ''
    let i = 0
    
    while (i < encodedText.length) {
      if (encodedText[i] === ' ') {
        if (encodedText[i + 1] === ' ') {
          binary += '1'
          i += 2 // Skip double space
        } else {
          binary += '0'
          i++
        }
      } else {
        i++
      }
    }
    
    if (binary.length < 8) {
      return {
        success: false,
        error: 'No hidden message detected',
      }
    }
    
    // Convert binary to bytes
    const bytes = []
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.substring(i, i + 8)
      if (byte.length === 8) {
        bytes.push(parseInt(byte, 2))
      }
    }
    
    let data = new Uint8Array(bytes)
    
    if (compressed) {
      try {
        data = pako.inflate(data)
      } catch (e) {
        // Not compressed or inflation failed, use as is
      }
    }
    
    const decoder = new TextDecoder()
    let message = decoder.decode(data)
    
    // Trim null bytes and whitespace padding
    message = message.replace(/[\x00-\x1F\x7F]+$/g, '').trim()

    return {
      success: true,
      message,
      metadata: {
        technique: 'frequency',
        spacesFound: binary.length,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

export function detect(text) {
  // Check for double spaces (frequency anomaly)
  const doubleSpaces = (text.match(/  +/g) || []).length
  
  if (doubleSpaces > 0) {
    return {
      detected: true,
      confidence: Math.min(0.8, 0.3 + (doubleSpaces / 10)),
      features: {
        doubleSpaces,
      },
    }
  }
  
  return {
    detected: false,
    confidence: 0.1,
  }
}
