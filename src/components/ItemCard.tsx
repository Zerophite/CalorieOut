import { type MenuItem, type Nutrition, type Restaurant } from '../types'
import { baseNutrition, formatNumber, minimalNutrition } from '../lib/nutrition'
import { type Goal } from '../hooks/useGoal'
import { MacroBar } from './MacroBar'
import { EstimateBadge, GoalFitBadge, TagChip, evaluateGoal } from './ui'

interface Props {
  restaurant: Restaurant
  item: MenuItem
  goal: Goal
  onOpen: () => void
  /** Shown when the card appears outside its own restaurant page. */
  showRestaurant?: boolean
  compareActive?: boolean
  onToggleCompare?: (nutrition: Nutrition) => void
}

export function ItemCard({
  restaurant,
  item,
  goal,
  onOpen,
  showRestaurant,
  compareActive,
  onToggleCompare,
}: Props) {
  const isBuilder = item.kind === 'builder'
  const nutrition = isBuilder
    ? minimalNutrition(item)
    : baseNutrition(item)
  const fit = evaluateGoal(nutrition, goal)

  return (
    <div className="flex flex-col rounded-2xl border border-app bg-surface p-4 transition-shadow hover:shadow-md">
      <button onClick={onOpen} className="flex-1 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {showRestaurant && (
              <div className="mb-0.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                {restaurant.name}
                {restaurant.dataSource === 'estimated' && <EstimateBadge />}
              </div>
            )}
            <h3 className="font-semibold leading-tight text-body">
              {item.name}
            </h3>
            {item.kind === 'fixed' && item.serving && (
              <div className="mt-0.5 text-xs text-muted">{item.serving}</div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xl font-bold text-body">
              {formatNumber(nutrition.calories)}
            </div>
            <div className="text-xs text-muted">
              {isBuilder ? 'cal & up' : 'cal'}
            </div>
          </div>
        </div>

        {item.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted">
            {item.description}
          </p>
        )}

        <div className="mt-3">
          <MacroBar nutrition={nutrition} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span>P {formatNumber(nutrition.protein)}g</span>
          <span>C {formatNumber(nutrition.carbs)}g</span>
          <span>F {formatNumber(nutrition.fat)}g</span>
        </div>

        {(fit !== 'off' || (item.tags && item.tags.length > 0)) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <GoalFitBadge fit={fit} />
            {item.tags?.map((t) => (
              <TagChip key={t} tag={t} />
            ))}
          </div>
        )}
      </button>

      <div className="mt-3 flex gap-2">
        <button
          onClick={onOpen}
          className="flex-1 rounded-xl bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)]"
        >
          {isBuilder ? 'Customize' : 'Details'}
        </button>
        {!isBuilder && onToggleCompare && (
          <button
            onClick={() => onToggleCompare(nutrition)}
            className={
              'rounded-xl border px-3 py-2 text-sm font-semibold ' +
              (compareActive
                ? 'border-transparent bg-surface-2 text-body'
                : 'border-app bg-surface text-muted hover:bg-surface-2')
            }
            title="Add to compare"
          >
            {compareActive ? '✓ Compare' : '+ Compare'}
          </button>
        )}
      </div>
    </div>
  )
}
