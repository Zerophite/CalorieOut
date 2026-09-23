// ---------------------------------------------------------------------------
// Core nutrition & restaurant data model for CalorieOut.
//
// The model supports two kinds of menus with one shared vocabulary:
//   1. "fixed"   — items with a set nutrition profile (e.g. a Big Mac).
//   2. "builder" — meals assembled from option groups (e.g. a burrito bowl),
//                  where nutrition is the sum of the chosen options.
// ---------------------------------------------------------------------------

/** The nutrition figures we track for every item and option. */
export interface Nutrition {
  /** Calories (kcal). */
  calories: number
  /** Protein in grams. */
  protein: number
  /** Total carbohydrates in grams. */
  carbs: number
  /** Total fat in grams. */
  fat: number
  /** Sodium in milligrams. */
  sodium: number
  /** Dietary fibre in grams (optional — not always published). */
  fiber?: number
  /** Total sugars in grams (optional). */
  sugar?: number
}

/** A zeroed nutrition object — handy as an accumulator seed. */
export const ZERO_NUTRITION: Nutrition = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  sodium: 0,
  fiber: 0,
  sugar: 0,
}

export type DietTag =
  | 'vegetarian'
  | 'vegan'
  | 'high-protein'
  | 'low-carb'
  | 'gluten-free-option'
  | 'spicy'

export type MealCategory =
  | 'Burgers'
  | 'Sandwiches'
  | 'Chicken'
  | 'Bowls & Burritos'
  | 'Sides'
  | 'Breakfast'
  | 'Salads'
  | 'Pizza'
  | 'Drinks'
  | 'Coffee'
  | 'Bakery'
  | 'Desserts'
  | 'Mains'
  | 'Wraps'

/** A single selectable option inside a builder group (e.g. "Brown rice"). */
export interface BuilderOption {
  id: string
  name: string
  nutrition: Nutrition
  /** Optional note, e.g. "per scoop" or "regular portion". */
  note?: string
  /** Marks the healthiest / recommended default in its group. */
  recommended?: boolean
  tags?: DietTag[]
}

/** A group of options within a builder (e.g. "Choose your base"). */
export interface BuilderGroup {
  id: string
  name: string
  /** Minimum selections required (0 = optional). */
  min: number
  /** Maximum selections allowed (undefined = unlimited). */
  max?: number
  options: BuilderOption[]
}

/** Shared fields for both fixed and builder items. */
interface MenuItemBase {
  id: string
  name: string
  category: MealCategory
  description?: string
  tags?: DietTag[]
}

/** A fixed item with a single known nutrition profile. */
export interface FixedItem extends MenuItemBase {
  kind: 'fixed'
  nutrition: Nutrition
  /** Serving description, e.g. "1 sandwich" or "medium (400 mL)". */
  serving?: string
}

/** A build-your-own item assembled from option groups. */
export interface BuilderItem extends MenuItemBase {
  kind: 'builder'
  groups: BuilderGroup[]
}

export type MenuItem = FixedItem | BuilderItem

export interface Restaurant {
  id: string
  name: string
  /** Short cuisine / category label shown on the card. */
  cuisine: string
  /** Two-letter emoji or brand accent color used for the logo tile. */
  accent: string
  /** Broad grouping used for the home-page filters. */
  segment: 'Fast Food' | 'Coffee & Bakery' | 'Build-Your-Own' | 'Sit-Down'
  /**
   * Where the numbers come from:
   *  'official'  — published by the chain (default when omitted).
   *  'estimated' — modelled from generic references for the dish type,
   *                because this place publishes no nutrition data.
   */
  dataSource?: 'official' | 'estimated'
  items: MenuItem[]
}
