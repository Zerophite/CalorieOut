import { type Nutrition } from '../types'
import { DAILY_REFERENCE, formatNumber } from '../lib/nutrition'
import { MacroBar, MacroLegend } from './MacroBar'

interface Props {
  nutrition: Nutrition
  /** Show the % of daily reference hints under sodium/calories. */
  showDailyHints?: boolean
}

function Row({
  label,
  value,
  unit,
  hint,
  strong,
}: {
  label: string
  value: number
  unit: string
  hint?: string
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between py-1.5">
      <span className={strong ? 'font-semibold' : 'text-muted'}>{label}</span>
      <span className="text-right">
        <span className={strong ? 'text-lg font-bold' : 'font-medium'}>
          {formatNumber(value)}
          <span className="ml-0.5 text-xs text-muted">{unit}</span>
        </span>
        {hint && <span className="ml-2 text-xs text-muted">{hint}</span>}
      </span>
    </div>
  )
}

/** A full nutrition-facts style panel for one item or one build. */
export function NutritionFacts({ nutrition, showDailyHints }: Props) {
  const calPct = Math.round(
    (nutrition.calories / DAILY_REFERENCE.calories) * 100,
  )
  const sodiumPct = Math.round(
    (nutrition.sodium / DAILY_REFERENCE.sodium) * 100,
  )
  return (
    <div className="rounded-2xl border border-app bg-surface p-4">
      <div className="mb-3">
        <MacroBar nutrition={nutrition} />
        <div className="mt-2">
          <MacroLegend />
        </div>
      </div>
      <div className="divide-y divide-[var(--border)]">
        <Row
          label="Calories"
          value={nutrition.calories}
          unit="kcal"
          strong
          hint={showDailyHints ? `${calPct}% of 2,000` : undefined}
        />
        <Row label="Protein" value={nutrition.protein} unit="g" />
        <Row label="Carbs" value={nutrition.carbs} unit="g" />
        {nutrition.fiber !== undefined && nutrition.fiber > 0 && (
          <Row label="  Fibre" value={nutrition.fiber} unit="g" />
        )}
        {nutrition.sugar !== undefined && nutrition.sugar > 0 && (
          <Row label="  Sugars" value={nutrition.sugar} unit="g" />
        )}
        <Row label="Fat" value={nutrition.fat} unit="g" />
        <Row
          label="Sodium"
          value={nutrition.sodium}
          unit="mg"
          hint={showDailyHints ? `${sodiumPct}% max` : undefined}
        />
      </div>
    </div>
  )
}
