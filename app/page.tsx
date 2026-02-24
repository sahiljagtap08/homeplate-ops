import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, CheckCircle, ShoppingCart, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count: recipeCount }, { count: conditionCount }, { count: planCount }] =
    await Promise.all([
      supabase.from('recipes').select('*', { count: 'exact', head: true }),
      supabase.from('dietary_conditions').select('*', { count: 'exact', head: true }),
      supabase.from('weekly_plans').select('*', { count: 'exact', head: true }),
    ])

  const { data: recentRecipes } = await supabase
    .from('recipes')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Recipes', value: recipeCount ?? 0, href: '/recipes', icon: BookOpen, color: 'text-orange-400' },
    { label: 'Dietary Conditions', value: conditionCount ?? 0, href: '/dietary-conditions', icon: CheckCircle, color: 'text-green-400' },
    { label: 'Weekly Plans', value: planCount ?? 0, href: '/weekly-plan', icon: ShoppingCart, color: 'text-blue-400' },
  ]

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Dashboard</h1>
        <p className="text-zinc-500 mt-1 text-sm">Your food ops at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, href, icon: Icon, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-5 h-5 ${color}`} />
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-zinc-100 tabular-nums">{value}</div>
            <div className="text-sm text-zinc-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Recent recipes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-300">Recent Recipes</h2>
          <Link href="/recipes/new" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
            + New recipe
          </Link>
        </div>
        {recentRecipes && recentRecipes.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            {recentRecipes.map((r) => (
              <Link
                key={r.id}
                href={`/recipes/${r.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-zinc-800/50 transition-colors"
              >
                <span className="text-sm text-zinc-200">{r.name}</span>
                <span className="text-xs text-zinc-500">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-zinc-500 text-sm">No recipes yet.</p>
            <Link href="/recipes/new" className="text-orange-400 hover:text-orange-300 text-sm mt-2 inline-block">
              Create your first recipe →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
