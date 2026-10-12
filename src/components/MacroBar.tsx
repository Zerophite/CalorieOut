import { type ReactNode } from 'react'
import { type Nutrition } from '../types'
import { formatNumber, macroSplit } from '../lib/nutrition'

export const MACROS = [
  { key: 'protein', label: 'Protein', color: 'var(--protein)', kcalPerGram: 4 },
  { key: 'carbs', label: 'Carbs', color: 'var(--carbs)', kcalPerGram: 4 },
  { key: 'fat', label: 'Fat', color: 'var(--fat)', kcalPerGram: 9 },
] as const

/** Protein / carbs / fat as a share of the calories, with a 2px gap between segments. */
export function MacroBar({ nutrition, thick }: { nutrition: Nutrition; thick?: boolean }) {
  const { proteinPct, carbsPct, fatPct } = macroSplit(nutrition)
  const h = thick ? 'h-3' : 'h-2'
  if (proteinPct + carbsPct + fatPct === 0) {
    return <div className={`${h} w-full rounded-full bg-surface-2`} />
  }
  const parts = [
    { pct: proteinPct, color: 'var(--protein)' },
    { pct: carbsPct, color: 'var(--carbs)' },
    { pct: fatPct, color: 'var(--fat)' },
  ].filter((p) => p.pct > 0)
  return (
    <div
      className={`flex ${h} w-full gap-[2px] overflow-hidden rounded-full`}
      role="img"
      aria-label={`Calories from protein ${proteinPct}%, carbs ${carbsPct}%, fat ${fatPct}%`}
    >
      {parts.map((p, i) => (
        <div
          key={i}
          className="h-full first:rounded-l-full last:rounded-r-full"
          style={{ flexGrow: p.pct, flexBasis: 0, background: p.color }}
          title={`${p.pct}% of calories`}
        />
      ))}
    </div>
  )
}

/** Compact labelled grams for item cards: a colour dot, the amount and the macro's name. */
export function MacroChips({ nutrition }: { nutrition: Nutrition }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {MACROS.map((m) => (
        <span
          key={m.key}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-xs"
        >
          <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
          <span className="font-semibold text-body">{formatNumber(nutrition[m.key])}g</span>
          <span className="text-muted">{m.label.toLowerCase()}</span>
        </span>
      ))}
    </div>
  )
}

/** A progress ring (0–100%) with content in the middle. */
export function Ring({
  pct,
  color,
  size = 56,
  stroke = 6,
  children,
  label,
}: {
  pct: number
  color: string
  size?: number
  stroke?: number
  children?: ReactNode
  label?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const shown = Math.max(0, Math.min(100, pct))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        {shown > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${(shown / 100) * c} ${c}`}
            style={{ transition: 'stroke-dasharray 300ms ease' }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

/** Three tiles — grams, share of calories and a ring per macro. */
export function MacroTiles({ nutrition }: { nutrition: Nutrition }) {
  const split = macroSplit(nutrition)
  const pct = { protein: split.proteinPct, carbs: split.carbsPct, fat: split.fatPct }
  return (
    <div className="grid grid-cols-3 gap-2">
      {MACROS.map((m) => (
        <div key={m.key} className="flex flex-col items-center rounded-xl bg-surface-2 px-2 py-3">
          <Ring pct={pct[m.key]} color={m.color} label={`${m.label}: ${pct[m.key]}% of calories`}>
            <span className="text-xs font-bold text-body">{pct[m.key]}%</span>
          </Ring>
          <div className="mt-2 text-lg font-bold leading-none text-body">
            {formatNumber(nutrition[m.key])}
            <span className="ml-0.5 text-xs font-medium text-muted">g</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
            {m.label}
          </div>
        </div>
      ))}
    </div>
  )
}

export function MacroLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {MACROS.map((i) => (
        <span key={i.key} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  )
}
