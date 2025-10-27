import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// GET - Fetch user's history
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ history: data || [] })
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Save new history entry
export async function POST(request) {
  try {
    const body = await request.json()
    const { user_id, action, technique, text_preview, success } = body

    if (!user_id || !action || !technique) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('history')
      .insert([
        {
          user_id,
          action,
          technique,
          text_preview: text_preview || '',
          success: success !== false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error saving history:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete specific item or clear user's history
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!itemId && !userId) {
      return NextResponse.json({ error: 'Item ID or User ID required' }, { status: 400 })
    }

    let query = supabase.from('history').delete()

    if (itemId) {
      // Delete specific item
      query = query.eq('id', itemId)
    } else if (userId) {
      // Clear all history for user
      query = query.eq('user_id', userId)
    }

    const { error } = await query

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting history:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

