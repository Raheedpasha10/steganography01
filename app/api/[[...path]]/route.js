import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import * as zeroWidth from '@/lib/stego/zero-width'
import * as whitespace from '@/lib/stego/whitespace'
import * as homoglyph from '@/lib/stego/homoglyph'
import * as unicodeNorm from '@/lib/stego/unicode-norm'
import * as synonym from '@/lib/stego/synonym'
import * as frequency from '@/lib/stego/frequency'
import * as punctuation from '@/lib/stego/punctuation'
import * as invisibleInk from '@/lib/stego/invisible-ink'

// Initialize Supabase (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Initialize Anthropic with Emergent LLM key
const anthropic = new Anthropic({
  apiKey: process.env.EMERGENT_LLM_KEY,
})

const TECHNIQUES = {
  'zero-width': zeroWidth,
  'whitespace': whitespace,
  'homoglyph': homoglyph,
  'unicode-normalization': unicodeNorm,
  'synonym': synonym,
  'frequency': frequency,
  'punctuation': punctuation,
  'invisible-ink': invisibleInk,
}

// Helper to get user from request
async function getUser(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  return user
}

// POST /api/encode
async function handleEncode(request) {
  try {
    const body = await request.json()
    const { coverText, secretMessage, technique, options = {} } = body

    if (!coverText || !secretMessage) {
      return NextResponse.json(
        { success: false, error: 'Cover text and secret message are required' },
        { status: 400 }
      )
    }

    if (!TECHNIQUES[technique]) {
      return NextResponse.json(
        { success: false, error: 'Invalid technique' },
        { status: 400 }
      )
    }

    // Encode the message
    const result = TECHNIQUES[technique].encode(coverText, secretMessage, options)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    // Try to get user and save to database
    const user = await getUser(request)
    if (user) {
      try {
        await supabase.from('encoded_messages').insert({
          user_id: user.id,
          cover_text: coverText.substring(0, 1000), // Limit stored text
          encoded_text: result.encodedText.substring(0, 1000),
          secret_message_hash: secretMessage.length.toString(), // Don't store actual message
          technique,
          technique_params: options,
          is_encrypted: options.encryption || false,
          message_size_bytes: secretMessage.length,
          capacity_used_percent: (secretMessage.length / TECHNIQUES[technique].getCapacity(coverText) * 100).toFixed(2),
          detection_risk: 'Low',
        })
      } catch (dbError) {
        console.error('Failed to save to database:', dbError)
        // Continue even if DB save fails
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Encode error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/decode
async function handleDecode(request) {
  try {
    const body = await request.json()
    const { encodedText, technique, options = {} } = body

    if (!encodedText) {
      return NextResponse.json(
        { success: false, error: 'Encoded text is required' },
        { status: 400 }
      )
    }

    if (!TECHNIQUES[technique]) {
      return NextResponse.json(
        { success: false, error: 'Invalid technique' },
        { status: 400 }
      )
    }

    // Decode the message
    const result = TECHNIQUES[technique].decode(encodedText, options)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    // Try to get user and save to database
    const user = await getUser(request)
    if (user) {
      try {
        await supabase.from('decoded_messages').insert({
          user_id: user.id,
          encoded_text: encodedText.substring(0, 1000),
          decoded_message: result.message.substring(0, 500),
          detected_technique: technique,
          detection_confidence: 0.95,
          auto_detected: false,
          decode_status: 'success',
        })
      } catch (dbError) {
        console.error('Failed to save to database:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Decode error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/ai/detect
async function handleAIDetect(request) {
  try {
    const body = await request.json()
    const { text, features, quickResults } = body

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      )
    }

    // Prepare prompt for Claude
    const prompt = `You are an expert in steganography detection. Analyze the following text to determine if it contains hidden messages and identify the technique used.

Text to analyze: "${text.substring(0, 500)}..."

Extracted features:
- Zero-width characters: ${features.zeroWidthCount}
- Double spaces: ${features.doubleSpaces}
- Tabs: ${features.tabs}
- Cyrillic characters: ${features.cyrillicChars}
- Combining marks: ${features.combiningMarks}
- Entropy: ${features.entropy.toFixed(2)}

Quick rule-based detection results:
${quickResults.map(r => `- ${r.technique}: ${(r.confidence * 100).toFixed(0)}% confidence`).join('\\n')}

Available techniques:
1. zero-width: Uses invisible Unicode characters (ZWSP, ZWJ, ZWNJ, ZWNBSP)
2. whitespace: Uses spaces and tabs to encode data
3. homoglyph: Uses visually similar Unicode characters (Latin/Cyrillic)
4. unicode-normalization: Uses composed/decomposed Unicode forms (NFC vs NFD)
5. synonym: Replaces words with synonyms to encode data
6. frequency: Subtle character frequency manipulation
7. punctuation: Uses punctuation variations (commas vs semicolons, quote styles)
8. invisible-ink: HTML with near-invisible color differences

Respond in JSON format:
{
  "technique": "detected technique name or null",
  "confidence": 0.0-1.0,
  "reasoning": "detailed explanation of your analysis",
  "alternativePredictions": [
    {
      "technique": "alternative technique",
      "confidence": 0.0-1.0,
      "reasoning": "why this might be it"
    }
  ]
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: 'You are an expert steganography analyst. Always respond in valid JSON format.',
      messages: [
        { role: 'user', content: prompt }
      ],
    })

    // Parse Claude's response
    const content = response.content[0].text
    
    // Try to extract JSON from the response
    let aiResult
    try {
      // Look for JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found')
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.error('Failed to parse Claude response:', content)
      
      // Use rule-based as fallback
      if (quickResults.length > 0) {
        return NextResponse.json({
          success: true,
          technique: quickResults[0].technique,
          confidence: quickResults[0].confidence,
          reasoning: 'AI analysis inconclusive, using rule-based detection',
          alternativePredictions: quickResults.slice(1, 3),
          features,
          method: 'rule-based-fallback',
        })
      }
      
      return NextResponse.json({
        success: false,
        error: 'No steganography detected',
        features,
      })
    }

    return NextResponse.json({
      success: true,
      ...aiResult,
      features,
      method: 'ai-powered',
    })

  } catch (error) {
    console.error('AI detect error:', error)
    
    // Fallback to rule-based on error
    const body = await request.json()
    const { quickResults, features } = body
    
    if (quickResults && quickResults.length > 0) {
      return NextResponse.json({
        success: true,
        technique: quickResults[0].technique,
        confidence: quickResults[0].confidence,
        reasoning: 'AI unavailable, rule-based detection',
        alternativePredictions: quickResults.slice(1, 3),
        features,
        method: 'rule-based-fallback',
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Detection failed', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/ai/recommend
async function handleAIRecommend(request) {
  try {
    const body = await request.json()
    const { coverText, secretMessage, capacities } = body

    if (!coverText || !secretMessage) {
      return NextResponse.json(
        { success: false, error: 'Cover text and secret message are required' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert in steganography. Recommend the best technique(s) for hiding a secret message in the given cover text.

Cover text length: ${coverText.length} characters
Secret message length: ${secretMessage.length} characters

Available techniques and their capacities:
${capacities.map(c => `- ${c.technique}: ${c.capacity} bytes capacity (${c.capacity >= c.required ? 'VIABLE' : 'TOO SMALL'})`).join('\\n')}

Technique descriptions:
1. zero-width: Uses invisible Unicode characters. High capacity, low detectability, works everywhere.
2. whitespace: Uses spaces/tabs. Medium capacity, low-medium detectability, simple.
3. homoglyph: Uses lookalike characters. Medium capacity, very low detectability, sophisticated.
4. unicode-normalization: Uses composed/decomposed Unicode. Low-medium capacity, very low detectability, requires special characters.
5. synonym: Replaces words with synonyms. Medium capacity, very low detectability, context-dependent.
6. frequency: Subtle character frequency manipulation. Low capacity, extremely low detectability, advanced.
7. punctuation: Uses punctuation variations. Medium capacity, low detectability, requires proper punctuation.
8. invisible-ink: HTML with near-invisible color differences. High capacity, very low detectability, requires HTML support.

Consider:
- Capacity requirements
- Detectability (stealth)
- Reliability
- Platform compatibility

Recommend the top 3 viable techniques in order. Respond in JSON:
{
  "recommendations": [
    {
      "rank": 1,
      "technique": "technique name",
      "score": 0-100,
      "reasoning": "why this is best",
      "pros": ["advantage 1", "advantage 2"],
      "cons": ["limitation 1", "limitation 2"]
    }
  ]
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: 'You are a steganography expert. Always respond in valid JSON format.',
      messages: [
        { role: 'user', content: prompt }
      ],
    })

    // Parse Claude's response
    const content = response.content[0].text
    
    let recommendations
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found')
      }
    } catch (parseError) {
      console.error('Failed to parse recommendation:', content)
      
      // Simple fallback
      const viable = capacities.filter(c => c.capacity >= c.required)
      const scored = viable.map(v => ({
        rank: v.technique === 'zero-width' ? 1 : v.technique === 'whitespace' ? 2 : 3,
        technique: v.technique,
        score: v.technique === 'zero-width' ? 95 : v.technique === 'whitespace' ? 85 : 75,
        reasoning: `${v.capacity} bytes capacity available`,
        pros: ['Sufficient capacity', 'Reliable'],
        cons: [],
      }))
      
      scored.sort((a, b) => a.rank - b.rank)
      
      return NextResponse.json({
        success: true,
        recommendations: scored.slice(0, 3),
        method: 'rule-based-fallback',
      })
    }

    return NextResponse.json({
      success: true,
      ...recommendations,
      method: 'ai-powered',
    })

  } catch (error) {
    console.error('AI recommend error:', error)
    
    // Fallback
    const body = await request.json()
    const { capacities } = body
    
    const viable = capacities.filter(c => c.capacity >= c.required)
    const scored = viable.map(v => ({
      rank: v.technique === 'zero-width' ? 1 : v.technique === 'whitespace' ? 2 : 3,
      technique: v.technique,
      score: v.technique === 'zero-width' ? 95 : v.technique === 'whitespace' ? 85 : 75,
      reasoning: 'Rule-based recommendation',
      pros: ['Sufficient capacity'],
      cons: [],
    }))
    
    scored.sort((a, b) => a.rank - b.rank)
    
    return NextResponse.json({
      success: true,
      recommendations: scored.slice(0, 3),
      method: 'rule-based-fallback',
    })
  }
}

// GET /api/history
async function handleGetHistory(request) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get encoded messages
    const { data: encoded, error: encodedError } = await supabase
      .from('encoded_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    // Get decoded messages
    const { data: decoded, error: decodedError } = await supabase
      .from('decoded_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({
      success: true,
      encoded: encoded || [],
      decoded: decoded || [],
    })
  } catch (error) {
    console.error('History error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/history/:id
async function handleDeleteHistory(request, id) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Try to delete from encoded_messages
    await supabase
      .from('encoded_messages')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    // Try to delete from decoded_messages
    await supabase
      .from('decoded_messages')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Main router
export async function GET(request, { params }) {
  const path = params?.path?.join('/') || ''

  if (path === 'history') {
    return handleGetHistory(request)
  }

  return NextResponse.json({ 
    message: 'SteganoText Pro API',
    version: '1.0',
    endpoints: [
      'POST /api/encode',
      'POST /api/decode',
      'POST /api/ai/detect',
      'POST /api/ai/recommend',
      'GET /api/history',
      'DELETE /api/history/:id'
    ]
  })
}

export async function POST(request, { params }) {
  const path = params?.path?.join('/') || ''

  if (path === 'encode') {
    return handleEncode(request)
  }

  if (path === 'decode') {
    return handleDecode(request)
  }

  if (path === 'ai/detect') {
    return handleAIDetect(request)
  }

  if (path === 'ai/recommend') {
    return handleAIRecommend(request)
  }

  return NextResponse.json(
    { error: 'Not found' },
    { status: 404 }
  )
}

export async function DELETE(request, { params }) {
  const path = params?.path?.join('/') || ''
  
  if (path.startsWith('history/')) {
    const id = path.split('/')[1]
    return handleDeleteHistory(request, id)
  }

  return NextResponse.json(
    { error: 'Not found' },
    { status: 404 }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}