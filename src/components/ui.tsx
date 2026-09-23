import { type ReactNode } from 'react'
import { type DietTag, type Nutrition } from '../types'
import { type Goal } from '../hooks/useGoal'

const TAG_LABELS: Record<DietTag, string> = {
  vegetarian: '🥗 Vegetarian',
  vegan: '🌱 Vegan',
  'high-protein': '💪 High protein',
  'low-carb': '🥑 Low carb',
  'gluten-free-option': '🌾 GF option',
  spicy: '🌶️ Spicy',
}

export function TagChip({ tag }: { tag: DietTag }) {
  return (
    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
      {TAG_LABELS[tag]}
    </span>
  )
}

export function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ' +
        (active
          ? 'border-transparent bg-[var(--brand)] text-white'
          : 'border-app bg-surface text-body hover:bg-surface-2')
      }
    >
      {children}
    </button>
  )
}

export type GoalFit = 'fits' | 'over-calories' | 'low-protein' | 'off'

export function evaluateGoal(nutrition: Nutrition, goal: Goal): GoalFit {
  if (!goal.enabled) return 'off'
  if (goal.maxCalories !== null && nutrition.calories > goal.maxCalories)
    return 'over-calories'
  if (goal.minProtein !== null && nutrition.protein < goal.minProtein)
    return 'low-protein'
  return 'fits'
}

export function GoalFitBadge({ fit }: { fit: GoalFit }) {
  if (fit === 'off') return null
  const config: Record<Exclude<GoalFit, 'off'>, { label: string; cls: string }> =
    {
      fits: {
        label: '✓ Fits your goal',
        cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      },
      'over-calories': {
        label: 'Over calorie goal',
        cls: 'bg-red-500/15 text-red-600 dark:text-red-400',
      },
      'low-protein': {
        label: 'Below protein goal',
        cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      },
    }
  const c = config[fit]
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${c.cls}`}
    >
      {c.label}
    </span>
  )
}

/** Small inline marker for restaurants whose figures are estimates. */
export function EstimateBadge() {
  return (
    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
      ~ Estimate
    </span>
  )
}

/** Full-width notice shown atop estimated restaurants' pages. */
export function EstimateBanner() {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
      <strong>Estimated values.</strong> This spot doesn’t publish nutrition
      info, so these numbers are modelled from typical recipes for each dish —
      a ballpark for guidance, not exact figures.
    </div>
  )
}

/** A rounded accent tile used as a stand-in logo for each restaurant. */
export function BrandTile({
  name,
  accent,
  size = 'md',
}: {
  name: string
  accent: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const initials = name
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  const sizes = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-2xl',
  }
  return (
    <div
      className={`flex ${sizes[size]} shrink-0 items-center justify-center rounded-2xl font-black text-white shadow-sm`}
      style={{ background: accent }}
    >
      {initials}
    </div>
  )
}
