import { useMemo, useState } from 'react'
import { type FixedItem, type IngredientComponent, type Nutrition } from '../types'
import {
  type ComponentSelection,
  MAX_QUANTITY,
  defaultComponentSelection,
  formatNumber,
  isComponentDefaultOn,
  totalForComponents,
} from '../lib/nutrition'
import { type Goal } from '../hooks/useGoal'
import { componentsFor } from '../data/templates'
import { NutritionFacts } from './NutritionFacts'
import { GoalFitBadge, QuantityStepper, evaluateGoal } from './ui'
import { IconCheck, IconPlus } from './icons'

interface Props {
  item: FixedItem
  goal: Goal
  onAddToDay: (nutrition: Nutrition, detail: string) => void
  onAddToCompare: (nutrition: Nutrition, detail: string) => void
}

/**
 * Size-aware wrapper: when an item comes in sizes, show size chips and run the
 * ingredient customizer for the chosen size (selection resets per size).
 */
export function FixedCustomizer(props: Props) {
  const { item } = props
  const sizes = item.sizes && item.sizes.length > 1 ? item.sizes : null
  const initial = sizes ? Math.max(0, sizes.findIndex((s) => s.label === item.defaultSize)) : 0
  const [sizeIdx, setSizeIdx] = useState(initial)

  if (!sizes) return <SizedCustomizer {...props} sizeLabel={null} />

  const size = sizes[sizeIdx]
  const sizedItem: FixedItem = {
    ...item,
    nutrition: size.nutrition,
    components: size.components,
    ingredients: size.ingredients ?? item.ingredients,
    sizes: undefined,
  }
  return (
    <div className="space-y-4">
      <section>
        <h3 className="mb-2 font-bold text-body">{item.sizeTitle ?? 'Size'}</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setSizeIdx(i)}
              className={
                'rounded-xl border px-3 py-2 text-left text-sm transition-colors ' +
                (i === sizeIdx
                  ? 'border-[var(--brand)] bg-emerald-500/10 font-semibold text-body'
                  : 'border-app bg-surface text-muted hover:bg-surface-2')
              }
            >
              {s.label}
              <span className="ml-1.5 text-xs text-muted">{formatNumber(s.nutrition.calories)} cal</span>
            </button>
          ))}
        </div>
      </section>
      <SizedCustomizer key={size.label} {...props} item={sizedItem} sizeLabel={size.label} />
    </div>
  )
}

function SizedCustomizer({
  item,
  goal,
  onAddToDay,
  onAddToCompare,
  sizeLabel,
}: Props & { sizeLabel: string | null }) {
  const components = useMemo(() => componentsFor(item), [item])
  const [selection, setSelection] = useState<ComponentSelection>(() =>
    defaultComponentSelection(components),
  )
  const [added, setAdded] = useState(false)

  const total = useMemo(
    () => totalForComponents(components, selection),
    [components, selection],
  )
  const fit = evaluateGoal(total, goal)

  const included = components.filter((c) => isComponentDefaultOn(c))
  const extras = components.filter((c) => !isComponentDefaultOn(c))

  function setCount(c: IngredientComponent, n: number) {
    setSelection((s) => ({ ...s, [c.id]: Math.max(0, Math.min(MAX_QUANTITY, n)) }))
  }

  const detail = useMemo(() => {
    const changed = components.flatMap((c) => {
      const n = selection[c.id] ?? 0
      const base = isComponentDefaultOn(c) ? 1 : 0
      const name = c.name.toLowerCase().replace(/^add /, '')
      if (n === base) return []
      if (n === 0) return [`no ${name}`]
      if (base === 0) return [n > 1 ? `+${n}× ${name}` : `+${name}`]
      return [`${n}× ${name}`]
    })
    return [...(sizeLabel ? [sizeLabel] : []), ...changed].join(', ')
  }, [components, selection, sizeLabel])

  function handleAddToDay() {
    onAddToDay(total, detail)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  const row = (c: IngredientComponent, extra: boolean) => {
    const n = selection[c.id] ?? 0
    const on = n > 0
    return (
      <div
        key={c.id}
        className={
          'flex items-center justify-between gap-2 rounded-xl border p-2 pl-3 transition-colors ' +
          (on ? 'border-[var(--brand)] bg-emerald-500/10' : 'border-app bg-surface')
        }
      >
        <button
          type="button"
          onClick={() => setCount(c, on ? 0 : 1)}
          className={'flex min-w-0 flex-1 items-center gap-2 text-left ' + (!on && !extra ? 'opacity-60' : '')}
        >
          <span
            className={
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ' +
              (on ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-app text-[var(--brand)]')
            }
          >
            {on ? <IconCheck size={13} /> : extra ? <IconPlus size={13} /> : null}
          </span>
          <span className="min-w-0">
            <span className={'block truncate font-medium ' + (on || extra ? 'text-body' : 'text-muted line-through')}>
              {c.name}
            </span>
            <span className="block text-xs text-muted">
              {formatNumber(c.nutrition.calories)} cal each
              {n > 1 && <span className="font-semibold text-body"> · {formatNumber(c.nutrition.calories * n)} cal</span>}
            </span>
          </span>
        </button>
        <QuantityStepper value={n} max={MAX_QUANTITY} label={c.name} onChange={(v) => setCount(c, v)} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5 pb-4">
        <section>
          <h3 className="mb-1 font-bold text-body">Customize ingredients</h3>
          <p className="mb-3 text-sm text-muted">
            Everything is optional — remove anything, or use + to add more of it. The total updates instantly.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{included.map((c) => row(c, false))}</div>
        </section>

        {extras.length > 0 && (
          <section>
            <h3 className="mb-1 font-bold text-body">Add extras</h3>
            <p className="mb-3 text-sm text-muted">Add as many as you like.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{extras.map((c) => row(c, true))}</div>
          </section>
        )}

        <p className="text-xs text-muted">
          Ingredient-level values are approximate splits of the published total.
        </p>
      </div>

      {/* Live total */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-muted">Your order</span>
          <GoalFitBadge fit={fit} />
        </div>
        <NutritionFacts nutrition={total} showDailyHints />
        <button
          onClick={handleAddToDay}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)]"
        >
          {added ? <IconCheck size={16} /> : <IconPlus size={16} />}
          {added ? 'Added to your day' : 'Add to my day'}
        </button>
        <button
          onClick={() => onAddToCompare(total, detail)}
          className="mt-2 w-full rounded-xl border border-app bg-surface px-3 py-2.5 text-sm font-semibold text-body hover:bg-surface-2"
        >
          Add to compare
        </button>
      </div>
    </div>
  )
}
