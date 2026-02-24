import { createClient } from '@/lib/supabase/server'
import DietaryConditionsClient from './DietaryConditionsClient'

export const dynamic = 'force-dynamic'

export default async function DietaryConditionsPage() {
  const supabase = await createClient()
  const { data: conditions } = await supabase
    .from('dietary_conditions')
    .select('*')
    .order('name')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Dietary Conditions</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Dietician-approved thresholds checked against every recipe.
        </p>
      </div>
      <DietaryConditionsClient initialConditions={conditions || []} />
    </div>
  )
}
