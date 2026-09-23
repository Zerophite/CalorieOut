import { type Restaurant } from '../types'
// Build-your-own (official)
import { barburrito } from './barburrito'
import { subway } from './subway'
import { freshii } from './freshii'
import { muchoburrito } from './muchoburrito'
import { pitapit } from './pitapit'
// Fast food (official)
import { mcdonalds } from './mcdonalds'
import { aw } from './aw'
import { harveys } from './harveys'
import { wendys } from './wendys'
import { kfc } from './kfc'
import { burgerking } from './burgerking'
import { tacobell } from './tacobell'
import { pizzahut } from './pizzahut'
import { littlecaesars } from './littlecaesars'
import { dairyqueen } from './dairyqueen'
import { marybrowns } from './marybrowns'
import { thaiexpress } from './thaiexpress'
import { manchuwok } from './manchuwok'
import { firehousesubs } from './firehousesubs'
// Coffee & bakery (official)
import { timhortons } from './timhortons'
import { starbucks } from './starbucks'
// Sit-down (official)
import { swisschalet } from './swisschalet'
import { bostonpizza } from './bostonpizza'
// Local / independent (estimated)
import { shawarmaSpots } from './shawarma'
import { ramenSpots } from './ramen'
import { sushiSpots } from './sushi'
import { bubbleTeaSpots } from './bubbletea'
import { bakerySpots } from './bakery'
import { pizzaLocalSpots } from './pizzalocal'
import { casualSpots } from './casual'

// All seeded restaurants. "Official" figures come from published Canadian
// nutrition guides; "estimated" figures (dataSource: 'estimated') are modelled
// from typical recipes for spots that publish nothing. Always verify.
export const restaurants: Restaurant[] = [
  // Builders first — the flagship experience
  barburrito,
  subway,
  freshii,
  muchoburrito,
  pitapit,
  // Fast food
  mcdonalds,
  aw,
  harveys,
  wendys,
  kfc,
  burgerking,
  tacobell,
  pizzahut,
  littlecaesars,
  dairyqueen,
  marybrowns,
  thaiexpress,
  manchuwok,
  firehousesubs,
  // Coffee & bakery
  timhortons,
  starbucks,
  // Sit-down
  swisschalet,
  bostonpizza,
  // Local / independent (estimated)
  ...shawarmaSpots,
  ...ramenSpots,
  ...sushiSpots,
  ...bubbleTeaSpots,
  ...bakerySpots,
  ...pizzaLocalSpots,
  ...casualSpots,
]

export function getRestaurant(id: string): Restaurant | undefined {
  return restaurants.find((r) => r.id === id)
}

export const SEGMENTS = [
  'Fast Food',
  'Coffee & Bakery',
  'Build-Your-Own',
  'Sit-Down',
] as const
