import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_plans')
    .select(`
      *,
      weekly_plan_items (
        id,
        recipe_id,
        servings,
        recipe:recipes (
          id,
          name,
          recipe_ingredients (
            amount_g,
            ingredient:ingredients (name)
          )
        )
      )
    `)
    .order('week_start', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { week_start, items } = body

  if (!week_start) {
    return NextResponse.json({ error: 'week_start is required' }, { status: 400 })
  }

  const { data: plan, error: planErr } = await supabase
    .from('weekly_plans')
    .insert({ week_start })
    .select()
    .single()

  if (planErr) return NextResponse.json({ error: planErr.message }, { status: 500 })

  if (items && items.length > 0) {
    const rows = items.map((item: { recipe_id: string; servings: number }) => ({
      plan_id: plan.id,
      recipe_id: item.recipe_id,
      servings: item.servings,
    }))

    const { error: itemsErr } = await supabase.from('weekly_plan_items').insert(rows)
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })
  }

  return NextResponse.json(plan, { status: 201 })
}
