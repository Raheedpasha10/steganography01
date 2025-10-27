// Whitespace manipulation encoding
// Binary encoding: 0 = single space, 1 = double space (or tab)

import pako from 'pako'

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
    const { useDoubleSpace = true, compress = true } = options

    // Convert message to bytes
    const encoder = new TextEncoder()
    let bytes = encoder.encode(secretMessage)
    
    // Compress if needed
    if (compress) {
      const uint8Array = new Uint8Array(bytes)
      bytes = pako.deflate(uint8Array)
    }
    
    // Convert bytes to binary string
    const binary = Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join('')

    // Split cover text into words
    const words = coverText.split(' ')

    if (words.length < binary.length) {
      return {
        success: false,
        error: 'Cover text too short for message',
      }
    }

    // Encode binary into spaces between words
    let result = ''
    for (let i = 0; i < words.length; i++) {
      result += words[i]
      if (i < words.length - 1) {
        if (i < binary.length) {
          const bit = binary[i]
          result += bit === '1' ? (useDoubleSpace ? '  ' : '\t') : ' '
        } else {
          result += ' '
        }
      }
    }

    return {
      success: true,
      encodedText: result,
      metadata: {
        technique: 'whitespace',
        originalLength: secretMessage.length,
        encodedLength: result.length,
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
    const { useDoubleSpace = true, compressed = true } = options

    // Extract spaces between words
    const spaces = encodedText.match(/[ \t]+/g) || []

    // Convert spaces to binary
    const binary = spaces
      .map(space => {
        if (useDoubleSpace) {
          return space.length > 1 ? '1' : '0'
        } else {
          return space === '\t' ? '1' : '0'
        }
      })
      .join('')

    // Convert binary to bytes
    const bytes = []
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.substring(i, i + 8)
      if (byte.length === 8) {
        bytes.push(parseInt(byte, 2))
      }
    }

    // Convert to Uint8Array
    let data = new Uint8Array(bytes)
    
    // Decompress if needed
    if (compressed) {
      try {
        data = pako.inflate(data)
      } catch (e) {
        // Not compressed or corrupted
      }
    }

    // Convert to string
    const decoder = new TextDecoder()
    let message = decoder.decode(data)
    
    // Trim null bytes and whitespace padding
    message = message.replace(/[\x00-\x1F\x7F]+$/g, '').trim()

    return {
      success: true,
      message,
      metadata: {
        technique: 'whitespace',
        spacesFound: spaces.length,
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
  const doubleSpaces = (text.match(/  +/g) || []).length
  const tabs = (text.match(/\t/g) || []).length

  const detected = doubleSpaces > 0 || tabs > 0

  return {
    detected,
    confidence: detected ? (doubleSpaces + tabs > 10 ? 0.85 : 0.65) : 0,
    featuresFound: { doubleSpaces, tabs },
  }
}

export function getCapacity(coverText) {
  const spaces = (coverText.match(/ /g) || []).length
  return Math.floor(spaces / 8) // bytes (1 bit per space)
}