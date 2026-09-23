import { type Nutrition } from '../types'
import { macroSplit } from '../lib/nutrition'

/** A slim stacked bar visualising the protein / carbs / fat calorie split. */
export function MacroBar({ nutrition }: { nutrition: Nutrition }) {
  const { proteinPct, carbsPct, fatPct } = macroSplit(nutrition)
  if (proteinPct + carbsPct + fatPct === 0) {
    return <div className="h-2 w-full rounded-full bg-surface-2" />
  }
  return (
    <div
      className="flex h-2 w-full overflow-hidden rounded-full bg-surface-2"
      role="img"
      aria-label={`Protein ${proteinPct}%, carbs ${carbsPct}%, fat ${fatPct}%`}
    >
      <div style={{ width: `${proteinPct}%`, background: 'var(--protein)' }} />
      <div style={{ width: `${carbsPct}%`, background: 'var(--carbs)' }} />
      <div style={{ width: `${fatPct}%`, background: 'var(--fat)' }} />
    </div>
  )
}

export function MacroLegend() {
  const items = [
    { label: 'Protein', color: 'var(--protein)' },
    { label: 'Carbs', color: 'var(--carbs)' },
    { label: 'Fat', color: 'var(--fat)' },
  ]
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: i.color }}
          />
          {i.label}
        </span>
      ))}
    </div>
  )
}
