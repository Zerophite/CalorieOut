import { useMemo, useState } from 'react'
import { type MenuItem, type Nutrition, type Restaurant } from '../types'
import { type Goal } from '../hooks/useGoal'
import { useMenu } from '../hooks/useMenu'
import { BrandLogo, Chip, EstimateBanner, MenuLoading } from '../components/ui'
import { GoalBar } from '../components/GoalBar'
import { ItemCard } from '../components/ItemCard'
import { IconSearch } from '../components/icons'

interface Props {
  restaurant: Restaurant
  goal: Goal
  setGoal: (next: Goal | ((prev: Goal) => Goal)) => void
  onOpenItem: (itemId: string) => void
  isInCompare: (key: string) => boolean
  toggleCompare: (
    restaurant: Restaurant,
    item: MenuItem,
    nutrition: Nutrition,
  ) => void
  addToDay: (restaurant: Restaurant, item: MenuItem, nutrition: Nutrition) => void
}

export function RestaurantView({
  restaurant,
  goal,
  setGoal,
  onOpenItem,
  isInCompare,
  toggleCompare,
  addToDay,
}: Props) {
  const menu = useMenu(restaurant)
  const all = useMemo(() => menu ?? [], [menu])
  const categories = useMemo(() => {
    const seen: string[] = []
    for (const item of all) {
      if (!seen.includes(item.category)) seen.push(item.category)
    }
    return seen
  }, [all])

  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const items = all.filter(
    (i) => (!activeCat || i.category === activeCat) && (!q || i.name.toLowerCase().includes(q)),
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex items-center gap-4">
        <BrandLogo
          id={restaurant.id}
          name={restaurant.name}
          accent={restaurant.accent}
          size="lg"
        />
        <div>
          <h1 className="text-2xl font-black text-body">{restaurant.name}</h1>
          <p className="text-muted">{restaurant.cuisine}</p>
        </div>
      </div>

      {restaurant.dataSource === 'estimated' && (
        <div className="mb-4">
          <EstimateBanner />
        </div>
      )}

      <div className="mb-4">
        <GoalBar goal={goal} setGoal={setGoal} />
      </div>

      {!menu && <MenuLoading />}

      {all.length > 12 && (
        <label className="mb-3 flex items-center gap-2 rounded-2xl border border-app bg-surface px-4 py-2.5 text-muted">
          <IconSearch size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${all.length} items at ${restaurant.name}…`}
            className="w-full bg-transparent text-body outline-none placeholder:text-muted"
          />
        </label>
      )}

      {categories.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Chip active={activeCat === null} onClick={() => setActiveCat(null)}>
            All
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c}
              active={activeCat === c}
              onClick={() => setActiveCat(c)}
            >
              {c}
            </Chip>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const key = `${restaurant.id}:${item.id}`
          return (
            <ItemCard
              key={item.id}
              restaurant={restaurant}
              item={item}
              goal={goal}
              onOpen={() => onOpenItem(item.id)}
              compareActive={isInCompare(key)}
              onToggleCompare={(nutrition) =>
                toggleCompare(restaurant, item, nutrition)
              }
              onAddToDay={(nutrition) => addToDay(restaurant, item, nutrition)}
            />
          )
        })}
      </div>
      {menu && items.length === 0 && (
        <p className="mt-8 text-center text-muted">No items match “{query}”.</p>
      )}
    </div>
  )
}
