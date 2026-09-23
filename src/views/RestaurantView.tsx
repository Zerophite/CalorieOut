import { useMemo, useState } from 'react'
import { type MenuItem, type Nutrition, type Restaurant } from '../types'
import { type Goal } from '../hooks/useGoal'
import { BrandTile, Chip, EstimateBanner } from '../components/ui'
import { GoalBar } from '../components/GoalBar'
import { ItemCard } from '../components/ItemCard'

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
}

export function RestaurantView({
  restaurant,
  goal,
  setGoal,
  onOpenItem,
  isInCompare,
  toggleCompare,
}: Props) {
  const categories = useMemo(() => {
    const seen: string[] = []
    for (const item of restaurant.items) {
      if (!seen.includes(item.category)) seen.push(item.category)
    }
    return seen
  }, [restaurant])

  const [activeCat, setActiveCat] = useState<string | null>(null)
  const items = activeCat
    ? restaurant.items.filter((i) => i.category === activeCat)
    : restaurant.items

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex items-center gap-4">
        <BrandTile name={restaurant.name} accent={restaurant.accent} size="lg" />
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
            />
          )
        })}
      </div>
    </div>
  )
}
