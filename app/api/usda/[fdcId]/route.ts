import { NextRequest, NextResponse } from 'next/server'

// USDA nutrient IDs we care about
const NUTRIENT_MAP: Record<number, string> = {
  1008: 'energy_kcal',
  1003: 'protein_g',
  1004: 'total_fat_g',
  1258: 'saturated_fat_g',
  1257: 'trans_fat_g',
  1253: 'cholesterol_mg',
  1093: 'sodium_mg',
  1005: 'total_carb_g',
  1079: 'dietary_fiber_g',
  2000: 'total_sugars_g',
  1091: 'phosphorus_mg',
  1092: 'potassium_mg',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fdcId: string }> }
) {
  const { fdcId } = await params
  const apiKey = process.env.USDA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'USDA API key not configured' }, { status: 500 })
  }

  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`USDA API error: ${res.status}`)
    const data = await res.json()

    // Build normalized per-100g nutrient object
    const nutrients: Record<string, number | null> = {}
    for (const key of Object.values(NUTRIENT_MAP)) {
      nutrients[key] = null
    }

    for (const fn of data.foodNutrients || []) {
      const nutrientId = fn.nutrient?.id ?? fn.nutrientId
      const mappedKey = NUTRIENT_MAP[nutrientId]
      if (mappedKey) {
        nutrients[mappedKey] = fn.amount ?? fn.value ?? null
      }
    }

    return NextResponse.json({
      fdcId: data.fdcId,
      description: data.description,
      dataType: data.dataType,
      nutrients,
    })
  } catch (err) {
    console.error('USDA detail error:', err)
    return NextResponse.json({ error: 'Failed to fetch USDA food details' }, { status: 500 })
  }
}
