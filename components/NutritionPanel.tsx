'use client'

import { NutritionTotals, NUTRIENT_LABELS, NutrientKey } from '@/types'

interface Props {
  totals: NutritionTotals
  servings?: number
}

const ROWS: { key: NutrientKey; bold?: boolean }[] = [
  { key: 'energy_kcal', bold: true },
  { key: 'protein_g', bold: true },
  { key: 'total_fat_g', bold: true },
  { key: 'saturated_fat_g' },
  { key: 'trans_fat_g' },
  { key: 'cholesterol_mg' },
  { key: 'sodium_mg', bold: true },
  { key: 'total_carb_g', bold: true },
  { key: 'dietary_fiber_g' },
  { key: 'total_sugars_g' },
  { key: 'phosphorus_mg' },
  { key: 'potassium_mg' },
]

export default function NutritionPanel({ totals, servings = 1 }: Props) {
  const label = servings > 1 ? `(${servings} servings)` : '(per serving)'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
        Nutrition Facts <span className="text-zinc-500 font-normal normal-case">{label}</span>
      </h3>
      <div className="space-y-1">
        {ROWS.map(({ key, bold }) => (
          <div
            key={key}
            className={`flex justify-between text-sm py-1 border-b border-zinc-800 last:border-0 ${
              bold ? 'text-zinc-200 font-medium' : 'text-zinc-400'
            }`}
          >
            <span>{NUTRIENT_LABELS[key]}</span>
            <span className="tabular-nums">{totals[key].toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
