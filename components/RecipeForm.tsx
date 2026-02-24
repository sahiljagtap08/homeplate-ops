'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import IngredientSearch from './IngredientSearch'
import NutritionPanel from './NutritionPanel'
import { calculateNutrition } from '@/lib/nutrition'
import { RecipeIngredient } from '@/types'

interface LocalIngredient {
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

export default function RecipeForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [servings, setServings] = useState(1)
  const [ingredients, setIngredients] = useState<LocalIngredient[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAddIngredient(ing: LocalIngredient) {
    setIngredients((prev) => {
      const exists = prev.findIndex((i) => i.fdc_id === ing.fdc_id)
      if (exists >= 0) {
        const updated = [...prev]
        updated[exists] = ing
        return updated
      }
      return [...prev, ing]
    })
  }

  function removeIngredient(fdcId: number) {
    setIngredients((prev) => prev.filter((i) => i.fdc_id !== fdcId))
  }

  // Build fake RecipeIngredient objects for the nutrition calculator
  const fakeRIs: RecipeIngredient[] = ingredients.map((ing, idx) => ({
    id: String(idx),
    recipe_id: '',
    ingredient_id: String(idx),
    amount_g: ing.amount_g,
    ingredient: {
      id: String(idx),
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
      created_at: '',
    },
  }))

  const nutrition = ingredients.length > 0 ? calculateNutrition(fakeRIs) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Recipe name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, servings, ingredients }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to save')
      }
      const recipe = await res.json()
      router.push(`/recipes/${recipe.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Recipe Details</h2>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grilled Salmon Bowl"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Optional notes about this recipe..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-orange-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Servings (this recipe makes)</label>
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            min={1}
            className="w-24 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Ingredients</h2>
        <IngredientSearch onAdd={handleAddIngredient} />

        {ingredients.length > 0 && (
          <div className="space-y-1 mt-2">
            <div className="grid grid-cols-[1fr_80px_36px] gap-2 text-xs text-zinc-500 px-1 mb-1">
              <span>Ingredient</span>
              <span className="text-right">Amount</span>
              <span />
            </div>
            {ingredients.map((ing) => (
              <div key={ing.fdc_id} className="grid grid-cols-[1fr_80px_36px] gap-2 items-center bg-zinc-800/50 border border-zinc-700 rounded-md px-3 py-2">
                <span className="text-sm text-zinc-200 truncate">{ing.name}</span>
                <span className="text-sm text-zinc-400 text-right tabular-nums">{ing.amount_g}g</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(ing.fdc_id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors flex justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live nutrition preview */}
      {nutrition && (
        <NutritionPanel totals={nutrition} />
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium text-sm rounded-md transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Recipe
        </button>
      </div>
    </form>
  )
}
