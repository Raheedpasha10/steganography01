import pako from 'pako'

export function getCapacity(coverText) {
  // Count punctuation marks we can manipulate
  const punctCount = (coverText.match(/[,;.!?'"]/g) || []).length
  // Each mark can encode 1 bit
  return Math.floor(punctCount / 8) // bytes
}

export function encode(coverText, secretMessage, options = {}) {
  try {
    const { compress = true } = options
    const encoder = new TextEncoder()
    let bytes = encoder.encode(secretMessage)
    
    if (compress) {
      bytes = pako.deflate(bytes)
    }
    
    const binary = Array.from(bytes)
      .map(byte => byte.toString(2).padStart(8, '0'))
      .join('')
    
    // Normalize the text first: replace all quotes with single quotes, remove semicolons
    let normalized = coverText.replace(/"/g, "'").replace(/;/g, ',')
    
    let bitIndex = 0
    
    // Replace commas with semicolons based on binary (0=comma, 1=semicolon)
    let encoded = normalized.replace(/,/g, () => {
      if (bitIndex >= binary.length) return ','
      const bit = binary[bitIndex++]
      return bit === '0' ? ',' : ';'
    })
    
    // Replace single quotes with double quotes based on binary
    encoded = encoded.replace(/'/g, () => {
      if (bitIndex >= binary.length) return "'"
      const bit = binary[bitIndex++]
      return bit === '0' ? "'" : '"'
    })
    
    // Add single or double space after periods
    encoded = encoded.replace(/\.\s/g, () => {
      if (bitIndex >= binary.length) return '. '
      const bit = binary[bitIndex++]
      return bit === '0' ? '. ' : '.  '
    })
    
    if (bitIndex < binary.length) {
      return {
        success: false,
        error: 'Cover text has insufficient punctuation to hide the message',
      }
    }
    
    return {
      success: true,
      encodedText: encoded,
      metadata: {
        technique: 'punctuation',
        originalLength: secretMessage.length,
        encodedLength: encoded.length,
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
    let binary = ''
    
    // Detect comma vs semicolon
    for (let char of encodedText) {
      if (char === ',') binary += '0'
      else if (char === ';') binary += '1'
      else if (char === "'") binary += '0'
      else if (char === '"') binary += '1'
    }
    
    // Detect single vs double space after periods
    const spaceMatches = encodedText.matchAll(/\.\s+/g)
    for (let match of spaceMatches) {
      const spaces = match[0].length - 1
      binary += spaces === 1 ? '0' : '1'
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
        technique: 'punctuation',
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
  const semicolons = (text.match(/;/g) || []).length
  const doubleQuotes = (text.match(/"/g) || []).length
  const doubleSpaces = (text.match(/\.  /g) || []).length
  
  const anomalies = semicolons + doubleQuotes + doubleSpaces
  
  if (anomalies > 0) {
    return {
      detected: true,
      confidence: Math.min(0.75, 0.3 + (anomalies / 10)),
      features: {
        semicolons,
        doubleQuotes,
        doubleSpacesAfterPeriods: doubleSpaces,
      },
    }
  }
  
  return {
    detected: false,
    confidence: 0.1,
  }
}
