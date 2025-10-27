// Unicode normalization encoding
// Exploits NFC (composed) vs NFD (decomposed) forms
import pako from 'pako'

const DECOMPOSABLE_CHARS = {
  'é': { nfc: '\u00E9', nfd: 'e\u0301' },
  'á': { nfc: '\u00E1', nfd: 'a\u0301' },
  'í': { nfc: '\u00ED', nfd: 'i\u0301' },
  'ó': { nfc: '\u00F3', nfd: 'o\u0301' },
  'ú': { nfc: '\u00FA', nfd: 'u\u0301' },
  'à': { nfc: '\u00E0', nfd: 'a\u0300' },
  'è': { nfc: '\u00E8', nfd: 'e\u0300' },
  'ì': { nfc: '\u00EC', nfd: 'i\u0300' },
  'ò': { nfc: '\u00F2', nfd: 'o\u0300' },
  'ù': { nfc: '\u00F9', nfd: 'u\u0300' },
  'ñ': { nfc: '\u00F1', nfd: 'n\u0303' },
  'ç': { nfc: '\u00E7', nfd: 'c\u0327' },
  'ü': { nfc: '\u00FC', nfd: 'u\u0308' },
  'ö': { nfc: '\u00F6', nfd: 'o\u0308' },
  'ä': { nfc: '\u00E4', nfd: 'a\u0308' },
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

function hasDecomposableChar(text) {
  return Object.keys(DECOMPOSABLE_CHARS).some(char => text.includes(char))
}

export function encode(coverText, secretMessage, options = {}) {
  try {
    const { compress = true } = options
    // Convert message to binary with optional compression
    const encoder = new TextEncoder()
    let bytes = encoder.encode(secretMessage)
    
    if (compress) {
      bytes = pako.deflate(bytes)
    }
    
    const binary = Array.from(bytes)
      .map(byte => byte.toString(2).padStart(8, '0'))
      .join('')

    // If cover text doesn't have decomposable chars, add them
    let modifiedCover = coverText
    if (!hasDecomposableChar(coverText)) {
      // Add accented characters at strategic positions
      // Replace some 'e's with 'é', 'a's with 'á', etc.
      modifiedCover = coverText
        .replace(/e/g, (match, offset) => {
          if (offset % 10 === 0) return 'é'
          return match
        })
        .replace(/a/g, (match, offset) => {
          if (offset % 12 === 0) return 'á'
          return match
        })
    }

    // Find decomposable characters
    const chars = Array.from(modifiedCover)
    const decomposablePositions = []

    chars.forEach((char, index) => {
      if (DECOMPOSABLE_CHARS[char]) {
        decomposablePositions.push({ index, char })
      }
    })

    if (decomposablePositions.length < binary.length) {
      return {
        success: false,
        error: 'Not enough decomposable characters in cover text',
      }
    }

    // Encode binary using NFC/NFD forms
    let result = [...chars]
    for (let i = 0; i < binary.length && i < decomposablePositions.length; i++) {
      const { index, char } = decomposablePositions[i]
      const bit = binary[i]
      const forms = DECOMPOSABLE_CHARS[char]

      if (forms) {
        // Use NFD for 1, NFC for 0
        result[index] = bit === '1' ? forms.nfd : forms.nfc
      }
    }

    return {
      success: true,
      encodedText: result.join(''),
      metadata: {
        technique: 'unicode-normalization',
        originalLength: secretMessage.length,
        encodedLength: result.join('').length,
        coverLength: modifiedCover.length,
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
    // Extract binary from normalization forms
    const chars = Array.from(encodedText)
    let binary = ''

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i]
      
      // Check for decomposed forms (NFD)
      if (i < chars.length - 1) {
        const twoChar = char + chars[i + 1]
        for (const [original, forms] of Object.entries(DECOMPOSABLE_CHARS)) {
          if (twoChar === forms.nfd) {
            binary += '1'
            i++ // Skip next char as it's part of the decomposed form
            break
          }
        }
      }

      // Check for composed forms (NFC)
      for (const [original, forms] of Object.entries(DECOMPOSABLE_CHARS)) {
        if (char === forms.nfc) {
          binary += '0'
          break
        }
      }
    }

    if (binary.length === 0) {
      return {
        success: false,
        error: 'No Unicode normalization variations found',
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
        technique: 'unicode-normalization',
        variationsFound: binary.length,
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
  let decomposedCount = 0
  const chars = Array.from(text)

  for (let i = 0; i < chars.length - 1; i++) {
    const twoChar = chars[i] + chars[i + 1]
    for (const forms of Object.values(DECOMPOSABLE_CHARS)) {
      if (twoChar === forms.nfd) {
        decomposedCount++
        break
      }
    }
  }

  return {
    detected: decomposedCount > 0,
    confidence: decomposedCount > 5 ? 0.85 : decomposedCount > 2 ? 0.65 : 0.45,
    decomposedFormsFound: decomposedCount,
  }
}

export function getCapacity(coverText) {
  let decomposableChars = 0
  Array.from(coverText).forEach(char => {
    if (DECOMPOSABLE_CHARS[char]) decomposableChars++
  })
  return Math.floor(decomposableChars / 8) // bytes
}