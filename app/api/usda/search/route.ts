import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.USDA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'USDA API key not configured' }, { status: 500 })
  }

  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${apiKey}`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`USDA API error: ${res.status}`)
    const data = await res.json()

    const results = (data.foods || []).map((f: {
      fdcId: number
      description: string
      dataType: string
      brandOwner?: string
      foodCategory?: string
    }) => ({
      fdcId: f.fdcId,
      description: f.description,
      dataType: f.dataType,
      brandOwner: f.brandOwner,
      foodCategory: f.foodCategory,
    }))

    return NextResponse.json({ results })
  } catch (err) {
    console.error('USDA search error:', err)
    return NextResponse.json({ error: 'Failed to search USDA database' }, { status: 500 })
  }
}
