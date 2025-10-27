// Homoglyph substitution encoding
// Uses visually similar Unicode characters

import pako from 'pako'

const HOMOGLYPH_MAP = {
  // Latin -> Cyrillic
  'a': ['а', 'a'], // Latin a, Cyrillic а
  'e': ['е', 'e'], // Latin e, Cyrillic е
  'o': ['о', 'o'], // Latin o, Cyrillic о
  'p': ['р', 'p'], // Latin p, Cyrillic р
  'c': ['с', 'c'], // Latin c, Cyrillic с
  'y': ['у', 'y'], // Latin y, Cyrillic у
  'x': ['х', 'x'], // Latin x, Cyrillic х
  'i': ['і', 'i'], // Latin i, Cyrillic і
  's': ['ѕ', 's'], // Latin s, Cyrillic ѕ
  'j': ['ј', 'j'], // Latin j, Cyrillic ј
  'A': ['А', 'A'], // Latin A, Cyrillic А
  'B': ['В', 'B'], // Latin B, Cyrillic В
  'C': ['С', 'C'], // Latin C, Cyrillic С
  'E': ['Е', 'E'], // Latin E, Cyrillic Е
  'H': ['Н', 'H'], // Latin H, Cyrillic Н
  'K': ['К', 'K'], // Latin K, Cyrillic К
  'M': ['М', 'M'], // Latin M, Cyrillic М
  'O': ['О', 'O'], // Latin O, Cyrillic О
  'P': ['Р', 'P'], // Latin P, Cyrillic Р
  'T': ['Т', 'T'], // Latin T, Cyrillic Т
  'X': ['Х', 'X'], // Latin X, Cyrillic Х
  'Y': ['Υ', 'Y'], // Latin Y, Greek Υ
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
    const { compress = true } = options
    
    // Convert and optionally compress message
    const encoder = new TextEncoder()
    let bytes = encoder.encode(secretMessage)
    
    if (compress) {
      bytes = pako.deflate(bytes)
    }
    
    // Convert to binary
    const binary = Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join('')

    // Find substitutable characters in cover text
    const coverChars = Array.from(coverText)
    const substitutablePositions = []

    coverChars.forEach((char, index) => {
      if (HOMOGLYPH_MAP[char]) {
        substitutablePositions.push(index)
      }
    })

    if (substitutablePositions.length < binary.length) {
      return {
        success: false,
        error: 'Not enough substitutable characters in cover text',
      }
    }

    // Encode binary by choosing homoglyph variants
    // bit '1' = use homoglyph (Cyrillic/Greek)
    // bit '0' = keep original (Latin)
    let result = [...coverChars]
    for (let i = 0; i < binary.length && i < substitutablePositions.length; i++) {
      const position = substitutablePositions[i]
      const bit = binary[i]
      const char = coverChars[position]
      const variants = HOMOGLYPH_MAP[char]

      if (variants) {
        result[position] = bit === '1' ? variants[0] : char // Keep original for '0'
      }
    }

    return {
      success: true,
      encodedText: result.join(''),
      metadata: {
        technique: 'homoglyph',
        originalLength: secretMessage.length,
        encodedLength: result.length,
        coverLength: coverText.length,
        compressed: compress,
        substitutions: Math.min(binary.length, substitutablePositions.length),
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
    
    // Extract binary from homoglyphs
    // We need to check each position that could have been substituted
    const chars = Array.from(encodedText)
    let binary = ''

    for (const char of chars) {
      // Check if this char could be a homoglyph position
      let found = false
      
      // Check if it's a Cyrillic/Greek homoglyph (bit '1')
      for (const [original, variants] of Object.entries(HOMOGLYPH_MAP)) {
        if (char === variants[0]) {
          binary += '1'
          found = true
          break
        }
      }
      
      // Check if it's an original Latin char that could be substituted (bit '0')
      if (!found && HOMOGLYPH_MAP[char]) {
        binary += '0'
      }
    }

    if (binary.length === 0) {
      return {
        success: false,
        error: 'No homoglyphs found',
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
        technique: 'homoglyph',
        homoglyphsFound: binary.length,
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
  let homoglyphCount = 0
  const chars = Array.from(text)

  for (const char of chars) {
    for (const variants of Object.values(HOMOGLYPH_MAP)) {
      if (char === variants[0]) {
        homoglyphCount++
        break
      }
    }
  }

  return {
    detected: homoglyphCount > 0,
    confidence: homoglyphCount > 10 ? 0.90 : homoglyphCount > 5 ? 0.70 : 0.5,
    homoglyphsFound: homoglyphCount,
  }
}

export function getCapacity(coverText) {
  let substitutableChars = 0
  Array.from(coverText).forEach(char => {
    if (HOMOGLYPH_MAP[char]) substitutableChars++
  })
  return Math.floor(substitutableChars / 8) // bytes
}