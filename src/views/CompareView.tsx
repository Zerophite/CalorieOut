import { type CompareEntry } from '../app-types'
import { type Nutrition } from '../types'
import { formatNumber, macroSplit } from '../lib/nutrition'
import { MacroBar } from '../components/MacroBar'

interface Props {
  entries: CompareEntry[]
  onRemove: (key: string) => void
  onClear: () => void
  onBrowse: () => void
}

type MetricKey = keyof Pick<
  Nutrition,
  'calories' | 'protein' | 'carbs' | 'fat' | 'sodium'
>

const METRICS: { key: MetricKey; label: string; unit: string; lowerBetter: boolean }[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', lowerBetter: true },
  { key: 'protein', label: 'Protein', unit: 'g', lowerBetter: false },
  { key: 'carbs', label: 'Carbs', unit: 'g', lowerBetter: true },
  { key: 'fat', label: 'Fat', unit: 'g', lowerBetter: true },
  { key: 'sodium', label: 'Sodium', unit: 'mg', lowerBetter: true },
]

export function CompareView({ entries, onRemove, onClear, onBrowse }: Props) {
  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-2xl font-black text-body">Compare</h1>
        <p className="mt-2 text-muted">
          Nothing pinned yet. Add items with “+ Compare” to line them up
          side by side.
        </p>
        <button
          onClick={onBrowse}
          className="mt-4 rounded-xl bg-[var(--brand)] px-4 py-2 font-semibold text-white"
        >
          Browse restaurants
        </button>
      </div>
    )
  }

  // Best value per metric (for highlighting the winner in each row).
  const best: Record<string, number> = {}
  for (const m of METRICS) {
    const values = entries.map((e) => e.nutrition[m.key] ?? 0)
    best[m.key] = m.lowerBetter ? Math.min(...values) : Math.max(...values)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-body">
          Compare ({entries.length})
        </h1>
        <button
          onClick={onClear}
          className="rounded-lg border border-app bg-surface px-3 py-1.5 text-sm font-semibold text-muted hover:bg-surface-2"
        >
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-24 p-2 text-left align-bottom" />
              {entries.map((e) => (
                <th key={e.key} className="min-w-[150px] p-2 align-bottom">
                  <div className="rounded-xl border border-app bg-surface p-3 text-left">
                    <div className="text-xs font-medium text-muted">
                      {e.restaurantName}
                    </div>
                    <div className="font-bold text-body">{e.itemName}</div>
                    {e.detail && (
                      <div className="mt-0.5 line-clamp-2 text-xs text-muted">
                        {e.detail}
                      </div>
                    )}
                    <div className="mt-2">
                      <MacroBar nutrition={e.nutrition} />
                    </div>
                    <button
                      onClick={() => onRemove(e.key)}
                      className="mt-2 text-xs font-semibold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => (
              <tr key={m.key} className="border-t border-app">
                <td className="p-2 font-semibold text-muted">{m.label}</td>
                {entries.map((e) => {
                  const value = e.nutrition[m.key] ?? 0
                  const isBest =
                    entries.length > 1 && value === best[m.key]
                  return (
                    <td key={e.key} className="p-2 text-center">
                      <span
                        className={
                          'inline-block rounded-lg px-2 py-1 font-semibold ' +
                          (isBest
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'text-body')
                        }
                      >
                        {formatNumber(value)}
                        <span className="ml-0.5 text-xs font-normal text-muted">
                          {m.unit}
                        </span>
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr className="border-t border-app">
              <td className="p-2 font-semibold text-muted">Macro split</td>
              {entries.map((e) => {
                const s = macroSplit(e.nutrition)
                return (
                  <td key={e.key} className="p-2 text-center text-xs text-muted">
                    {s.proteinPct}/{s.carbsPct}/{s.fatPct}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted">
        Green = best in that row (most protein, fewest calories/carbs/fat/sodium).
        Macro split shows protein/carbs/fat as % of calories.
      </p>
    </div>
  )
}
