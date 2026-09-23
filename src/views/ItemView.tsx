import { type MenuItem, type Nutrition, type Restaurant } from '../types'
import { baseNutrition } from '../lib/nutrition'
import { type Goal } from '../hooks/useGoal'
import { NutritionFacts } from '../components/NutritionFacts'
import { BuilderView } from '../components/BuilderView'
import {
  EstimateBanner,
  GoalFitBadge,
  TagChip,
  evaluateGoal,
} from '../components/ui'

interface Props {
  restaurant: Restaurant
  item: MenuItem
  goal: Goal
  isInCompare: (key: string) => boolean
  toggleCompare: (
    restaurant: Restaurant,
    item: MenuItem,
    nutrition: Nutrition,
    detail?: string,
  ) => void
}

export function ItemView({
  restaurant,
  item,
  goal,
  isInCompare,
  toggleCompare,
}: Props) {
  const key = `${restaurant.id}:${item.id}`

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-1 text-sm font-medium text-muted">
        {restaurant.name}
      </div>
      <h1 className="text-2xl font-black text-body">{item.name}</h1>
      {item.description && (
        <p className="mt-1 max-w-2xl text-muted">{item.description}</p>
      )}
      {item.tags && item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </div>
      )}

      {restaurant.dataSource === 'estimated' && (
        <div className="mt-4">
          <EstimateBanner />
        </div>
      )}

      <div className="mt-5">
        {item.kind === 'builder' ? (
          <BuilderView
            item={item}
            goal={goal}
            onAddToCompare={(nutrition, detail) =>
              toggleCompare(restaurant, item, nutrition, detail)
            }
          />
        ) : (
          <FixedItemDetail
            item={item}
            goal={goal}
            inCompare={isInCompare(key)}
            onToggleCompare={() =>
              toggleCompare(restaurant, item, baseNutrition(item))
            }
          />
        )}
      </div>
    </div>
  )
}

function FixedItemDetail({
  item,
  goal,
  inCompare,
  onToggleCompare,
}: {
  item: Extract<MenuItem, { kind: 'fixed' }>
  goal: Goal
  inCompare: boolean
  onToggleCompare: () => void
}) {
  const nutrition = baseNutrition(item)
  const fit = evaluateGoal(nutrition, goal)
  return (
    <div className="max-w-md space-y-3">
      {item.serving && (
        <div className="text-sm text-muted">Serving: {item.serving}</div>
      )}
      <GoalFitBadge fit={fit} />
      <NutritionFacts nutrition={nutrition} showDailyHints />
      <button
        onClick={onToggleCompare}
        className={
          'w-full rounded-xl border px-3 py-2.5 text-sm font-semibold ' +
          (inCompare
            ? 'border-transparent bg-surface-2 text-body'
            : 'border-app bg-surface text-body hover:bg-surface-2')
        }
      >
        {inCompare ? '✓ In compare tray' : '+ Add to compare'}
      </button>
    </div>
  )
}
