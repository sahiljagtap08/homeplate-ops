import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import RecipeForm from '@/components/RecipeForm'

export default function NewRecipePage() {
  return (
    <div className="p-8 max-w-2xl">
      <Link href="/recipes" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Recipes
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100">New Recipe</h1>
        <p className="text-zinc-500 mt-1 text-sm">Enter ingredients at 1-serving scale. USDA data is pulled automatically.</p>
      </div>
      <RecipeForm />
    </div>
  )
}
