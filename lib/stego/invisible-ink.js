import pako from 'pako'

export function getCapacity(coverText) {
  // Each character can be wrapped with a color, 1 bit per char
  return Math.floor(coverText.length / 8) // bytes
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
    
    if (coverText.length < binary.length) {
      return {
        success: false,
        error: 'Cover text is too short to hide the message',
      }
    }
    
    let encoded = ''
    let bitIndex = 0
    
    for (let char of coverText) {
      if (bitIndex >= binary.length) {
        // No more bits to encode, use white
        encoded += `<span style="color: #ffffff">${char}</span>`
      } else {
        // Encode bit using very subtle color difference
        const bit = binary[bitIndex++]
        const color = bit === '0' ? '#ffffff' : '#fffffe'
        encoded += `<span style="color: ${color}">${char}</span>`
      }
    }
    
    return {
      success: true,
      encodedText: `<div>${encoded}</div>`,
      metadata: {
        technique: 'invisible-ink',
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

export function decode(encodedHtml, options = {}) {
  try {
    const { compressed = true } = options
    // Extract colors from HTML
    let binary = ''
    const colorRegex = /color:\s*#([0-9a-fA-F]{6})/g
    const matches = encodedHtml.matchAll(colorRegex)
    
    for (let match of matches) {
      const color = match[1].toLowerCase()
      // Check last character (LSB encoding)
      const lastChar = color.charAt(color.length - 1)
      binary += lastChar === 'f' ? '0' : '1'
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
        technique: 'invisible-ink',
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
  // Check if text contains HTML with color styling
  const hasHTML = /<[^>]+>/.test(text)
  const hasColorCoding = /color:\s*#[0-9a-fA-F]{6}/.test(text)
  
  if (hasHTML && hasColorCoding) {
    return {
      detected: true,
      confidence: 0.9,
      features: {
        hasHTML: true,
        hasColorCoding: true,
      },
    }
  }
  
  return {
    detected: false,
    confidence: 0.0,
  }
}
