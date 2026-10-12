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
import { noodlebox } from './noodlebox'
import { redswan } from './redswan'
import { madradish } from './madradish'
// Coffee & bakery (official)
import { timhortons } from './timhortons'
import { starbucks } from './starbucks'
import { kettlemans } from './kettlemans'
// Sit-down (official)
import { swisschalet } from './swisschalet'
import { bostonpizza } from './bostonpizza'
import { osmows } from './osmows'
import { tahinis } from './tahinis'
import { theworks } from './theworks'
// Local / independent (estimated)
import { localSpots } from './local'

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
  noodlebox,
  redswan,
  madradish,
  // Coffee & bakery
  timhortons,
  starbucks,
  kettlemans,
  // Sit-down
  swisschalet,
  bostonpizza,
  osmows,
  tahinis,
  theworks,
  // Local / independent (estimated)
  ...localSpots,
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
