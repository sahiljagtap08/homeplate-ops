import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dietary_conditions')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { name, metric, operator, threshold, description } = body

  if (!name || !metric || !operator || threshold == null) {
    return NextResponse.json({ error: 'name, metric, operator, threshold are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('dietary_conditions')
    .insert({ name, metric, operator, threshold: Number(threshold), description: description || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
