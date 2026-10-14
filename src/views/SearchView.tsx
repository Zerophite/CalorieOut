import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { restaurants } from '../data'
import { useAllMenus } from '../hooks/useMenu'
import { type MenuItem, type Nutrition, type Restaurant } from '../types'
import { type Goal } from '../hooks/useGoal'
import { buildIndex, filterEntries, fold, type SearchFilters } from '../lib/search'
import { CUISINES } from '../lib/cuisine'
import { ItemCard } from '../components/ItemCard'
import { Chip } from '../components/ui'
import { RestaurantCard } from './Home'

interface Props {
  goal: Goal
  onOpenItem: (restaurantId: string, itemId: string) => void
  onOpenRestaurant: (restaurantId: string) => void
  isInCompare: (key: string) => boolean
  toggleCompare: (restaurant: Restaurant, item: MenuItem, nutrition: Nutrition) => void
  addToDay: (restaurant: Restaurant, item: MenuItem, nutrition: Nutrition) => void
}

const CAL_PRESETS = [400, 500, 700]
const PROTEIN_PRESETS = [20, 30, 40]
/** Results are shown a page at a time so typing stays instant. */
const PAGE = 40

type Mode = 'food' | 'restaurants'

export function SearchView({ goal, onOpenItem, onOpenRestaurant, isInCompare, toggleCompare, addToDay }: Props) {
  const loaded = useAllMenus(restaurants)
  const index = useMemo(() => (loaded ? buildIndex(loaded) : []), [loaded])
  const [mode, setMode] = useState<Mode>('food')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Omit<SearchFilters, 'query'>>({})
  const [shown, setShown] = useState(PAGE)

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

  // Restaurants whose name or type matches the search.
  const matchedRestaurants = useMemo(() => {
    const words = fold(deferredQuery).split(/\s+/).filter(Boolean)
    return restaurants.filter((r) => {
      const text = fold(`${r.name} ${r.cuisine} ${r.segment}`)
      return !words.length || words.every((w) => text.includes(w))
    })
  }, [deferredQuery])

  // How many of each cuisine's dishes every restaurant serves.
  const dishesByRestaurant = useMemo(() => {
    const out: Record<string, Record<string, number>> = {}
    for (const e of index) {
      const r = (out[e.restaurant.id] ??= {})
      for (const c of e.cuisines) r[c] = (r[c] ?? 0) + 1
    }
    return out
  }, [index])

  // On the Restaurants tab the chips count restaurants, not dishes.
  const restaurantCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of matchedRestaurants) for (const c of Object.keys(dishesByRestaurant[r.id] ?? {})) counts[c] = (counts[c] ?? 0) + 1
    return counts
  }, [matchedRestaurants, dishesByRestaurant])

  // Restaurants under a cuisine: the ones that serve it first (ramen shops
  // before a sub chain's teriyaki), then by how many of its dishes they have.
  const restaurantResults = useMemo(() => {
    if (!cuisine) return matchedRestaurants
    const def = CUISINES.find((c) => c.id === cuisine)!
    const dishes = (r: Restaurant) => dishesByRestaurant[r.id]?.[cuisine] ?? 0
    const serves = (r: Restaurant) => ((def.restaurant ?? def.dish).test(r.cuisine) || def.dish.test(r.name) ? 1 : 0)
    return matchedRestaurants.filter((r) => dishes(r)).sort((x, y) => serves(y) - serves(x) || dishes(y) - dishes(x))
  }, [matchedRestaurants, cuisine, dishesByRestaurant])

  const chipCounts = mode === 'food' ? cuisineCounts : restaurantCounts

  // A new search starts back at the first page.
  useEffect(() => setShown(PAGE), [deferredQuery, deferredFilters, mode])

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

  function patch(p: Partial<SearchFilters>) {
    setFilters((f) => ({ ...f, ...p }))
  }

  const tab = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={
        'flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ' +
        (mode === m ? 'bg-surface text-body shadow-sm' : 'text-muted hover:text-body')
      }
    >
      {label}
    </button>
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-3 text-2xl font-black text-body">Search</h1>

      <div className="mb-3 flex gap-1 rounded-2xl bg-surface-2 p-1">
        {tab('food', 'Food')}
        {tab('restaurants', 'Restaurants')}
      </div>

      <input
        autoFocus
        type="search"
        inputMode="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={mode === 'food' ? 'Search dishes — “chicken wrap”, “latte”…' : 'Search restaurants — “shawarma”, “pizza”…'}
        className="w-full rounded-2xl border border-app bg-surface px-4 py-3 text-base text-body outline-none focus:border-[var(--brand)]"
      />

      <div className="mt-4 space-y-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <Chip active={!filters.cuisine} onClick={() => patch({ cuisine: undefined })}>
            All cuisines
          </Chip>
          {CUISINES.filter((c) => chipCounts[c.id] || filters.cuisine === c.id).map((c) => (
            <span key={c.id} className="shrink-0">
              <Chip active={filters.cuisine === c.id} onClick={() => patch({ cuisine: filters.cuisine === c.id ? undefined : c.id })}>
                {c.label}
                <span className="ml-1 text-xs opacity-70">{chipCounts[c.id] ?? 0}</span>
              </Chip>
            </span>
          ))}
        </div>

        {mode === 'food' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-muted">Under</span>
              {CAL_PRESETS.map((c) => (
                <Chip key={c} active={filters.maxCalories === c} onClick={() => patch({ maxCalories: filters.maxCalories === c ? undefined : c })}>
                  {c} cal
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-muted">Protein ≥</span>
              {PROTEIN_PRESETS.map((p) => (
                <Chip key={p} active={filters.minProtein === p} onClick={() => patch({ minProtein: filters.minProtein === p ? undefined : p })}>
                  {p}g
                </Chip>
              ))}
              <Chip active={!!filters.vegetarianOnly} onClick={() => patch({ vegetarianOnly: !filters.vegetarianOnly })}>
                🥗 Veg
              </Chip>
            </div>
          </>
        )}
      </div>

      <div className={'transition-opacity ' + (stale ? 'opacity-60' : '')}>
        {mode === 'food' ? (
          <>
            <p className="mt-4 text-sm text-muted">
              {results.length.toLocaleString('en-CA')} dish{results.length === 1 ? '' : 'es'}
              {(filters.maxCalories || filters.minProtein) && <span> · builders shown at their lightest build</span>}
            </p>
            {dishList}
            {results.length > shown && (
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE)}
                className="mx-auto mt-4 block rounded-xl border border-app bg-surface px-5 py-2.5 text-sm font-semibold text-body hover:bg-surface-2"
              >
                Show more ({(results.length - shown).toLocaleString('en-CA')} left)
              </button>
            )}
            {!loaded && <div className="mt-10 text-center text-muted">Loading all menus…</div>}
            {loaded && results.length === 0 && <div className="mt-10 text-center text-muted">No dishes match. Try loosening a filter.</div>}
          </>
        ) : (
          <>
            <p className="mt-4 text-sm text-muted">
              {restaurantResults.length} restaurant{restaurantResults.length === 1 ? '' : 's'}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {restaurantResults.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} onOpen={() => onOpenRestaurant(r.id)} />
              ))}
            </div>
            {restaurantResults.length === 0 && <div className="mt-10 text-center text-muted">No restaurants match.</div>}
          </>
        )}
      </div>
    </div>
  )
}
