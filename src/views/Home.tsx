import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { restaurants, SEGMENTS } from '../data'
import { type Restaurant } from '../types'
import { formatNumber } from '../lib/nutrition'
import { fold } from '../lib/search'
import { CUISINE_GROUPS, RESTAURANT_CUISINES, restaurantCuisines } from '../lib/cuisine'
import { useRemembered } from '../hooks/useRemembered'
import { BrandLogo, Chip, ChipRow, EstimateBadge } from '../components/ui'
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
  // Remembered, so going into a restaurant and back keeps the list as it was.
  const [query, setQuery] = useRemembered('home.query', '')
  const [cuisine, setCuisine] = useRemembered<string | null>('home.cuisine', null)
  const [segment, setSegment] = useRemembered<string | null>('home.segment', null)

  // Coming back with a cuisine picked, bring its chip into view.
  const chipRow = useRef<HTMLElement>(null)
  useEffect(() => {
    // Only each chip row scrolls sideways; the page keeps its place.
    for (const chip of chipRow.current?.querySelectorAll<HTMLElement>('[data-active="true"]') ?? []) {
      const row = chip.parentElement!
      row.scrollLeft = chip.offsetLeft - row.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2
    }
  }, [])

  const tagged = useMemo(() => restaurants.map((r) => ({ r, cuisines: restaurantCuisines(r), text: fold(`${r.name} ${r.cuisine} ${r.segment}`) })), [])
  const words = fold(query).split(/\s+/).filter(Boolean)
  const matching = tagged.filter(({ text }) => words.every((w) => text.includes(w)))
  const inSegment = matching.filter(({ r }) => !segment || r.segment === segment)
  const shown = inSegment.filter(({ cuisines }) => !cuisine || cuisines.includes(cuisine)).map(({ r }) => r)
  // How many restaurants each cuisine has, given the search and type; empty ones hide.
  const counts: Record<string, number> = {}
  for (const { cuisines } of inSegment) for (const c of cuisines) counts[c] = (counts[c] ?? 0) + 1

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

      {/* Restaurant search */}
      <div className="mb-3 flex items-center gap-3 rounded-2xl border border-app bg-surface px-4 focus-within:border-[var(--brand)]">
        <IconSearch size={18} className="shrink-0 text-muted" />
        <input
          type="search"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search restaurants — “shawarma”, “sushi”…"
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-body outline-none"
        />
      </div>
      <button
        onClick={onOpenSearch}
        className="mb-5 flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] hover:underline"
      >
        <IconSearch size={14} />
        Looking for a dish? Search every menu
      </button>

      {/* Browse: cuisine, food, drinks and type of place, each in its own row */}
      <section ref={chipRow} className="mb-5 space-y-3 rounded-2xl border border-app bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-body">Browse</h2>
          {(cuisine || segment) && (
            <button
              onClick={() => {
                setCuisine(null)
                setSegment(null)
              }}
              className="text-sm font-semibold text-[var(--brand)] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        {CUISINE_GROUPS.map((g) => {
          const chips = RESTAURANT_CUISINES.filter((c) => c.group === g.id && (counts[c.id] || cuisine === c.id))
          if (!chips.length) return null
          return (
            <ChipRow key={g.id} label={g.label}>
              {chips.map((c) => (
                <span key={c.id} data-active={cuisine === c.id}>
                  <Chip active={cuisine === c.id} onClick={() => setCuisine(cuisine === c.id ? null : c.id)}>
                    {c.label}
                    <span className="ml-1 text-xs opacity-70">{counts[c.id] ?? 0}</span>
                  </Chip>
                </span>
              ))}
            </ChipRow>
          )
        })}
        <ChipRow label="Type of place">
          {SEGMENTS.map((s) => (
            <span key={s} data-active={segment === s}>
              <Chip active={segment === s} onClick={() => setSegment(segment === s ? null : s)}>
                <span className="inline-flex items-center gap-1.5">
                  {SEGMENT_ICON[s]}
                  {s}
                </span>
              </Chip>
            </span>
          ))}
        </ChipRow>
      </section>

      <p className="mb-3 text-sm text-muted">
        {shown.length} restaurant{shown.length === 1 ? '' : 's'}
      </p>

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
      {shown.length === 0 && <div className="mt-6 text-center text-muted">No restaurants match. Try another search or cuisine.</div>}

      <p className="mt-8 text-center text-xs text-muted">
        Nutrition figures are approximate, compiled from published Canadian
        nutrition guides. Always verify with the restaurant.
      </p>
    </div>
  )
}
