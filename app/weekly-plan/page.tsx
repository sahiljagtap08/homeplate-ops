import { createClient } from '@/lib/supabase/server'
import WeeklyPlanClient from './WeeklyPlanClient'

export const dynamic = 'force-dynamic'

export default async function WeeklyPlanPage() {
  const supabase = await createClient()

  const [{ data: recipes }, { data: plans }] = await Promise.all([
    supabase.from('recipes').select('id, name, servings, recipe_ingredients (amount_g, ingredient:ingredients (name))').order('name'),
    supabase
      .from('weekly_plans')
      .select(`
        id, week_start, created_at,
        weekly_plan_items (
          id, servings,
          recipe:recipes (
            id, name,
            recipe_ingredients (
              amount_g,
              ingredient:ingredients (name)
            )
          )
        )
      `)
      .order('week_start', { ascending: false })
      .limit(5),
  ])

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Weekly Plan</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Scale recipes by servings to generate your shopping list.
        </p>
      </div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <WeeklyPlanClient recipes={(recipes || []) as any} pastPlans={(plans || []) as any} />
    </div>
  )
}
