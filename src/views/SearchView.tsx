import { useMemo, useState } from 'react'
import { restaurants } from '../data'
import { type MenuItem, type Nutrition, type Restaurant } from '../types'
import { type Goal } from '../hooks/useGoal'
import {
  buildIndex,
  filterEntries,
  type SearchFilters,
} from '../lib/search'
import { ItemCard } from '../components/ItemCard'
import { Chip } from '../components/ui'

interface Props {
  goal: Goal
  onOpenItem: (restaurantId: string, itemId: string) => void
  isInCompare: (key: string) => boolean
  toggleCompare: (
    restaurant: Restaurant,
    item: MenuItem,
    nutrition: Nutrition,
  ) => void
}

const CAL_PRESETS = [400, 500, 700]
const PROTEIN_PRESETS = [20, 30, 40]

export function SearchView({
  goal,
  onOpenItem,
  isInCompare,
  toggleCompare,
}: Props) {
  const index = useMemo(() => buildIndex(restaurants), [])
  const [filters, setFilters] = useState<SearchFilters>({ query: '' })

  const results = useMemo(
    () => filterEntries(index, filters),
    [index, filters],
  )

  function patch(p: Partial<SearchFilters>) {
    setFilters((f) => ({ ...f, ...p }))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-3 text-2xl font-black text-body">Search every menu</h1>

      <input
        autoFocus
        value={filters.query}
        onChange={(e) => patch({ query: e.target.value })}
        placeholder="Search items or restaurants…"
        className="w-full rounded-2xl border border-app bg-surface px-4 py-3 text-body outline-none focus:border-[var(--brand)]"
      />

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-muted">Under</span>
          {CAL_PRESETS.map((c) => (
            <Chip
              key={c}
              active={filters.maxCalories === c}
              onClick={() =>
                patch({
                  maxCalories: filters.maxCalories === c ? undefined : c,
                })
              }
            >
              {c} cal
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-muted">Protein ≥</span>
          {PROTEIN_PRESETS.map((p) => (
            <Chip
              key={p}
              active={filters.minProtein === p}
              onClick={() =>
                patch({
                  minProtein: filters.minProtein === p ? undefined : p,
                })
              }
            >
              {p}g
            </Chip>
          ))}
          <Chip
            active={!!filters.vegetarianOnly}
            onClick={() =>
              patch({ vegetarianOnly: !filters.vegetarianOnly })
            }
          >
            🥗 Veg
          </Chip>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        {results.length} item{results.length === 1 ? '' : 's'}
        {(filters.maxCalories || filters.minProtein) && (
          <span> · builders shown at their lightest build</span>
        )}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {results.map(({ restaurant, item }) => {
          const key = `${restaurant.id}:${item.id}`
          return (
            <ItemCard
              key={key}
              restaurant={restaurant}
              item={item}
              goal={goal}
              showRestaurant
              onOpen={() => onOpenItem(restaurant.id, item.id)}
              compareActive={isInCompare(key)}
              onToggleCompare={(nutrition) =>
                toggleCompare(restaurant, item, nutrition)
              }
            />
          )
        })}
      </div>

      {results.length === 0 && (
        <div className="mt-10 text-center text-muted">
          No items match. Try loosening a filter.
        </div>
      )}
    </div>
  )
}
