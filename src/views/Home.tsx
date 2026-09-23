import { useState } from 'react'
import { restaurants, SEGMENTS } from '../data'
import { type Restaurant } from '../types'
import { BrandTile, Chip, EstimateBadge } from '../components/ui'

interface Props {
  onOpenRestaurant: (id: string) => void
  onOpenSearch: () => void
}

function RestaurantCard({
  restaurant,
  onOpen,
}: {
  restaurant: Restaurant
  onOpen: () => void
}) {
  const builderCount = restaurant.items.filter(
    (i) => i.kind === 'builder',
  ).length
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-4 rounded-2xl border border-app bg-surface p-4 text-left transition-shadow hover:shadow-md"
    >
      <BrandTile name={restaurant.name} accent={restaurant.accent} size="lg" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-body">{restaurant.name}</h3>
          {restaurant.dataSource === 'estimated' && <EstimateBadge />}
        </div>
        <p className="truncate text-sm text-muted">{restaurant.cuisine}</p>
        <p className="mt-1 text-xs text-muted">
          {restaurant.items.length} items
          {builderCount > 0 && ' · custom builder'}
        </p>
      </div>
    </button>
  )
}

export function Home({ onOpenRestaurant, onOpenSearch }: Props) {
  const [segment, setSegment] = useState<string | null>(null)
  const shown = segment
    ? restaurants.filter((r) => r.segment === segment)
    : restaurants

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Hero */}
      <header className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-body sm:text-4xl">
          Eat out smarter 🇨🇦
        </h1>
        <p className="mt-1 max-w-2xl text-muted">
          Calories and macros for Canadian restaurants — browse menus, build
          custom bowls and burritos, and find what fits your goal.
        </p>
      </header>

      {/* Search entry */}
      <button
        onClick={onOpenSearch}
        className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-app bg-surface px-4 py-3 text-left text-muted hover:bg-surface-2"
      >
        <span className="text-lg">🔍</span>
        <span>Search all items — “chicken under 500 cal”, “high protein”…</span>
      </button>

      {/* Segment filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Chip active={segment === null} onClick={() => setSegment(null)}>
          All
        </Chip>
        {SEGMENTS.map((s) => (
          <Chip
            key={s}
            active={segment === s}
            onClick={() => setSegment(s)}
          >
            {s}
          </Chip>
        ))}
      </div>

      {/* Restaurant grid */}
      <div className="grid gap-3 sm:grid-cols-2">
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
