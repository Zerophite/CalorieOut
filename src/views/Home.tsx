import { useState, type ReactNode } from 'react'
import { restaurants, SEGMENTS } from '../data'
import { type Restaurant } from '../types'
import { formatNumber } from '../lib/nutrition'
import { BrandLogo, Chip, EstimateBadge } from '../components/ui'
import {
  IconBowl,
  IconBurger,
  IconChevron,
  IconCoffee,
  IconFlame,
  IconSearch,
  IconSliders,
  IconUtensils,
} from '../components/icons'

interface Props {
  onOpenRestaurant: (id: string) => void
  onOpenSearch: () => void
  onOpenDay: () => void
  dayCalories: number
  dayGoal: number | null
}

const SEGMENT_ICON: Record<string, ReactNode> = {
  'Fast Food': <IconBurger size={15} />,
  'Coffee & Bakery': <IconCoffee size={15} />,
  'Build-Your-Own': <IconBowl size={15} />,
  'Sit-Down': <IconUtensils size={15} />,
}

export function RestaurantCard({
  restaurant,
  onOpen,
}: {
  restaurant: Restaurant
  onOpen: () => void
}) {
  const builderCount =
    restaurant.hasBuilder !== undefined
      ? Number(restaurant.hasBuilder)
      : restaurant.items.filter((i) => i.kind === 'builder').length
  const itemCount = restaurant.itemCount ?? restaurant.items.length
  return (
    <button
      onClick={onOpen}
      className="group flex items-center gap-4 rounded-2xl border border-app bg-surface p-4 text-left transition-shadow hover:shadow-md"
    >
      <BrandLogo
        id={restaurant.id}
        name={restaurant.name}
        accent={restaurant.accent}
        size="lg"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-body">{restaurant.name}</h3>
          {restaurant.dataSource === 'estimated' && <EstimateBadge />}
        </div>
        <p className="truncate text-sm text-muted">{restaurant.cuisine}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          {itemCount} items
          {builderCount > 0 && (
            <>
              {' · '}
              <IconSliders size={11} /> build your own
            </>
          )}
        </p>
      </div>
      <IconChevron
        size={18}
        className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
      />
    </button>
  )
}

export function Home({
  onOpenRestaurant,
  onOpenSearch,
  onOpenDay,
  dayCalories,
  dayGoal,
}: Props) {
  const [segment, setSegment] = useState<string | null>(null)
  const shown = segment
    ? restaurants.filter((r) => r.segment === segment)
    : restaurants

  const remaining = dayGoal !== null ? dayGoal - dayCalories : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Hero */}
      <header className="mb-5">
        <h1 className="text-3xl font-black tracking-tight text-body sm:text-4xl">
          Eat out smarter across Canada
        </h1>
        <p className="mt-1 max-w-2xl text-muted">
          Calories and macros for Canadian restaurants — browse menus, build and
          customize meals, and track your day as you go.
        </p>
      </header>

      {/* Today summary */}
      {dayCalories > 0 && (
        <button
          onClick={onOpenDay}
          className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-app bg-surface p-4 text-left hover:bg-surface-2"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ background: 'var(--brand)' }}
          >
            <IconFlame size={20} />
          </span>
          <div className="flex-1">
            <div className="font-bold text-body">
              {formatNumber(dayCalories)} cal logged today
            </div>
            <div className="text-sm text-muted">
              {remaining !== null
                ? remaining >= 0
                  ? `${formatNumber(remaining)} cal left of your ${formatNumber(dayGoal!)} goal`
                  : `${formatNumber(Math.abs(remaining))} cal over your goal`
                : 'Tap to see your day'}
            </div>
          </div>
          <IconChevron size={18} className="text-muted" />
        </button>
      )}

      {/* Search entry */}
      <button
        onClick={onOpenSearch}
        className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-app bg-surface px-4 py-3 text-left text-muted hover:bg-surface-2"
      >
        <IconSearch size={18} />
        <span>Search dishes, restaurants or cuisines — Italian, Japanese, Thai…</span>
      </button>

      {/* Segment filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Chip active={segment === null} onClick={() => setSegment(null)}>
          All
        </Chip>
        {SEGMENTS.map((s) => (
          <Chip key={s} active={segment === s} onClick={() => setSegment(s)}>
            <span className="inline-flex items-center gap-1.5">
              {SEGMENT_ICON[s]}
              {s}
            </span>
          </Chip>
        ))}
      </div>

      {/* Restaurant grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {shown.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
            onOpen={() => onOpenRestaurant(r.id)}
          />
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        Nutrition figures are approximate, compiled from published Canadian
        nutrition guides. Always verify with the restaurant.
      </p>
    </div>
  )
}
