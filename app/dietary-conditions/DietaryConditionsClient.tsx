'use client'

import { useState } from 'react'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import { DietaryCondition, NUTRIENT_LABELS, NutrientKey } from '@/types'

const NUTRIENT_OPTIONS: NutrientKey[] = [
  'energy_kcal', 'protein_g', 'total_fat_g', 'saturated_fat_g',
  'trans_fat_g', 'cholesterol_mg', 'sodium_mg', 'total_carb_g',
  'dietary_fiber_g', 'total_sugars_g', 'phosphorus_mg', 'potassium_mg',
]

interface Props {
  initialConditions: DietaryCondition[]
}

export default function DietaryConditionsClient({ initialConditions }: Props) {
  const [conditions, setConditions] = useState<DietaryCondition[]>(initialConditions)
  const [form, setForm] = useState({
    name: '',
    metric: 'sodium_mg' as NutrientKey,
    operator: '<' as '<' | '>',
    threshold: '',
    description: '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.threshold) { setError('Name and threshold are required'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/dietary-conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, threshold: Number(form.threshold) }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const newCondition = await res.json()
      setConditions((prev) => [...prev, newCondition].sort((a, b) => a.name.localeCompare(b.name)))
      setForm({ name: '', metric: 'sodium_mg', operator: '<', threshold: '', description: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this condition?')) return
    setDeleting(id)
    await fetch(`/api/dietary-conditions/${id}`, { method: 'DELETE' })
    setConditions((prev) => prev.filter((c) => c.id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Add Condition</h2>

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-md">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Condition Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Low Sodium"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Nutrient</label>
            <select
              value={form.metric}
              onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value as NutrientKey }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500"
            >
              {NUTRIENT_OPTIONS.map((k) => (
                <option key={k} value={k}>{NUTRIENT_LABELS[k]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Operator</label>
            <select
              value={form.operator}
              onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value as '<' | '>' }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500"
            >
              <option value="<">Less than (&lt;)</option>
              <option value=">">Greater than (&gt;)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Threshold</label>
            <input
              type="number"
              value={form.threshold}
              onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
              placeholder="e.g. 600"
              step="0.1"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Description (optional)</label>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief explanation"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-md transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Condition
          </button>
        </div>
      </form>

      {/* Conditions list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="px-5 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-300">{conditions.length} condition{conditions.length !== 1 ? 's' : ''}</h2>
        </div>
        {conditions.length === 0 ? (
          <div className="px-5 py-8 text-center text-zinc-500 text-sm">No conditions yet.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {conditions.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm font-medium text-zinc-200">{c.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5 font-mono">
                    {NUTRIENT_LABELS[c.metric as NutrientKey]} {c.operator} {c.threshold}
                  </div>
                  {c.description && (
                    <div className="text-xs text-zinc-600 mt-0.5">{c.description}</div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deleting === c.id}
                  className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                >
                  {deleting === c.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
