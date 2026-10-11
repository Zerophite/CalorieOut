import { useState } from 'react'
import { type MenuItem, type Nutrition, type Restaurant } from '../types'
import { baseNutrition, isCustomizable } from '../lib/nutrition'
import { type Goal } from '../hooks/useGoal'
import { NutritionFacts } from '../components/NutritionFacts'
import { BuilderView } from '../components/BuilderView'
import { FixedCustomizer } from '../components/FixedCustomizer'
import {
  EstimateBanner,
  GoalFitBadge,
  TagChip,
  evaluateGoal,
} from '../components/ui'
import { IconCheck, IconPlus, IconSliders } from '../components/icons'

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
  addToDay: (
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
  addToDay,
}: Props) {
  const key = `${restaurant.id}:${item.id}`
  const customizable = isCustomizable(item)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-1 text-sm font-medium text-muted">
        {restaurant.name}
      </div>
      <h1 className="text-2xl font-black text-body">{item.name}</h1>
      {item.description && (
        <p className="mt-1 max-w-2xl text-muted">{item.description}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {customizable && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand)]/15 px-2 py-0.5 text-xs font-semibold text-[var(--color-brand-dark)] dark:text-emerald-400">
            <IconSliders size={13} /> Customizable
          </span>
        )}
        {item.tags?.map((t) => (
          <TagChip key={t} tag={t} />
        ))}
      </div>

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
            onAddToDay={(nutrition, detail) =>
              addToDay(restaurant, item, nutrition, detail)
            }
          />
        ) : customizable ? (
          <FixedCustomizer
            item={item}
            goal={goal}
            onAddToDay={(nutrition, detail) =>
              addToDay(restaurant, item, nutrition, detail)
            }
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
            onAddToDay={() => addToDay(restaurant, item, baseNutrition(item))}
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
  onAddToDay,
}: {
  item: Extract<MenuItem, { kind: 'fixed' }>
  goal: Goal
  inCompare: boolean
  onToggleCompare: () => void
  onAddToDay: () => void
}) {
  const nutrition = baseNutrition(item)
  const fit = evaluateGoal(nutrition, goal)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    onAddToDay()
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="max-w-md space-y-3">
      {item.serving && (
        <div className="text-sm text-muted">Serving: {item.serving}</div>
      )}
      <GoalFitBadge fit={fit} />
      <NutritionFacts nutrition={nutrition} showDailyHints />
      <button
        onClick={handleAdd}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)]"
      >
        {added ? <IconCheck size={16} /> : <IconPlus size={16} />}
        {added ? 'Added to your day' : 'Add to my day'}
      </button>
      <button
        onClick={onToggleCompare}
        className={
          'w-full rounded-xl border px-3 py-2.5 text-sm font-semibold ' +
          (inCompare
            ? 'border-transparent bg-surface-2 text-body'
            : 'border-app bg-surface text-body hover:bg-surface-2')
        }
      >
        {inCompare ? 'In compare tray' : 'Add to compare'}
      </button>
    </div>
  )
}
