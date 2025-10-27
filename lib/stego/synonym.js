import pako from 'pako'

// Simple synonym map for encoding
const SYNONYM_MAP = {
  'good': ['good', 'great', 'excellent', 'fine'],
  'bad': ['bad', 'poor', 'terrible', 'awful'],
  'big': ['big', 'large', 'huge', 'massive'],
  'small': ['small', 'tiny', 'little', 'petite'],
  'happy': ['happy', 'glad', 'joyful', 'pleased'],
  'sad': ['sad', 'unhappy', 'sorrowful', 'melancholy'],
  'fast': ['fast', 'quick', 'rapid', 'swift'],
  'slow': ['slow', 'sluggish', 'leisurely', 'gradual'],
  'beautiful': ['beautiful', 'lovely', 'gorgeous', 'stunning'],
  'ugly': ['ugly', 'unattractive', 'unsightly', 'hideous'],
  'smart': ['smart', 'intelligent', 'clever', 'bright'],
  'stupid': ['stupid', 'dumb', 'foolish', 'silly'],
  'easy': ['easy', 'simple', 'effortless', 'straightforward'],
  'hard': ['hard', 'difficult', 'challenging', 'tough'],
  'new': ['new', 'fresh', 'recent', 'novel'],
  'old': ['old', 'ancient', 'aged', 'elderly'],
  'hot': ['hot', 'warm', 'heated', 'scorching'],
  'cold': ['cold', 'cool', 'chilly', 'freezing'],
  'strong': ['strong', 'powerful', 'mighty', 'robust'],
  'weak': ['weak', 'feeble', 'frail', 'delicate'],
}

// Create reverse map for decoding
const REVERSE_MAP = {}
Object.entries(SYNONYM_MAP).forEach(([base, synonyms]) => {
  synonyms.forEach((synonym, index) => {
    REVERSE_MAP[synonym.toLowerCase()] = { base, index }
  })
})

export function getCapacity(coverText) {
  const words = coverText.toLowerCase().split(/\s+/)
  const replaceable = words.filter(word => SYNONYM_MAP[word] !== undefined)
  // Each replaceable word can encode 2 bits (4 synonyms)
  return Math.floor((replaceable.length * 2) / 8) // bytes
}

export function encode(coverText, secretMessage, options = {}) {
  try {
    // Convert secret to binary
    const encoder = new TextEncoder()
    let bytes = encoder.encode(secretMessage)
    
    // Compress if requested
    if (options.compress) {
      bytes = pako.deflate(bytes)
    }
    
    // Store the exact byte count as first 2 bytes (16 bits = up to 65535 bytes)
    const messageLength = bytes.length
    const lengthBytes = new Uint8Array(2)
    lengthBytes[0] = (messageLength >> 8) & 0xFF
    lengthBytes[1] = messageLength & 0xFF
    
    // Prepend length to data
    const dataWithLength = new Uint8Array(lengthBytes.length + bytes.length)
    dataWithLength.set(lengthBytes, 0)
    dataWithLength.set(bytes, lengthBytes.length)
    
    // Convert to binary string
    const binary = Array.from(dataWithLength)
      .map(byte => byte.toString(2).padStart(8, '0'))
      .join('')
    
    const words = coverText.split(/\s+/)
    const encoded = []
    let bitIndex = 0
    
    for (let word of words) {
      const lower = word.toLowerCase().replace(/[^a-z]/g, '')
      const synonyms = SYNONYM_MAP[lower]
      
      // Only encode if we still have bits left AND we have at least 2 bits
      if (synonyms && bitIndex + 1 < binary.length) {
        // Use 2 bits to select synonym (00, 01, 10, 11)
        const bits = binary.substr(bitIndex, 2)
        bitIndex += 2
        const index = parseInt(bits.padEnd(2, '0'), 2)
        
        // Preserve original casing and punctuation
        const selectedSynonym = synonyms[index]
        let finalWord = selectedSynonym
        
        // Preserve capitalization
        if (word[0] === word[0].toUpperCase()) {
          finalWord = selectedSynonym.charAt(0).toUpperCase() + selectedSynonym.slice(1)
        }
        
        // Preserve trailing punctuation
        const punctuation = word.match(/[^a-zA-Z]+$/)
        if (punctuation) {
          finalWord += punctuation[0]
        }
        
        encoded.push(finalWord)
      } else {
        encoded.push(word)
      }
    }
    
    if (bitIndex < binary.length) {
      return {
        success: false,
        error: 'Cover text is too short to hide the message',
      }
    }
    
    return {
      success: true,
      encodedText: encoded.join(' '),
      metadata: {
        technique: 'synonym',
        originalLength: secretMessage.length,
        encodedLength: encoded.join(' ').length,
        coverLength: coverText.length,
        compressed: options.compress || false,
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
    const words = encodedText.split(/\s+/)
    let binary = ''
    
    for (let word of words) {
      const lower = word.toLowerCase().replace(/[^a-z]/g, '')
      const mapping = REVERSE_MAP[lower]
      
      if (mapping) {
        // Convert index to 2-bit binary
        binary += mapping.index.toString(2).padStart(2, '0')
      }
    }
    
    if (binary.length < 8) {
      return {
        success: false,
        error: 'No hidden message detected',
      }
    }
    
    // Convert binary to bytes
    const allBytes = []
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.substr(i, 8)
      if (byte.length === 8) {
        allBytes.push(parseInt(byte, 2))
      }
    }
    
    if (allBytes.length < 2) {
      return {
        success: false,
        error: 'Not enough data',
      }
    }
    
    // Read message length from first 2 bytes
    const messageLength = (allBytes[0] << 8) | allBytes[1]
    
    // Extract only the message bytes (skip the 2-byte length header)
    const messageBytes = allBytes.slice(2, 2 + messageLength)
    let data = new Uint8Array(messageBytes)
    
    // Try to decompress
    if (options.compressed) {
      try {
        data = pako.inflate(data)
      } catch (e) {
        // Not compressed or corrupted
      }
    }
    
    const decoder = new TextDecoder('utf-8', { fatal: false })
    let message = decoder.decode(data)
    
    // Aggressively clean: remove ALL null bytes and control characters
    message = message.replace(/\x00/g, '') // Remove ALL null bytes
    message = message.replace(/[\x01-\x1F\x7F-\x9F]/g, '') // Remove ALL control characters
    message = message.trim() // Trim whitespace
    
    return {
      success: true,
      message,
      metadata: {
        technique: 'synonym',
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
  const words = text.toLowerCase().split(/\s+/)
  const hasSynonyms = words.filter(word => REVERSE_MAP[word] !== undefined).length
  
  if (hasSynonyms > words.length * 0.1) {
    return {
      detected: true,
      confidence: Math.min(0.9, 0.4 + (hasSynonyms / words.length)),
      features: {
        synonymCount: hasSynonyms,
        totalWords: words.length,
      },
    }
  }
  
  return {
    detected: false,
    confidence: 0.1,
  }
}
