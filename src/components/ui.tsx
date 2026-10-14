import { useState, type ReactNode } from 'react'
import { type DietTag, type Nutrition } from '../types'
import { type Goal } from '../hooks/useGoal'
import { DARK_LOGOS, LOGOS } from '../data/logos'
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
      <strong>Estimated values.</strong> This spot doesn’t publish full
      nutrition info, so these numbers are modelled from typical recipes for
      each dish (using the calories it posts on its menu where it does) — a
      ballpark for guidance, not exact figures.
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

/**
 * Restaurant logo: the brand's own official mark (see data/logos.ts), shown
 * contained in a rounded tile. Falls back to the styled BrandTile when a
 * restaurant has no logo or it fails to load.
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
  const src = LOGOS[id]
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <BrandTile name={name} accent={accent} size={size} />
  const dark = DARK_LOGOS.has(id)
  return (
    <div
      className={`flex ${BOX[size]} shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-sm ring-1 ring-[var(--border)] ${dark ? 'bg-neutral-900' : 'bg-white'}`}
    >
      <img
        src={src}
        alt={`${name} logo`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-[84%] w-[84%] object-contain"
      />
    </div>
  )
}

/**
 * Ask the restaurant's image CDN for a copy sized for how the photo is shown,
 * so the large photo is sharp on high-density screens and thumbnails stay light.
 * Hosts without resizing are returned unchanged.
 */
export function photoUrl(src: string, width: number): string {
  let u: URL
  try {
    u = new URL(src)
  } catch {
    return src
  }
  const set = (k: string, v: string) => {
    u.searchParams.set(k, v)
    return u.toString()
  }
  const w = String(width)
  switch (u.host) {
    case 'cdn.sanity.io':
    case 'images.ctfassets.net':
      if (u.pathname.endsWith('.svg')) return src
      u.searchParams.set('q', '80')
      return set('w', w)
    case 'cloudassets.starbucks.com':
    case 's7d1.scene7.com':
    case 's7d9.scene7.com':
      return set('wid', w)
    case 'media.subway.com':
    case 'cdn.harveys.ca':
    case 'cdn.swisschalet.com':
      return set('imwidth', String(Math.min(width, 1024)))
    case 'framerusercontent.com':
      return set('scale-down-to', String(width <= 512 ? 512 : 1024))
    case 'dairyqueen-prod.dotcdn.io':
      return src.replace(/\/\d+w\/\d+q$/, `/${w}w/80q`)
    case 'img.pagecloud.com':
      return src.replace(/\/\d+x0\//, `/${w}x0/`)
    default:
      return src
  }
}

/** A product photo from the restaurant's menu; hides itself if it can't load. */
export function ItemPhoto({ src, alt, variant }: { src?: string; alt: string; variant: 'thumb' | 'hero' }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return null
  const cls =
    variant === 'thumb'
      ? 'h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20'
      : 'mx-auto h-48 w-full max-w-sm rounded-2xl sm:h-60'
  return (
    <div className={cls + ' overflow-hidden bg-white ring-1 ring-[var(--border)]'}>
      <img
        src={photoUrl(src, variant === 'thumb' ? 300 : 1000)}
        alt={alt}
        loading={variant === 'thumb' ? 'lazy' : 'eager'}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-full w-full object-contain p-1"
      />
    </div>
  )
}

/** − n + control for how many portions of an ingredient or option to include. */
export function QuantityStepper({
  value,
  max,
  label,
  onChange,
}: {
  value: number
  max: number
  label: string
  onChange: (next: number) => void
}) {
  const btn =
    'flex h-8 w-8 items-center justify-center rounded-lg border border-app bg-surface text-lg font-semibold leading-none text-body transition-colors hover:bg-surface-2 disabled:opacity-30'
  return (
    <span className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <button type="button" className={btn} aria-label={`Less ${label}`} disabled={value <= 0} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className="w-5 text-center text-sm font-bold tabular-nums text-body" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </span>
  )
}
