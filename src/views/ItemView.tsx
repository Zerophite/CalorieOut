import { type MenuItem, type Nutrition, type Restaurant } from '../types'
import { type Goal } from '../hooks/useGoal'
import { BuilderView } from '../components/BuilderView'
import { FixedCustomizer } from '../components/FixedCustomizer'
import { EstimateBanner, ItemPhoto, TagChip } from '../components/ui'

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

export function ItemView({ restaurant, item, goal, toggleCompare, addToDay }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {item.image && (
        <div className="mb-4">
          <ItemPhoto src={item.image} alt={item.name} variant="hero" />
        </div>
      )}
      <div className="mb-1 text-sm font-medium text-muted">{restaurant.name}</div>
      <h1 className="text-2xl font-black text-body">{item.name}</h1>
      {item.kind === 'fixed' && item.serving && (
        <div className="mt-0.5 text-sm text-muted">{item.serving}</div>
      )}
      {item.description && <p className="mt-1 max-w-2xl text-muted">{item.description}</p>}
      {item.tags && item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
            onAddToCompare={(nutrition, detail) => toggleCompare(restaurant, item, nutrition, detail)}
            onAddToDay={(nutrition, detail) => addToDay(restaurant, item, nutrition, detail)}
          />
        ) : (
          <FixedCustomizer
            key={item.id}
            item={item}
            goal={goal}
            onAddToDay={(nutrition, detail) => addToDay(restaurant, item, nutrition, detail)}
            onAddToCompare={(nutrition, detail) => toggleCompare(restaurant, item, nutrition, detail)}
          />
        )}
      </div>
    </div>
  )
}
