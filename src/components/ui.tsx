import { useState, type ReactNode } from 'react'
import { type DietTag, type Nutrition } from '../types'
import { type Goal } from '../hooks/useGoal'
import { LOGO_DOMAINS } from '../data/logos'
import { IconDumbbell, IconFlame, IconLeaf } from './icons'

const TAG_META: Record<DietTag, { label: string; icon?: ReactNode }> = {
  vegetarian: { label: 'Vegetarian', icon: <IconLeaf size={12} /> },
  vegan: { label: 'Vegan', icon: <IconLeaf size={12} /> },
  'high-protein': { label: 'High protein', icon: <IconDumbbell size={12} /> },
  'low-carb': { label: 'Low carb' },
  'gluten-free-option': { label: 'GF option' },
  spicy: { label: 'Spicy', icon: <IconFlame size={12} /> },
}

export function TagChip({ tag }: { tag: DietTag }) {
  const meta = TAG_META[tag]
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
      {meta.icon}
      {meta.label}
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

/** Placeholder while a code-split menu is being fetched. */
export function MenuLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center text-muted">Loading menu…</div>
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

const BOX = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}
/** Box edge length in CSS px for each size (matches the Tailwind classes). */
const BOX_PX = { sm: 36, md: 48, lg: 64 }

/**
 * Pick a display size for an icon of natural width `nat` inside a `box`.
 * Small icons are scaled by a whole-number factor with crisp (pixelated)
 * rendering, so a 16px favicon becomes a sharp 48px icon instead of a smeared
 * one. Icons at least as large as the box are only ever shrunk, which stays
 * sharp with normal smoothing.
 */
function iconFit(nat: number, box: number): { px: number; crisp: boolean } {
  const inner = box - 8 // keep a little breathing room inside the tile
  if (nat >= inner) return { px: inner, crisp: false }
  const k = Math.max(1, Math.min(3, Math.floor(inner / nat)))
  return { px: nat * k, crisp: k > 1 }
}

/**
 * Restaurant logo. Loads the real brand logo from a logo service by domain,
 * stepping through fallbacks, and lands on the styled BrandTile if none load.
 * No logo files are bundled in the repo.
 */
export function BrandLogo({
  id,
  name,
  accent,
  size = 'md',
}: {
  id: string
  name: string
  accent: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const domain = LOGO_DOMAINS[id]
  // Google's favicon services, keyed on the brand's real domain, so the icon
  // is always that brand's own mark. Higher-res endpoint first for crispness.
  const sources = domain
    ? [
        `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
          `https://${domain}`,
        )}&size=256`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
      ]
    : []
  const [idx, setIdx] = useState(0)
  const [nat, setNat] = useState<number | null>(null)

  if (idx >= sources.length) {
    return <BrandTile name={name} accent={accent} size={size} />
  }

  const fit = nat ? iconFit(nat, BOX_PX[size]) : null

  return (
    <div
      className={`flex ${BOX[size]} shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[var(--border)]`}
    >
      <img
        src={sources[idx]}
        alt={`${name} logo`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={(e) => setNat(e.currentTarget.naturalWidth || null)}
        onError={() => {
          setNat(null)
          setIdx((i) => i + 1)
        }}
        style={{
          width: fit ? fit.px : '75%',
          height: fit ? fit.px : '75%',
          objectFit: 'contain',
          imageRendering: fit?.crisp ? 'pixelated' : 'auto',
          // Hide until measured so a tiny icon never flashes stretched.
          visibility: fit ? 'visible' : 'hidden',
        }}
      />
    </div>
  )
}
