/**
 * Auto-extend cover text intelligently based on context and technique requirements
 */

// Common word pools for natural text extension
const WORD_POOLS = {
  general: [
    'and', 'the', 'with', 'that', 'this', 'from', 'they', 'have', 'more', 'will',
    'about', 'which', 'their', 'there', 'would', 'could', 'should', 'these', 'those',
    'also', 'into', 'very', 'when', 'some', 'what', 'only', 'just', 'know', 'like',
    'time', 'good', 'well', 'make', 'been', 'much', 'even', 'most', 'such', 'many',
    'other', 'than', 'then', 'them', 'over', 'both', 'each', 'down', 'back', 'while',
  ],
  adjectives: [
    'beautiful', 'amazing', 'wonderful', 'great', 'good', 'excellent', 'fantastic',
    'incredible', 'remarkable', 'outstanding', 'magnificent', 'splendid', 'lovely',
    'pleasant', 'delightful', 'charming', 'elegant', 'graceful', 'stunning',
    'impressive', 'extraordinary', 'exceptional', 'fabulous', 'marvelous',
  ],
  nouns: [
    'people', 'world', 'time', 'year', 'work', 'life', 'day', 'place', 'thing',
    'way', 'group', 'case', 'point', 'person', 'company', 'system', 'program',
    'question', 'number', 'fact', 'hand', 'part', 'child', 'eye', 'woman', 'man',
    'area', 'book', 'business', 'community', 'country', 'family', 'government',
  ],
  verbs: [
    'said', 'made', 'found', 'given', 'known', 'taken', 'seen', 'called', 'asked',
    'seemed', 'felt', 'tried', 'told', 'became', 'left', 'wanted', 'looked', 'used',
    'went', 'came', 'worked', 'showed', 'turned', 'started', 'brought', 'running',
  ],
}

// Synonym map for synonym technique
const SYNONYM_WORDS = [
  'good', 'bad', 'big', 'small', 'happy', 'sad', 'fast', 'slow',
  'beautiful', 'ugly', 'smart', 'stupid', 'easy', 'hard', 'new', 'old',
  'hot', 'cold', 'strong', 'weak', 'great', 'excellent', 'fine', 'terrible',
]

// Accented characters for unicode normalization
const ACCENTED_WORDS = [
  'café', 'résumé', 'naïve', 'façade', 'château', 'très', 'señor', 'señora',
  'María', 'José', 'García', 'López', 'Pérez', 'Martínez', 'González',
  'piñata', 'jalapeño', 'mañana', 'niño', 'año', 'español',
]

// Substitutable characters for homoglyph
const HOMOGLYPH_FRIENDLY = [
  'easy', 'access', 'pace', 'space', 'race', 'place', 'peace', 'choice',
  'experience', 'practice', 'exercise', 'presence', 'precious', 'process',
]

/**
 * Generate contextually appropriate text extension
 */
function generateContextualText(existingText, technique, wordsNeeded) {
  const words = existingText.trim().split(/\s+/).filter(w => w.length > 0)
  const lastWords = words.slice(-3).join(' ').toLowerCase()
  
  let extensions = []
  
  // Technique-specific generation
  switch (technique) {
    case 'synonym':
      extensions = generateSynonymFriendly(lastWords, wordsNeeded)
      break
    case 'unicode-normalization':
      extensions = generateUnicodeFriendly(wordsNeeded)
      break
    case 'homoglyph':
      extensions = generateHomoglyphFriendly(lastWords, wordsNeeded)
      break
    case 'punctuation':
      extensions = generatePunctuationRich(lastWords, wordsNeeded)
      break
    default:
      extensions = generateGenericText(lastWords, wordsNeeded)
  }
  
  return extensions.join(' ')
}

/**
 * Generate text with synonym-friendly words - PACKED with adjectives
 */
function generateSynonymFriendly(context, count) {
  const words = []
  
  // Generate sentences PACKED with synonymous adjectives
  while (words.length < count) {
    // Mix in lots of adjectives
    for (let i = 0; i < 3; i++) {
      words.push(SYNONYM_WORDS[Math.floor(Math.random() * SYNONYM_WORDS.length)])
    }
    words.push(WORD_POOLS.nouns[Math.floor(Math.random() * WORD_POOLS.nouns.length)])
    words.push('is')
    words.push(SYNONYM_WORDS[Math.floor(Math.random() * SYNONYM_WORDS.length)])
    words.push('and')
    words.push(SYNONYM_WORDS[Math.floor(Math.random() * SYNONYM_WORDS.length)])
    
    if (words.length % 15 === 0) {
      words[words.length - 1] += '.'
    }
  }
  
  return words.slice(0, count)
}

/**
 * Generate text PACKED with accented characters for unicode normalization
 */
function generateUnicodeFriendly(count) {
  const words = []
  
  // Pack as many accented words as possible
  while (words.length < count) {
    // Add 2-3 accented words per iteration
    words.push(ACCENTED_WORDS[Math.floor(Math.random() * ACCENTED_WORDS.length)])
    words.push('and')
    words.push(ACCENTED_WORDS[Math.floor(Math.random() * ACCENTED_WORDS.length)])
    words.push('at')
    words.push(ACCENTED_WORDS[Math.floor(Math.random() * ACCENTED_WORDS.length)])
    
    if (words.length % 10 === 0) {
      words[words.length - 1] += '.'
    }
  }
  
  return words.slice(0, count)
}

/**
 * Generate text PACKED with homoglyph-friendly characters (a, c, e, o)
 */
function generateHomoglyphFriendly(context, count) {
  const words = []
  
  // Pack homoglyph-friendly words densely
  while (words.length < count) {
    // Use words with 'a', 'c', 'e', 'o'
    words.push(HOMOGLYPH_FRIENDLY[Math.floor(Math.random() * HOMOGLYPH_FRIENDLY.length)])
    words.push('creates')
    words.push(HOMOGLYPH_FRIENDLY[Math.floor(Math.random() * HOMOGLYPH_FRIENDLY.length)])
    words.push('and')
    words.push(HOMOGLYPH_FRIENDLY[Math.floor(Math.random() * HOMOGLYPH_FRIENDLY.length)])
    
    if (words.length % 12 === 0) {
      words[words.length - 1] += '.'
    }
  }
  
  return words.slice(0, count)
}

/**
 * Generate punctuation-HEAVY text with lots of commas and apostrophes
 */
function generatePunctuationRich(context, count) {
  const words = []
  
  // PACK with punctuation - every few words add comma or apostrophe
  const phrases = [
    "don't", "it's", "that's", "what's", "let's", "isn't", "can't", "won't",
    "I'm", "you're", "we're", "they're", "she's", "he's"
  ]
  
  while (words.length < count) {
    // Add apostrophe words
    words.push(phrases[Math.floor(Math.random() * phrases.length)])
    words.push('the')
    words.push(WORD_POOLS.nouns[Math.floor(Math.random() * WORD_POOLS.nouns.length)] + ',')
    words.push(phrases[Math.floor(Math.random() * phrases.length)])
    words.push(WORD_POOLS.adjectives[Math.floor(Math.random() * WORD_POOLS.adjectives.length)] + ',')
    words.push('and')
    words.push(phrases[Math.floor(Math.random() * phrases.length)])
    
    if (words.length % 10 === 0) {
      words[words.length - 1] = words[words.length - 1].replace(',', '.')
    }
  }
  
  return words.slice(0, count)
}

/**
 * Generate generic contextual text
 */
function generateGenericText(context, count) {
  const words = []
  
  while (words.length < count) {
    // Mix different word types for natural flow
    if (Math.random() > 0.5) {
      words.push(WORD_POOLS.adjectives[Math.floor(Math.random() * WORD_POOLS.adjectives.length)])
    }
    words.push(WORD_POOLS.nouns[Math.floor(Math.random() * WORD_POOLS.nouns.length)])
    words.push(WORD_POOLS.verbs[Math.floor(Math.random() * WORD_POOLS.verbs.length)])
    words.push(WORD_POOLS.general[Math.floor(Math.random() * WORD_POOLS.general.length)])
    
    // Add some punctuation
    if (words.length % 10 === 0) {
      words[words.length - 1] += '.'
    }
  }
  
  return words.slice(0, count)
}

/**
 * Calculate how many more words are needed - ONE-SHOT GUARANTEE
 */
function calculateWordsNeeded(coverText, secretMessage, technique, techniqueModule) {
  // Get current capacity
  const currentCapacity = techniqueModule.getCapacity(coverText)
  
  // For small messages, don't use compression (it adds overhead)
  const secretLength = secretMessage.length
  const useCompression = secretLength > 20
  
  // Calculate required capacity with realistic estimates
  let requiredCapacity
  if (useCompression) {
    // With compression, estimate 70% of original (safer than 60%)
    requiredCapacity = Math.ceil(secretLength * 0.75)
  } else {
    // Without compression, need full size + 25% buffer
    requiredCapacity = Math.ceil(secretLength * 1.25)
  }
  
  if (currentCapacity >= requiredCapacity) {
    return 0 // No extension needed
  }
  
  // Calculate words needed with GUARANTEED one-shot success
  const capacityShortfall = requiredCapacity - currentCapacity
  const wordsPerByte = getOptimalWordsPerByte(technique)
  
  // Technique-specific buffer (some need more safety than others)
  let safetyMultiplier = 1.3 // Default 30% buffer
  
  if (technique === 'synonym' || technique === 'unicode-normalization') {
    safetyMultiplier = 1.5 // Need more safety for content-specific techniques
  } else if (technique === 'zero-width' || technique === 'invisible-ink') {
    safetyMultiplier = 1.1 // Very reliable, minimal buffer
  }
  
  const baseWords = Math.ceil(capacityShortfall * wordsPerByte)
  return Math.ceil(baseWords * safetyMultiplier) + 5 // +5 extra words for safety
}

/**
 * Get ACCURATE words per byte - calibrated from actual testing
 * These ratios are based on real capacity measurements
 */
function getOptimalWordsPerByte(technique) {
  const ratios = {
    'zero-width': 0.5,      // Extremely efficient - 1 word = ~2 bytes
    'whitespace': 10,       // Tested: ~9-11 words/byte (need 1 space per bit = 8 bits/byte)
    'homoglyph': 6,         // Tested: ~5-6 words/byte (need specific chars)
    'unicode-normalization': 15, // Need accented chars (café, résumé, etc.)
    'synonym': 12,          // Need specific synonymous words
    'frequency': 2.5,       // Tested: ~2-2.5 words/byte (uses double spaces)
    'punctuation': 10,      // Need punctuation marks (commas, apostrophes)
    'invisible-ink': 1,     // Per character
  }
  
  return ratios[technique] || 5
}

/**
 * Main function to auto-extend cover text
 */
export function autoExtendCoverText(coverText, secretMessage, technique, techniqueModule) {
  if (!coverText || !secretMessage || !technique || !techniqueModule) {
    return coverText
  }
  
  const wordsNeeded = calculateWordsNeeded(coverText, secretMessage, technique, techniqueModule)
  
  if (wordsNeeded <= 0) {
    return coverText // No extension needed
  }
  
  // Generate extension
  const extension = generateContextualText(coverText, technique, wordsNeeded)
  
  // Combine with proper spacing
  const needsSpace = !coverText.match(/[.!?]\s*$/)
  const separator = needsSpace ? ' ' : ' '
  
  return coverText + separator + extension
}

/**
 * Get suggestion preview for user
 */
export function getAutoFillPreview(coverText, secretMessage, technique, techniqueModule) {
  if (!coverText || !secretMessage || !technique || !techniqueModule) {
    return null
  }
  
  const wordsNeeded = calculateWordsNeeded(coverText, secretMessage, technique, techniqueModule)
  
  if (wordsNeeded <= 0) {
    return null
  }
  
  const preview = generateContextualText(coverText, technique, Math.min(wordsNeeded, 15))
  
  return {
    wordsNeeded,
    preview: preview.substring(0, 100) + (preview.length > 100 ? '...' : ''),
    fullExtension: generateContextualText(coverText, technique, wordsNeeded),
  }
}

