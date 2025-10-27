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
 * Generate text with synonym-friendly words
 */
function generateSynonymFriendly(context, count) {
  const words = []
  const templates = [
    'The {adj} {noun} is very {adj} and {adj}.',
    'This {noun} looks {adj} and {adj}.',
    'That {adj} {noun} seems {adj}.',
    'The {noun} is {adj}, {adj}, and {adj}.',
  ]
  
  while (words.length < count) {
    const template = templates[Math.floor(Math.random() * templates.length)]
    const sentence = template
      .replace(/{adj}/g, () => SYNONYM_WORDS[Math.floor(Math.random() * SYNONYM_WORDS.length)])
      .replace(/{noun}/g, () => WORD_POOLS.nouns[Math.floor(Math.random() * WORD_POOLS.nouns.length)])
    
    words.push(...sentence.split(' '))
  }
  
  return words.slice(0, count)
}

/**
 * Generate text with accented characters for unicode normalization
 */
function generateUnicodeFriendly(count) {
  const words = []
  const templates = [
    '{name} visited the {place} café.',
    'The {place} château is très magnifique.',
    '{name} enjoys café con leche every mañana.',
    'Señor {name} works at the café.',
  ]
  
  while (words.length < count) {
    const template = templates[Math.floor(Math.random() * templates.length)]
    const sentence = template
      .replace(/{name}/g, () => ACCENTED_WORDS[Math.floor(Math.random() * ACCENTED_WORDS.length)])
      .replace(/{place}/g, () => ACCENTED_WORDS[Math.floor(Math.random() * ACCENTED_WORDS.length)])
    
    words.push(...sentence.split(' '))
  }
  
  return words.slice(0, count)
}

/**
 * Generate text with homoglyph-friendly characters
 */
function generateHomoglyphFriendly(context, count) {
  const words = []
  const templates = [
    'The {word} experience is exceptional.',
    'This choice exercises your {word} capacity.',
    'Access to {word} spaces is important.',
    'The {word} process creates opportunities.',
  ]
  
  while (words.length < count) {
    const template = templates[Math.floor(Math.random() * templates.length)]
    const sentence = template
      .replace(/{word}/g, () => HOMOGLYPH_FRIENDLY[Math.floor(Math.random() * HOMOGLYPH_FRIENDLY.length)])
    
    words.push(...sentence.split(' '))
  }
  
  return words.slice(0, count)
}

/**
 * Generate punctuation-rich text
 */
function generatePunctuationRich(context, count) {
  const words = []
  const templates = [
    "Don't you think it's wonderful?",
    "Yes, it's great!",
    "What do you think, isn't it amazing?",
    "I'm sure it's perfect, don't you agree?",
    "Let's go, shall we?",
    "That's right, isn't it?",
  ]
  
  while (words.length < count) {
    const sentence = templates[Math.floor(Math.random() * templates.length)]
    words.push(...sentence.split(' '))
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
 * Calculate how many more words are needed - OPTIMIZED for minimal text
 */
function calculateWordsNeeded(coverText, secretMessage, technique, techniqueModule) {
  // Get current capacity
  const currentCapacity = techniqueModule.getCapacity(coverText)
  
  // For small messages, don't use compression (it adds overhead)
  const secretLength = secretMessage.length
  const useCompression = secretLength > 20
  
  // Calculate required capacity with precision
  let requiredCapacity
  if (useCompression) {
    // With compression, estimate 60% of original size + small buffer
    requiredCapacity = Math.ceil(secretLength * 0.65)
  } else {
    // Without compression, need exact size + 10% buffer
    requiredCapacity = Math.ceil(secretLength * 1.1)
  }
  
  if (currentCapacity >= requiredCapacity) {
    return 0 // No extension needed
  }
  
  // Calculate MINIMAL words needed with technique-specific optimization
  const capacityShortfall = requiredCapacity - currentCapacity
  const wordsPerByte = getOptimalWordsPerByte(technique)
  
  // Add only 20% safety buffer for reliable encoding
  const baseWords = Math.ceil(capacityShortfall * wordsPerByte)
  return Math.ceil(baseWords * 1.2)
}

/**
 * Get OPTIMAL minimal words per byte - precisely calibrated for each technique
 */
function getOptimalWordsPerByte(technique) {
  const ratios = {
    'zero-width': 0.5,      // Extremely efficient - 1 word = ~2 bytes
    'whitespace': 1.2,      // 1 word ~1 byte (space between)
    'homoglyph': 1.5,       // Need substitutable chars
    'unicode-normalization': 2,  // Need accented chars
    'synonym': 2.5,         // Need specific synonyms
    'frequency': 1.2,       // Similar to whitespace
    'punctuation': 2,       // Need punctuation marks
    'invisible-ink': 1,     // Per character
  }
  
  return ratios[technique] || 1.5
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

