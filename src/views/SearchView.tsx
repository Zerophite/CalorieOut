import { useDeferredValue, useEffect, useMemo, useRef } from 'react'
import { restaurants } from '../data'
import { useAllMenus } from '../hooks/useMenu'
import { useRemembered } from '../hooks/useRemembered'
import { type MenuItem, type Nutrition, type Restaurant } from '../types'
import { type Goal } from '../hooks/useGoal'
import { buildIndex, filterEntries, type SearchFilters } from '../lib/search'
import { CUISINES } from '../lib/cuisine'
import { ItemCard } from '../components/ItemCard'
import { Chip, ChipRow } from '../components/ui'

interface Props {
  goal: Goal
  onOpenItem: (restaurantId: string, itemId: string) => void
  isInCompare: (key: string) => boolean
  toggleCompare: (restaurant: Restaurant, item: MenuItem, nutrition: Nutrition) => void
  addToDay: (restaurant: Restaurant, item: MenuItem, nutrition: Nutrition) => void
}

const CAL_PRESETS = [400, 500, 700]
const PROTEIN_PRESETS = [20, 30, 40]
/** Results are shown a page at a time so typing stays instant. */
const PAGE = 40

/** Dish search across every menu. Restaurants are browsed and searched on the home screen. */
export function SearchView({ goal, onOpenItem, isInCompare, toggleCompare, addToDay }: Props) {
  const loaded = useAllMenus(restaurants)
  const index = useMemo(() => (loaded ? buildIndex(loaded) : []), [loaded])
  // Remembered, so opening a dish and going back keeps the search as it was.
  const [query, setQuery] = useRemembered('search.query', '')
  const [filters, setFilters] = useRemembered<Omit<SearchFilters, 'query'>>('search.filters', {})

  // The box updates on every keystroke; filtering follows a beat behind
  // without blocking the input.
  const deferredQuery = useDeferredValue(query)
  const deferredFilters = useDeferredValue(filters)
  const stale = deferredQuery !== query || deferredFilters !== filters

  // Everything but the cuisine filter, once per search; the cuisine chips count
  // from it and the cuisine filter narrows it.
  const base = useMemo(
    () => filterEntries(index, { ...deferredFilters, cuisine: undefined, query: deferredQuery }),
    [index, deferredFilters, deferredQuery],
  )
  const cuisine = deferredFilters.cuisine
  const results = useMemo(() => (cuisine ? base.filter((e) => e.cuisines.includes(cuisine)) : base), [base, cuisine])

  // Dishes per cuisine, so empty cuisines hide.
  const cuisineCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of base) for (const c of e.cuisines) counts[c] = (counts[c] ?? 0) + 1
    return counts
  }, [base])

  // Pages shown for this exact search; a new search starts back at the first page.
  const signature = JSON.stringify([deferredQuery, deferredFilters])
  const [page, setPage] = useRemembered('search.page', { signature, shown: PAGE })
  const shown = page.signature === signature ? page.shown : PAGE

  // Built only when the results change, so a keystroke doesn't re-render every card.
  const dishList = useMemo(
    () => (
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {results.slice(0, shown).map(({ restaurant, item }) => {
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
              onToggleCompare={(nutrition) => toggleCompare(restaurant, item, nutrition)}
              onAddToDay={(nutrition) => addToDay(restaurant, item, nutrition)}
            />
          )
        })}
      </div>
    ),
    [results, shown, goal, isInCompare, onOpenItem, toggleCompare, addToDay],
  )

  // Coming back with a cuisine picked, bring its chip into view.
  const chipRow = useRef<HTMLElement>(null)
  useEffect(() => {
    // Only the chip row scrolls sideways; the page keeps its place.
    for (const chip of chipRow.current?.querySelectorAll<HTMLElement>('[data-active="true"]') ?? []) {
      const row = chip.parentElement!
      row.scrollLeft = chip.offsetLeft - row.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2
    }
  }, [])

  function patch(p: Partial<SearchFilters>) {
    setFilters((f) => ({ ...f, ...p }))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-3 text-2xl font-black text-body">Search dishes</h1>

      <input
        type="search"
        inputMode="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search dishes — “chicken wrap”, “latte”…"
        className="w-full rounded-2xl border border-app bg-surface px-4 py-3 text-base text-body outline-none focus:border-[var(--brand)]"
      />

      <section ref={chipRow} className="mt-4 space-y-3 rounded-2xl border border-app bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-body">Filters</h2>
          {(filters.cuisine || filters.maxCalories || filters.minProtein || filters.vegetarianOnly) && (
            <button onClick={() => setFilters({})} className="text-sm font-semibold text-[var(--brand)] hover:underline">
              Clear
            </button>
          )}
        </div>
        <ChipRow label="Cuisine">
          {CUISINES.filter((c) => cuisineCounts[c.id] || filters.cuisine === c.id).map((c) => (
            <span key={c.id} data-active={filters.cuisine === c.id}>
              <Chip active={filters.cuisine === c.id} onClick={() => patch({ cuisine: filters.cuisine === c.id ? undefined : c.id })}>
                {c.label}
                <span className="ml-1 text-xs opacity-70">{cuisineCounts[c.id] ?? 0}</span>
              </Chip>
            </span>
          ))}
        </ChipRow>
        <ChipRow label="Calories">
          {CAL_PRESETS.map((c) => (
            <Chip key={c} active={filters.maxCalories === c} onClick={() => patch({ maxCalories: filters.maxCalories === c ? undefined : c })}>
              Under {c} cal
            </Chip>
          ))}
        </ChipRow>
        <ChipRow label="Protein & diet">
          {PROTEIN_PRESETS.map((p) => (
            <Chip key={p} active={filters.minProtein === p} onClick={() => patch({ minProtein: filters.minProtein === p ? undefined : p })}>
              {p}g+ protein
            </Chip>
          ))}
          <Chip active={!!filters.vegetarianOnly} onClick={() => patch({ vegetarianOnly: !filters.vegetarianOnly })}>
            🥗 Vegetarian
          </Chip>
        </ChipRow>
      </section>

      <div className={'transition-opacity ' + (stale ? 'opacity-60' : '')}>
        <p className="mt-4 text-sm text-muted">
          {results.length.toLocaleString('en-CA')} dish{results.length === 1 ? '' : 'es'}
          {(filters.maxCalories || filters.minProtein) && <span> · builders shown at their lightest build</span>}
        </p>
        {dishList}
        {results.length > shown && (
          <button
            type="button"
            onClick={() => setPage({ signature, shown: shown + PAGE })}
            className="mx-auto mt-4 block rounded-xl border border-app bg-surface px-5 py-2.5 text-sm font-semibold text-body hover:bg-surface-2"
          >
            Show more ({(results.length - shown).toLocaleString('en-CA')} left)
          </button>
        )}
        {!loaded && <div className="mt-10 text-center text-muted">Loading all menus…</div>}
        {loaded && results.length === 0 && <div className="mt-10 text-center text-muted">No dishes match. Try loosening a filter.</div>}
      </div>
    </div>
  )
}
