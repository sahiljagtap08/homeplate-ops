'use client'

import { NutritionTotals, DietaryCondition, ConditionResult, NutrientKey, NUTRIENT_LABELS } from '@/types'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  totals: NutritionTotals
  conditions: DietaryCondition[]
}

function evaluate(totals: NutritionTotals, condition: DietaryCondition): ConditionResult {
  const value = totals[condition.metric as NutrientKey] ?? 0
  const passes =
    condition.operator === '<' ? value < condition.threshold : value > condition.threshold
  return { condition, value, passes }
}

export default function DietaryChecker({ totals, conditions }: Props) {
  if (conditions.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <p className="text-zinc-500 text-sm">No dietary conditions configured.</p>
      </div>
    )
  }

  const results = conditions.map((c) => evaluate(totals, c))
  const passing = results.filter((r) => r.passes).length

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
          Dietary Conditions
        </h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          passing === results.length
            ? 'bg-green-500/15 text-green-400'
            : passing === 0
            ? 'bg-red-500/15 text-red-400'
            : 'bg-yellow-500/15 text-yellow-400'
        }`}>
          {passing}/{results.length} pass
        </span>
      </div>

      <div className="space-y-2">
        {results.map(({ condition, value, passes }) => (
          <div
            key={condition.id}
            className={`flex items-start gap-3 p-3 rounded-md border ${
              passes
                ? 'border-green-800/50 bg-green-500/5'
                : 'border-red-800/50 bg-red-500/5'
            }`}
          >
            {passes ? (
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-200">{condition.name}</span>
                <span className={`text-xs tabular-nums font-mono ${passes ? 'text-green-400' : 'text-red-400'}`}>
                  {value.toFixed(1)} {condition.operator} {condition.threshold}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {NUTRIENT_LABELS[condition.metric as NutrientKey]} is {value.toFixed(1)} —
                target: {condition.operator} {condition.threshold}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
