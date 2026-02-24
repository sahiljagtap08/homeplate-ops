import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { calculateNutrition } from '@/lib/nutrition'
import NutritionPanel from '@/components/NutritionPanel'
import DietaryChecker from '@/components/DietaryChecker'
import { RecipeIngredient } from '@/types'
import DeleteRecipeButton from './DeleteRecipeButton'

export const dynamic = 'force-dynamic'

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: recipe }, { data: conditions }] = await Promise.all([
    supabase
      .from('recipes')
      .select(`*, recipe_ingredients (id, amount_g, ingredient:ingredients (*))`)
      .eq('id', id)
      .single(),
    supabase.from('dietary_conditions').select('*').order('name'),
  ])

  if (!recipe) notFound()

  const ris = (recipe.recipe_ingredients || []) as RecipeIngredient[]
  const nutrition = ris.length > 0 ? calculateNutrition(ris) : null

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/recipes" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Recipes
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">{recipe.name}</h1>
          {recipe.description && (
            <p className="text-zinc-500 mt-1 text-sm">{recipe.description}</p>
          )}
          <p className="text-xs text-zinc-600 mt-1">{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <DeleteRecipeButton id={recipe.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
              Ingredients
            </h2>
            {ris.length === 0 ? (
              <p className="text-zinc-500 text-sm">No ingredients added yet.</p>
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr_80px] gap-2 text-xs text-zinc-500 px-1 mb-2">
                  <span>Ingredient</span>
                  <span className="text-right">Amount</span>
                </div>
                {ris.map((ri) => (
                  <div key={ri.id} className="grid grid-cols-[1fr_80px] gap-2 items-center bg-zinc-800/50 border border-zinc-700 rounded-md px-3 py-2">
                    <span className="text-sm text-zinc-200">{ri.ingredient.name}</span>
                    <span className="text-sm text-zinc-400 text-right tabular-nums">{ri.amount_g}g</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dietary condition check */}
          {nutrition && conditions && (
            <DietaryChecker totals={nutrition} conditions={conditions} />
          )}
        </div>

        {/* Nutrition */}
        {nutrition ? (
          <NutritionPanel totals={nutrition} />
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <p className="text-zinc-500 text-sm">Add ingredients to see nutrition facts.</p>
          </div>
        )}
      </div>
    </div>
  )
}
