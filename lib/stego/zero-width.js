import pako from 'pako'

// Zero-width character encoding using Unicode zero-width characters
// Binary encoding: 00=ZWSP, 01=ZWJ, 10=ZWNJ, 11=ZWNBSP

const ZERO_WIDTH_CHARS = {
  '00': '\u200B', // ZWSP
  '01': '\u200D', // ZWJ
  '10': '\u200C', // ZWNJ
  '11': '\uFEFF', // ZWNBSP
}

const CHAR_TO_BINARY = {
  '\u200B': '00',
  '\u200D': '01',
  '\u200C': '10',
  '\uFEFF': '11',
}

function stringToBinary(str) {
  return Array.from(str)
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('')
}

function binaryToString(binary) {
  const bytes = binary.match(/.{1,8}/g) || []
  return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('')
}

export function encode(coverText, secretMessage, options = {}) {
  try {
    const { compress = true, encryption = false } = options

    // Compress if enabled
    let messageToEncode = secretMessage
    if (compress) {
      const compressed = pako.deflate(secretMessage)
      // Convert Uint8Array to binary string
      let binaryString = ''
      for (let i = 0; i < compressed.length; i++) {
        binaryString += String.fromCharCode(compressed[i])
      }
      messageToEncode = btoa(binaryString)
    }

    // Convert message to binary
    const binary = stringToBinary(messageToEncode)

    // Convert binary to zero-width characters
    const pairs = binary.match(/.{1,2}/g) || []
    const zeroWidthChars = pairs.map(pair => {
      const paddedPair = pair.padEnd(2, '0')
      return ZERO_WIDTH_CHARS[paddedPair]
    }).join('')

    // Insert zero-width characters into cover text
    // Strategy: distribute evenly throughout the text
    const coverChars = Array.from(coverText)
    const insertInterval = Math.floor(coverChars.length / zeroWidthChars.length) || 1
    
    let result = ''
    let zeroWidthIndex = 0
    
    for (let i = 0; i < coverChars.length; i++) {
      result += coverChars[i]
      if (zeroWidthIndex < zeroWidthChars.length && i % insertInterval === 0 && i !== 0) {
        result += zeroWidthChars[zeroWidthIndex]
        zeroWidthIndex++
      }
    }
    
    // Add remaining zero-width characters at the end
    while (zeroWidthIndex < zeroWidthChars.length) {
      result += zeroWidthChars[zeroWidthIndex]
      zeroWidthIndex++
    }

    return {
      success: true,
      encodedText: result,
      metadata: {
        technique: 'zero-width',
        originalLength: secretMessage.length,
        encodedLength: result.length,
        coverLength: coverText.length,
        compressed: compress,
        encrypted: encryption,
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

    // Extract zero-width characters
    const zeroWidthChars = Array.from(encodedText)
      .filter(char => Object.values(ZERO_WIDTH_CHARS).includes(char))
      .join('')

    if (zeroWidthChars.length === 0) {
      return {
        success: false,
        error: 'No zero-width characters found',
      }
    }

    // Convert zero-width characters to binary
    const binary = Array.from(zeroWidthChars)
      .map(char => CHAR_TO_BINARY[char])
      .join('')

    // Convert binary to string
    let decoded = binaryToString(binary)

    // Decompress if needed
    if (compressed) {
      try {
        // Convert from base64 to binary
        const binaryString = atob(decoded)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        
        // Decompress
        const decompressed = pako.inflate(bytes, { to: 'string' })
        decoded = decompressed
      } catch (e) {
        console.error('Decompression failed:', e)
        // If decompression fails, return as-is (might not be compressed)
      }
    }

    // Trim null bytes and whitespace padding
    decoded = decoded.replace(/\0+$/, '').trim()

    return {
      success: true,
      message: decoded,
      metadata: {
        technique: 'zero-width',
        zeroWidthCharsFound: zeroWidthChars.length,
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
  const zeroWidthCount = Array.from(text)
    .filter(char => Object.values(ZERO_WIDTH_CHARS).includes(char))
    .length

  return {
    detected: zeroWidthCount > 0,
    confidence: zeroWidthCount > 10 ? 0.95 : zeroWidthCount > 5 ? 0.75 : 0.5,
    charactersFound: zeroWidthCount,
  }
}

export function getCapacity(coverText) {
  // Each character position can hold 2 bits (one zero-width char)
  return Math.floor(coverText.length * 2 / 8) // bytes
}