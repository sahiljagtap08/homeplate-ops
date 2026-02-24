'use client'

import { useState } from 'react'
import { Plus, Trash2, ShoppingCart, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { ShoppingItem } from '@/types'

interface RecipeOption {
  id: string
  name: string
  servings: number
  recipe_ingredients: { amount_g: number; ingredient: { name: string } }[]
}

interface PlanItem {
  id: string
  servings: number
  recipe: {
    id: string
    name: string
    recipe_ingredients: { amount_g: number; ingredient: { name: string } }[]
  }
}

interface Plan {
  id: string
  week_start: string
  created_at: string
  weekly_plan_items: PlanItem[]
}

interface Props {
  recipes: RecipeOption[]
  pastPlans: Plan[]
}

interface LineItem {
  recipe_id: string
  servings: number
}

function buildShoppingList(items: LineItem[], recipes: RecipeOption[]): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>()

  for (const item of items) {
    const recipe = recipes.find((r) => r.id === item.recipe_id)
    if (!recipe) continue

    for (const ri of recipe.recipe_ingredients) {
      const ingName = ri.ingredient.name
      const totalG = ri.amount_g * item.servings

      if (!map.has(ingName)) {
        map.set(ingName, {
          ingredientName: ingName,
          totalGrams: 0,
          recipes: [],
        })
      }
      const entry = map.get(ingName)!
      entry.totalGrams = Math.round((entry.totalGrams + totalG) * 100) / 100
      entry.recipes.push({
        recipeName: recipe.name,
        servings: item.servings,
        amountG: ri.amount_g * item.servings,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => a.ingredientName.localeCompare(b.ingredientName))
}

export default function WeeklyPlanClient({ recipes, pastPlans }: Props) {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d.toISOString().split('T')[0]
  })
  const [lineItems, setLineItems] = useState<LineItem[]>([{ recipe_id: '', servings: 1 }])
  const [saving, setSaving] = useState(false)
  const [savedPlan, setSavedPlan] = useState<Plan | null>(null)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

  function addLine() {
    setLineItems((prev) => [...prev, { recipe_id: '', servings: 1 }])
  }

  function removeLine(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateLine(idx: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) => prev.map((li, i) => i === idx ? { ...li, [field]: value } : li))
  }

  const validItems = lineItems.filter((li) => li.recipe_id && li.servings > 0)
  const shoppingList = validItems.length > 0 ? buildShoppingList(validItems, recipes) : []

  async function handleSave() {
    if (validItems.length === 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week_start: weekStart, items: validItems }),
      })
      if (res.ok) {
        setSavedPlan({ id: '', week_start: weekStart, created_at: new Date().toISOString(), weekly_plan_items: [] })
        alert('Plan saved!')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Plan builder */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Build This Week&apos;s Plan</h2>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Week Starting</label>
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500"
          />
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_80px_36px] gap-2 text-xs text-zinc-500 px-1">
            <span>Recipe</span>
            <span>Servings</span>
            <span />
          </div>
          {lineItems.map((li, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_80px_36px] gap-2 items-center">
              <select
                value={li.recipe_id}
                onChange={(e) => updateLine(idx, 'recipe_id', e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500"
              >
                <option value="">Select recipe...</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={li.servings}
                onChange={(e) => updateLine(idx, 'servings', Number(e.target.value))}
                className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500"
              />
              <button
                onClick={() => removeLine(idx)}
                className="text-zinc-600 hover:text-red-400 flex justify-center transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={addLine}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mt-1"
          >
            <Plus className="w-4 h-4" />
            Add recipe
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || validItems.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-md transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Plan
          </button>
        </div>
      </div>

      {/* Live shopping list */}
      {shoppingList.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Shopping List</h2>
            <span className="text-xs text-zinc-500 ml-auto">{shoppingList.length} items</span>
          </div>
          <div className="space-y-1">
            {shoppingList.map((item) => (
              <div key={item.ingredientName} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <span className="text-sm text-zinc-200">{item.ingredientName}</span>
                <span className="text-sm font-mono font-medium text-orange-400 tabular-nums">
                  {item.totalGrams >= 1000
                    ? `${(item.totalGrams / 1000).toFixed(2)} kg`
                    : `${item.totalGrams.toFixed(0)} g`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past plans */}
      {pastPlans.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-5 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-300">Past Plans</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {pastPlans.map((plan) => {
              const isExpanded = expandedPlan === plan.id
              const allItems = plan.weekly_plan_items || []
              const shopping = allItems.length > 0
                ? buildShoppingList(
                    allItems.map((i) => ({ recipe_id: i.recipe?.id || '', servings: i.servings })),
                    recipes
                  )
                : []

              return (
                <div key={plan.id}>
                  <button
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="text-sm text-zinc-200">
                      Week of {new Date(plan.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <span className="text-xs">{allItems.length} recipe{allItems.length !== 1 ? 's' : ''}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-4 space-y-3">
                      <div className="text-xs text-zinc-500 space-y-1">
                        {allItems.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.recipe?.name}</span>
                            <span>{item.servings} serving{item.servings !== 1 ? 's' : ''}</span>
                          </div>
                        ))}
                      </div>
                      {shopping.length > 0 && (
                        <div className="border-t border-zinc-800 pt-3 space-y-1">
                          <div className="text-xs text-zinc-500 mb-2">Shopping list:</div>
                          {shopping.map((s) => (
                            <div key={s.ingredientName} className="flex justify-between text-xs">
                              <span className="text-zinc-300">{s.ingredientName}</span>
                              <span className="text-zinc-400 font-mono">
                                {s.totalGrams >= 1000
                                  ? `${(s.totalGrams / 1000).toFixed(2)} kg`
                                  : `${s.totalGrams.toFixed(0)} g`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
