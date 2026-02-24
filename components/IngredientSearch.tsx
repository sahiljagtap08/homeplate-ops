'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, Plus } from 'lucide-react'
import { UsdaSearchResult } from '@/types'

interface AddedIngredient {
  fdc_id: number
  name: string
  data_type: string
  amount_g: number
  energy_kcal: number | null
  protein_g: number | null
  total_fat_g: number | null
  saturated_fat_g: number | null
  trans_fat_g: number | null
  cholesterol_mg: number | null
  sodium_mg: number | null
  total_carb_g: number | null
  dietary_fiber_g: number | null
  total_sugars_g: number | null
  phosphorus_mg: number | null
  potassium_mg: number | null
}

interface Props {
  onAdd: (ingredient: AddedIngredient) => void
}

export default function IngredientSearch({ onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UsdaSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<UsdaSearchResult | null>(null)
  const [amountG, setAmountG] = useState('')
  const [fetchingNutrients, setFetchingNutrients] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/usda/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
        setShowDropdown(true)
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [query])

  async function handleSelect(item: UsdaSearchResult) {
    setSelected(item)
    setQuery(item.description)
    setShowDropdown(false)
    setResults([])
  }

  async function handleAdd() {
    if (!selected || !amountG || Number(amountG) <= 0) return
    setFetchingNutrients(true)
    try {
      const res = await fetch(`/api/usda/${selected.fdcId}`)
      const data = await res.json()
      onAdd({
        fdc_id: selected.fdcId,
        name: selected.description,
        data_type: selected.dataType,
        amount_g: Number(amountG),
        ...data.nutrients,
      })
      setSelected(null)
      setQuery('')
      setAmountG('')
    } finally {
      setFetchingNutrients(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2">
          {loading ? (
            <Loader2 className="w-4 h-4 text-zinc-400 animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          )}
          <input
            type="text"
            placeholder="Search USDA database (e.g. chicken breast, brown rice...)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none"
          />
        </div>

        {showDropdown && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl z-50 max-h-64 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.fdcId}
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-700 border-b border-zinc-700 last:border-0 transition-colors"
              >
                <div className="text-sm text-zinc-200 leading-snug">{r.description}</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {r.dataType}{r.brandOwner ? ` · ${r.brandOwner}` : ''}
                  {r.foodCategory ? ` · ${r.foodCategory}` : ''}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="flex gap-2 items-center">
          <div className="flex-1 text-sm text-zinc-300 bg-zinc-800/50 border border-zinc-700 rounded-md px-3 py-2 truncate">
            {selected.description}
          </div>
          <div className="relative">
            <input
              type="number"
              placeholder="grams"
              value={amountG}
              onChange={(e) => setAmountG(e.target.value)}
              className="w-24 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500"
              min="0.1"
              step="0.1"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500">g</span>
          </div>
          <button
            onClick={handleAdd}
            disabled={!amountG || Number(amountG) <= 0 || fetchingNutrients}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-md transition-colors"
          >
            {fetchingNutrients ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </div>
      )}
    </div>
  )
}
