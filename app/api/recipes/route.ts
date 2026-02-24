import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { name, description, servings, ingredients } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Recipe name is required' }, { status: 400 })
  }

  // Create recipe
  const { data: recipe, error: recipeErr } = await supabase
    .from('recipes')
    .insert({ name: name.trim(), description: description?.trim() || null, servings: servings || 1 })
    .select()
    .single()

  if (recipeErr) return NextResponse.json({ error: recipeErr.message }, { status: 500 })

  // Upsert ingredients and link to recipe
  if (ingredients && ingredients.length > 0) {
    for (const ing of ingredients) {
      // Upsert ingredient (cache USDA data)
      const { data: ingRow, error: ingErr } = await supabase
        .from('ingredients')
        .upsert({
          fdc_id: ing.fdc_id,
          name: ing.name,
          data_type: ing.data_type,
          energy_kcal: ing.energy_kcal,
          protein_g: ing.protein_g,
          total_fat_g: ing.total_fat_g,
          saturated_fat_g: ing.saturated_fat_g,
          trans_fat_g: ing.trans_fat_g,
          cholesterol_mg: ing.cholesterol_mg,
          sodium_mg: ing.sodium_mg,
          total_carb_g: ing.total_carb_g,
          dietary_fiber_g: ing.dietary_fiber_g,
          total_sugars_g: ing.total_sugars_g,
          phosphorus_mg: ing.phosphorus_mg,
          potassium_mg: ing.potassium_mg,
        }, { onConflict: 'fdc_id' })
        .select()
        .single()

      if (ingErr) return NextResponse.json({ error: ingErr.message }, { status: 500 })

      // Link ingredient to recipe
      const { error: riErr } = await supabase
        .from('recipe_ingredients')
        .insert({
          recipe_id: recipe.id,
          ingredient_id: ingRow.id,
          amount_g: ing.amount_g,
        })

      if (riErr) return NextResponse.json({ error: riErr.message }, { status: 500 })
    }
  }

  return NextResponse.json(recipe, { status: 201 })
}
