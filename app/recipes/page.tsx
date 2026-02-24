import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, name, description, servings, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Recipes</h1>
          <p className="text-zinc-500 mt-1 text-sm">All approved recipes at 1-serving scale</p>
        </div>
        <Link
          href="/recipes/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Recipe
        </Link>
      </div>

      {recipes && recipes.length > 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
          {recipes.map((r) => (
            <Link
              key={r.id}
              href={`/recipes/${r.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors group"
            >
              <div>
                <div className="text-sm font-medium text-zinc-200">{r.name}</div>
                {r.description && (
                  <div className="text-xs text-zinc-500 mt-0.5 truncate max-w-md">{r.description}</div>
                )}
                <div className="text-xs text-zinc-600 mt-1">{r.servings} serving{r.servings !== 1 ? 's' : ''}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-5 py-12 text-center">
          <p className="text-zinc-500 text-sm mb-3">No recipes yet. Add your first approved recipe.</p>
          <Link href="/recipes/new" className="text-orange-400 hover:text-orange-300 text-sm">
            Create recipe →
          </Link>
        </div>
      )}
    </div>
  )
}
