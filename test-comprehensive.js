/**
 * Comprehensive Test Suite for All 8 Steganography Techniques
 * Tests with complex word combinations and edge cases
 */

import * as zeroWidth from './lib/stego/zero-width.js'
import * as whitespace from './lib/stego/whitespace.js'
import * as homoglyph from './lib/stego/homoglyph.js'
import * as unicodeNorm from './lib/stego/unicode-norm.js'
import * as synonym from './lib/stego/synonym.js'
import * as frequency from './lib/stego/frequency.js'
import * as punctuation from './lib/stego/punctuation.js'
import * as invisibleInk from './lib/stego/invisible-ink.js'

const techniques = {
  'zero-width': zeroWidth,
  'whitespace': whitespace,
  'homoglyph': homoglyph,
  'unicode-normalization': unicodeNorm,
  'synonym': synonym,
  'frequency': frequency,
  'punctuation': punctuation,
  'invisible-ink': invisibleInk,
}

// Complex test data with various challenging scenarios
const testCases = [
  {
    name: 'Simple Short Message',
    secret: 'Hello',
    coverTexts: {
      'zero-width': 'This is a simple test message.',
      'whitespace': 'The quick brown fox jumps over the lazy dog.',
      'homoglyph': 'Access to peace and space requires practice.',
      'unicode-normalization': 'Café résumé naïve façade château très.',
      'synonym': 'The good day brings happy thoughts and great joy.',
      'frequency': 'The quick brown fox jumps over the lazy dog.',
      'punctuation': "Don't you think it's wonderful? Yes, it's great!",
      'invisible-ink': 'This is a simple test message with enough text.',
    }
  },
  {
    name: 'Complex Alphanumeric',
    secret: 'Test123!@#',
    coverTexts: {
      'zero-width': 'The world of technology advances rapidly every day.',
      'whitespace': 'Innovation drives progress in ways we never imagined before today.',
      'homoglyph': 'Experience peaceful spaces with precious choices and practice exercises.',
      'unicode-normalization': 'María and José visited the café near the château in español.',
      'synonym': 'The beautiful world creates wonderful opportunities for amazing experiences and great adventures.',
      'frequency': 'Innovation drives progress in ways we never imagined before.',
      'punctuation': "What's happening today? It's amazing, isn't it? Let's celebrate!",
      'invisible-ink': 'The world of technology advances rapidly every single day of the year.',
    }
  },
  {
    name: 'Special Characters',
    secret: '!@#$%^&*()',
    coverTexts: {
      'zero-width': 'Special characters and symbols play important roles in modern computing.',
      'whitespace': 'Technology enables us to communicate across vast distances instantly every single day.',
      'homoglyph': 'The exercise creates precious experiences in peaceful spaces with excellent practice.',
      'unicode-normalization': 'Señor López enjoys café con leche every mañana at the château.',
      'synonym': 'The excellent system provides wonderful services with great efficiency and amazing speed for happy users.',
      'frequency': 'Technology enables us to communicate across vast distances instantly.',
      'punctuation': "Don't forget! What's next? Isn't it exciting? Yes, let's go!",
      'invisible-ink': 'Special characters and symbols play important roles in modern computing systems.',
    }
  },
  {
    name: 'Long Sentence',
    secret: 'The quick brown fox jumps over the lazy dog',
    coverTexts: {
      'zero-width': 'In the realm of artificial intelligence and machine learning, we witness unprecedented advancements that transform our daily lives and reshape the future of technology.',
      'whitespace': 'The evolution of computer science has brought remarkable changes to society, enabling instant global communication, advanced automation, and revolutionary breakthroughs in medical research and environmental conservation.',
      'homoglyph': 'Access to precious experiences requires exceptional practice in peaceful spaces where choice and process create opportunities for presence and exercise in graceful environments.',
      'unicode-normalization': 'María Pérez and José García visited the beautiful café near the ancient château where señor López serves the finest café con leche every mañana in español style.',
      'synonym': 'The beautiful world creates wonderful opportunities for amazing experiences and great adventures with excellent outcomes and fantastic results that bring happy moments and good memories.',
      'frequency': 'The evolution of computer science has brought remarkable changes to society enabling instant global communication and revolutionary breakthroughs.',
      'punctuation': "Don't you think it's wonderful? Yes, it's great! What's next? Isn't it amazing? Let's celebrate! That's fantastic, isn't it?",
      'invisible-ink': 'In the realm of artificial intelligence and machine learning we witness unprecedented advancements that transform our daily lives and reshape the future of technology in remarkable ways.',
    }
  },
  {
    name: 'Mixed Content',
    secret: 'ABC123xyz!@#',
    coverTexts: {
      'zero-width': 'Modern cryptography combines mathematics and computer science to ensure secure digital communications.',
      'whitespace': 'Digital security protocols protect sensitive information through advanced encryption methods and sophisticated authentication systems.',
      'homoglyph': 'The precious choice requires exceptional practice in peaceful spaces where process creates access to graceful experiences.',
      'unicode-normalization': 'The señorita enjoys café and piñata celebrations at the château with jalapeño dishes every año.',
      'synonym': 'The amazing technology provides excellent security with wonderful protection and great efficiency for happy users and good outcomes.',
      'frequency': 'Digital security protocols protect sensitive information through advanced encryption methods.',
      'punctuation': "What's the plan? It's simple, isn't it? Let's start! Don't worry, it's easy!",
      'invisible-ink': 'Modern cryptography combines mathematics and computer science to ensure secure digital communications worldwide.',
    }
  },
  {
    name: 'Numbers Only',
    secret: '1234567890',
    coverTexts: {
      'zero-width': 'Numerical data processing requires efficient algorithms and optimized computational resources.',
      'whitespace': 'Statistical analysis and data science rely on mathematical models and computational power.',
      'homoglyph': 'The process creates exceptional experiences through practice in peaceful spaces with precious choices.',
      'unicode-normalization': 'García Martínez González Pérez López José María names from español culture.',
      'synonym': 'The good system provides excellent results with great efficiency and wonderful performance.',
      'frequency': 'Statistical analysis and data science rely on mathematical models.',
      'punctuation': "It's working! Isn't that great? What's next? Let's continue!",
      'invisible-ink': 'Numerical data processing requires efficient algorithms and optimized computational resources today.',
    }
  },
  {
    name: 'Unicode Characters',
    secret: '你好世界',
    coverTexts: {
      'zero-width': 'International communication transcends language barriers through innovative translation technologies and universal understanding.',
      'whitespace': 'Global connectivity enables people from diverse cultures to share knowledge and collaborate across continents.',
      'homoglyph': 'The exceptional practice creates precious experiences in peaceful spaces with graceful presence and choice.',
      'unicode-normalization': 'The café résumé includes naïve façade descriptions of château très magnifique señor López.',
      'synonym': 'The beautiful world enables wonderful communication with amazing technology and excellent global connectivity.',
      'frequency': 'Global connectivity enables people from diverse cultures to share knowledge.',
      'punctuation': "What's happening? It's amazing! Don't you agree? Yes, let's celebrate!",
      'invisible-ink': 'International communication transcends language barriers through innovative translation technologies worldwide.',
    }
  },
  {
    name: 'Very Long Message',
    secret: 'This is a comprehensive test of the steganography system with multiple words and complex patterns',
    coverTexts: {
      'zero-width': 'The advancement of steganography techniques in modern digital communications represents a significant milestone in information security and privacy protection. Advanced algorithms enable sophisticated encoding methods that remain undetectable to casual observers while maintaining perfect fidelity of the original message content.',
      'whitespace': 'Information hiding technologies have evolved dramatically over the past decades with the introduction of sophisticated mathematical frameworks and computational approaches that enable secure covert communications across various digital media platforms while maintaining plausible deniability and resistance to statistical analysis attacks.',
      'homoglyph': 'The exceptional practice of creating precious experiences in peaceful spaces requires graceful presence and careful choice of process that enables access to remarkable opportunities for meaningful presence in comfortable environments where exceptional exercise creates lasting impressions.',
      'unicode-normalization': 'María Pérez and José García frequently visit the beautiful café near the ancient château where señor López and señora Martínez serve the finest café con leche every mañana while discussing español literature and culture with their friends from González and Rodríguez families.',
      'synonym': 'The beautiful world creates wonderful opportunities for amazing experiences and great adventures with excellent outcomes and fantastic results that bring happy moments and good memories while providing exceptional value and outstanding quality with remarkable efficiency and superb performance.',
      'frequency': 'Information hiding technologies have evolved dramatically over the past decades with the introduction of sophisticated mathematical frameworks and computational approaches that enable secure covert communications across various digital media platforms.',
      'punctuation': "Don't you think it's wonderful? Yes, it's absolutely great! What's happening next? Isn't it amazing? Let's celebrate together! That's fantastic, isn't it? Where shall we go? What's the plan?",
      'invisible-ink': 'The advancement of steganography techniques in modern digital communications represents a significant milestone in information security and privacy protection using advanced algorithms that enable sophisticated encoding methods maintaining perfect fidelity.',
    }
  },
]

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  details: []
}

/**
 * Clean decoded message from control characters
 */
function cleanMessage(msg) {
  if (!msg) return ''
  return msg.replace(/[\x00-\x1F\x7F]+$/g, '').trim()
}

/**
 * Test a single technique with a test case
 */
async function testTechnique(techniqueName, technique, testCase, secret, coverText) {
  const testName = `${techniqueName}: ${testCase.name}`
  
  try {
    // Determine compression based on message length
    const useCompression = secret.length > 20
    
    // Test encoding
    const encoded = technique.encode(coverText, secret, { compress: useCompression })
    
    if (!encoded || (!encoded.encodedText && !encoded.result)) {
      throw new Error(`Encoding failed - ${encoded?.error || 'no result'}`)
    }
    
    // Get encoded text (different techniques use different property names)
    const encodedText = encoded.encodedText || encoded.result
    
    // Test decoding
    const decoded = technique.decode(encodedText, { compressed: useCompression })
    
    if (!decoded || !decoded.message) {
      throw new Error('Decoding failed - no message')
    }
    
    // Clean the decoded message
    const cleanedMessage = cleanMessage(decoded.message)
    
    // Verify message integrity
    if (cleanedMessage !== secret) {
      throw new Error(`Message mismatch!\nExpected: "${secret}"\nGot: "${cleanedMessage}"`)
    }
    
    // Success!
    console.log(`✅ ${testName}`)
    console.log(`   Secret: "${secret}"`)
    console.log(`   Decoded: "${cleanedMessage}"`)
    console.log(`   Compression: ${useCompression ? 'Yes' : 'No'}`)
    console.log(`   Cover length: ${coverText.length} → Encoded: ${encodedText.length}`)
    console.log('')
    
    results.passed++
    results.details.push({
      test: testName,
      status: 'PASS',
      secret,
      decoded: cleanedMessage,
      compressed: useCompression
    })
    
  } catch (error) {
    console.error(`❌ ${testName}`)
    console.error(`   Error: ${error.message}`)
    console.error(`   Secret: "${secret}"`)
    console.error('')
    
    results.failed++
    results.details.push({
      test: testName,
      status: 'FAIL',
      error: error.message,
      secret
    })
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🧪 COMPREHENSIVE STEGANOGRAPHY TEST SUITE\n')
  console.log('=' .repeat(80))
  console.log('\n')
  
  for (const testCase of testCases) {
    console.log(`\n📋 Test Case: ${testCase.name}`)
    console.log('-'.repeat(80))
    
    for (const [techniqueName, technique] of Object.entries(techniques)) {
      const coverText = testCase.coverTexts[techniqueName]
      await testTechnique(techniqueName, technique, testCase, testCase.secret, coverText)
    }
  }
  
  // Print summary
  console.log('\n')
  console.log('=' .repeat(80))
  console.log('📊 TEST SUMMARY')
  console.log('=' .repeat(80))
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`)
  console.log('')
  
  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:')
    results.details.filter(d => d.status === 'FAIL').forEach(d => {
      console.log(`   - ${d.test}: ${d.error}`)
    })
  } else {
    console.log('\n🎉 ALL TESTS PASSED! 🎉')
  }
  
  console.log('')
}

// Run tests
runAllTests().catch(console.error)

