import { type Nutrition } from '../types'
import { DAILY_REFERENCE, formatNumber } from '../lib/nutrition'
import { MacroBar, MacroLegend, MacroTiles, Ring } from './MacroBar'

interface Props {
  nutrition: Nutrition
  /** Show the % of daily reference hints for calories and sodium. */
  showDailyHints?: boolean
}

function Detail({ label, value, unit, meter }: { label: string; value: number; unit: string; meter?: number }) {
  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className="font-semibold text-body">
          {formatNumber(value)}
          <span className="ml-0.5 text-xs font-normal text-muted">{unit}</span>
          {meter !== undefined && (
            <span className="ml-2 text-xs font-normal text-muted">
              {meter}% of max{meter >= 50 ? ' · high' : ''}
            </span>
          )}
        </span>
      </div>
      {meter !== undefined && (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, meter)}%`,
              background: 'var(--text-muted)',
              transition: 'width 300ms ease',
            }}
          />
        </div>
      )}
    </div>
  )
}

/** The nutrition panel for one item or one build. */
export function NutritionFacts({ nutrition, showDailyHints }: Props) {
  const calPct = Math.round((nutrition.calories / DAILY_REFERENCE.calories) * 100)
  const sodiumPct = Math.round((nutrition.sodium / DAILY_REFERENCE.sodium) * 100)
  return (
    <div className="rounded-2xl border border-app bg-surface p-4">
      <div className="flex items-center gap-4">
        <Ring pct={calPct} color="var(--brand)" size={84} stroke={8} label={`${calPct}% of a 2,000-calorie day`}>
          <span className="text-xl font-black leading-none text-body">{formatNumber(nutrition.calories)}</span>
          <span className="text-[10px] font-medium text-muted">kcal</span>
        </Ring>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-body">Calories</div>
          {showDailyHints && <div className="text-sm text-muted">{calPct}% of a 2,000-cal day</div>}
          <div className="mt-2">
            <MacroLegend />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <MacroTiles nutrition={nutrition} />
      </div>

      <div className="mt-4">
        <MacroBar nutrition={nutrition} thick />
        <div className="mt-1.5 text-[11px] text-muted">Share of calories from protein, carbs and fat</div>
      </div>

      <div className="mt-2 divide-y divide-[var(--border)]">
        {nutrition.fiber !== undefined && nutrition.fiber > 0 && <Detail label="Fibre" value={nutrition.fiber} unit="g" />}
        {nutrition.sugar !== undefined && nutrition.sugar > 0 && <Detail label="Sugars" value={nutrition.sugar} unit="g" />}
        <Detail label="Sodium" value={nutrition.sodium} unit="mg" meter={showDailyHints ? sodiumPct : undefined} />
      </div>
    </div>
  )
}
