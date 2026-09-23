import { type MenuItem, type Restaurant } from '../types'

// ESTIMATED values. Ramen shops rarely publish nutrition data. Bowls are
// modelled from typical recipes — note ramen broth is very high in sodium.
function ramenMenu(prefix: string): MenuItem[] {
  return [
    { id: `${prefix}-tonkotsu`, name: 'Tonkotsu Ramen', kind: 'fixed', category: 'Mains', serving: '1 bowl', nutrition: { calories: 680, protein: 32, carbs: 66, fat: 30, sodium: 2300 } },
    { id: `${prefix}-shoyu`, name: 'Shoyu Ramen', kind: 'fixed', category: 'Mains', serving: '1 bowl', nutrition: { calories: 560, protein: 28, carbs: 68, fat: 18, sodium: 2400 } },
    { id: `${prefix}-miso`, name: 'Miso Ramen', kind: 'fixed', category: 'Mains', serving: '1 bowl', nutrition: { calories: 620, protein: 28, carbs: 68, fat: 24, sodium: 2350 } },
    { id: `${prefix}-spicy`, name: 'Spicy Tantanmen', kind: 'fixed', category: 'Mains', serving: '1 bowl', tags: ['spicy'], nutrition: { calories: 720, protein: 30, carbs: 66, fat: 36, sodium: 2500 } },
    { id: `${prefix}-gyoza`, name: 'Pork Gyoza (5 pc)', kind: 'fixed', category: 'Sides', serving: '5 pieces', nutrition: { calories: 290, protein: 12, carbs: 30, fat: 13, sodium: 620 } },
    { id: `${prefix}-karaage`, name: 'Chicken Karaage', kind: 'fixed', category: 'Sides', serving: '1 order', nutrition: { calories: 450, protein: 26, carbs: 22, fat: 28, sodium: 900 } },
  ]
}

export const ramenSpots: Restaurant[] = [
  { id: 'kinton-ramen', name: 'Kinton Ramen', cuisine: 'Japanese · Ramen', accent: '#dc2626', segment: 'Sit-Down', dataSource: 'estimated', items: ramenMenu('kt') },
  { id: 'sansotei-ramen', name: 'Sansotei Ramen', cuisine: 'Japanese · Ramen', accent: '#111827', segment: 'Sit-Down', dataSource: 'estimated', items: ramenMenu('st') },
  { id: 'koichi-ramen', name: 'Koichi Ramen', cuisine: 'Japanese · Ramen', accent: '#b91c1c', segment: 'Sit-Down', dataSource: 'estimated', items: ramenMenu('ko') },
  { id: 'kuma-takumi', name: 'Kuma Takumi', cuisine: 'Japanese · Ramen & Izakaya', accent: '#374151', segment: 'Sit-Down', dataSource: 'estimated', items: [
    ...ramenMenu('ku'),
    { id: 'ku-chashu-don', name: 'Chashu Don (rice bowl)', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 bowl', tags: ['high-protein'], nutrition: { calories: 620, protein: 30, carbs: 78, fat: 20, sodium: 1400 } },
  ] },
]
