import {
  type FixedItem,
  type IngredientComponent,
  type Nutrition,
} from '../types'
import { buildComponents, type PartSpec } from './components'

// ---------------------------------------------------------------------------
// Recipe templates: give EVERY fixed menu item a customizable breakdown.
//
// Restaurants publish an item's total, not its per-ingredient split, so each
// item is matched to a recipe archetype (burger, latte, bubble tea, ramen…).
// Each archetype lists:
//   • default ingredients — a share of the item's calories plus a macro
//     profile (bread is carb-heavy, sauce fat-heavy…), one of which is the
//     "core" that absorbs the remainder so the parts sum EXACTLY to the
//     published total;
//   • extras — optional add-ons the user can switch on.
// Items that already define real `components` keep them and just gain the
// archetype's extras.
// ---------------------------------------------------------------------------

/** Share of calories from protein / carbs / fat, plus sodium (mg) per kcal. */
interface Profile {
  p: number
  c: number
  f: number
  na: number
}

const PR = {
  bread: { p: 0.14, c: 0.72, f: 0.14, na: 1.8 },
  tortilla: { p: 0.11, c: 0.64, f: 0.25, na: 2.2 },
  shell: { p: 0.06, c: 0.52, f: 0.42, na: 1.2 },
  cheese: { p: 0.25, c: 0.03, f: 0.72, na: 4.5 },
  creamCheese: { p: 0.07, c: 0.06, f: 0.87, na: 1.6 },
  mayo: { p: 0, c: 0.04, f: 0.96, na: 1.0 },
  sweetSauce: { p: 0, c: 0.95, f: 0.05, na: 6 },
  savoury: { p: 0.04, c: 0.4, f: 0.56, na: 5 },
  tomatoSauce: { p: 0.15, c: 0.45, f: 0.4, na: 4 },
  veg: { p: 0.1, c: 0.85, f: 0.05, na: 3 },
  bacon: { p: 0.3, c: 0, f: 0.7, na: 3 },
  meat: { p: 0.38, c: 0, f: 0.62, na: 1.4 },
  chicken: { p: 0.45, c: 0.15, f: 0.4, na: 2.5 },
  leanProtein: { p: 0.8, c: 0.05, f: 0.15, na: 1.5 },
  rice: { p: 0.08, c: 0.88, f: 0.04, na: 0.3 },
  noodle: { p: 0.14, c: 0.78, f: 0.08, na: 0.8 },
  fries: { p: 0.05, c: 0.52, f: 0.43, na: 1 },
  starch: { p: 0.08, c: 0.7, f: 0.22, na: 1.2 },
  gravy: { p: 0.1, c: 0.5, f: 0.4, na: 10 },
  milk: { p: 0.27, c: 0.38, f: 0.35, na: 0.8 },
  cream: { p: 0.03, c: 0.06, f: 0.91, na: 0.3 },
  sourCream: { p: 0.05, c: 0.1, f: 0.85, na: 0.5 },
  sugar: { p: 0, c: 1, f: 0, na: 0 },
  whip: { p: 0.03, c: 0.22, f: 0.75, na: 0.2 },
  glaze: { p: 0, c: 0.92, f: 0.08, na: 0.3 },
  dough: { p: 0.07, c: 0.48, f: 0.45, na: 1.2 },
  mixin: { p: 0.05, c: 0.6, f: 0.35, na: 1 },
  iceCream: { p: 0.07, c: 0.45, f: 0.48, na: 0.4 },
  dressing: { p: 0.01, c: 0.1, f: 0.89, na: 2.5 },
  egg: { p: 0.34, c: 0.02, f: 0.64, na: 1 },
  guac: { p: 0.05, c: 0.18, f: 0.77, na: 1.6 },
  tapioca: { p: 0, c: 1, f: 0, na: 0.1 },
  broth: { p: 0.2, c: 0.15, f: 0.65, na: 6 },
  beans: { p: 0.25, c: 0.7, f: 0.05, na: 2.5 },
  nuts: { p: 0.14, c: 0.14, f: 0.72, na: 0.1 },
  generic: { p: 0.15, c: 0.45, f: 0.4, na: 2 },
  zero: { p: 0, c: 0, f: 0, na: 0 },
} satisfies Record<string, Profile>

/** Nutrition for `cal` calories of a given profile. */
function nut(cal: number, pr: Profile): Nutrition {
  const c = Math.max(0, Math.round(cal))
  return {
    calories: c,
    protein: Math.round((c * pr.p) / 4),
    carbs: Math.round((c * pr.c) / 4),
    fat: Math.round((c * pr.f) / 9),
    sodium: Math.round(c * pr.na),
  }
}

function scale(n: Nutrition, k: number): Nutrition {
  return {
    calories: Math.round(n.calories * k),
    protein: Math.round(n.protein * k),
    carbs: Math.round(n.carbs * k),
    fat: Math.round(n.fat * k),
    sodium: Math.round(n.sodium * k),
  }
}

/** A default ingredient: a calorie share with a profile, or the core. */
interface Ing {
  id: string
  name: string
  share?: number
  pr?: Profile
  n?: Nutrition
  core?: boolean
  locked?: boolean
}

/** An optional add-on. */
interface Extra {
  id: string
  name: string
  cal?: number
  pr?: Profile
  n?: Nutrition
}

interface Recipe {
  ings: Ing[]
  extras: Extra[]
}

// --- Common extras ---------------------------------------------------------
const X = {
  cheese: { id: 'x-cheese', name: 'Add cheese', cal: 50, pr: PR.cheese },
  bacon: { id: 'x-bacon', name: 'Add bacon', cal: 70, pr: PR.bacon },
  sauce: { id: 'x-sauce', name: 'Extra sauce', cal: 90, pr: PR.mayo },
  patty: { id: 'x-patty', name: 'Extra patty', cal: 200, pr: PR.meat },
  avocado: { id: 'x-avocado', name: 'Add avocado', cal: 60, pr: PR.guac },
  guac: { id: 'x-guac', name: 'Add guacamole', cal: 150, pr: PR.guac },
  sourCream: { id: 'x-sour', name: 'Add sour cream', cal: 60, pr: PR.sourCream },
  chicken: { id: 'x-chicken', name: 'Add grilled chicken', cal: 150, pr: PR.leanProtein },
  protein: { id: 'x-protein', name: 'Extra protein', cal: 150, pr: PR.chicken },
  egg: { id: 'x-egg', name: 'Add egg', cal: 80, pr: PR.egg },
  gravy: { id: 'x-gravy', name: 'Add gravy', cal: 60, pr: PR.gravy },
  dip: { id: 'x-dip', name: 'Dipping sauce', cal: 90, pr: PR.mayo },
  whip: { id: 'x-whip', name: 'Add whipped cream', cal: 80, pr: PR.whip },
  syrup: { id: 'x-syrup', name: 'Extra flavour syrup', cal: 80, pr: PR.sugar },
  shot: { id: 'x-shot', name: 'Extra espresso shot', cal: 5, pr: PR.generic },
  jalapeno: { id: 'x-jalapeno', name: 'Add jalapeños', cal: 5, pr: PR.veg },
} satisfies Record<string, Extra>

const upsize = (t: Nutrition): Extra => ({
  id: 'x-upsize',
  name: 'Upsize (+40%)',
  n: scale(t, 0.4),
})

// --- Helpers ---------------------------------------------------------------
function words(item: FixedItem) {
  const nm = `${item.name} ${item.serving ?? ''}`.toLowerCase()
  return (...w: string[]) => w.some((x) => nm.includes(x))
}

function proteinName(has: ReturnType<typeof words>, fallback: string): string {
  if (has('chicken', 'taouk', 'popcorn')) return 'Chicken'
  if (has('steak', 'philly')) return 'Steak'
  if (has('beef', 'bolognese', 'meat sauce', 'chashu', 'pork', 'bacon king'))
    return has('pork', 'chashu') ? 'Pork' : 'Beef'
  if (has('lamb')) return 'Lamb'
  if (has('salmon')) return 'Salmon'
  if (has('tuna')) return 'Tuna'
  if (has('shrimp')) return 'Shrimp'
  if (has('fish', 'halibut', 'filet')) return 'Fish'
  if (has('falafel')) return 'Falafel'
  if (has('tofu')) return 'Tofu'
  if (has('turkey')) return 'Turkey'
  if (has('ham')) return 'Ham'
  if (has('sausage')) return 'Sausage'
  if (has('meatball')) return 'Meatballs'
  if (has('beyond', 'impossible', 'plant', 'veggie')) return 'Plant-based patty'
  return fallback
}

// --- Archetype recipes -----------------------------------------------------
function burger(item: FixedItem): Recipe {
  const has = words(item)
  const plant = has('beyond', 'impossible', 'plant', 'veggie')
  const withCheese = has('cheese', 'mac', 'baconator', 'papa', 'teen', 'king')
  const withBacon = has('bacon', 'baconator', 'teen')
  const ings: Ing[] = [
    { id: 'bun', name: 'Bun', share: 0.33, pr: PR.bread, locked: true },
    {
      id: 'patty',
      name: plant ? 'Plant-based patty' : has('fish', 'filet') ? 'Fish fillet' : 'Beef patty',
      core: true,
    },
  ]
  if (withCheese) ings.push({ id: 'cheese', name: 'Cheese', share: 0.09, pr: PR.cheese })
  if (withBacon) ings.push({ id: 'bacon', name: 'Bacon', share: 0.1, pr: PR.bacon })
  ings.push(
    { id: 'sauce', name: 'Sauce & condiments', share: 0.11, pr: PR.mayo },
    { id: 'veg', name: 'Lettuce, tomato, onion & pickles', share: 0.03, pr: PR.veg },
  )
  const extras: Extra[] = []
  if (!withCheese) extras.push(X.cheese)
  if (!withBacon) extras.push(X.bacon)
  extras.push(X.patty, X.sauce, X.jalapeno)
  return { ings, extras }
}

function chickenSandwich(item: FixedItem): Recipe {
  const has = words(item)
  const grilled = has('grilled')
  return {
    ings: [
      { id: 'bun', name: has('wrap') ? 'Tortilla' : 'Bun', share: 0.36, pr: PR.bread, locked: true },
      { id: 'chicken', name: grilled ? 'Grilled chicken breast' : 'Crispy chicken fillet', core: true },
      { id: 'sauce', name: 'Sauce', share: 0.12, pr: PR.mayo },
      { id: 'veg', name: 'Lettuce & tomato', share: 0.02, pr: PR.veg },
    ],
    extras: [X.cheese, X.bacon, X.sauce, { id: 'x-pickles', name: 'Add pickles', cal: 5, pr: PR.veg }],
  }
}

function chickenPieces(item: FixedItem): Recipe {
  const has = words(item)
  const wings = has('wing')
  const ings: Ing[] = [{ id: 'chicken', name: wings ? 'Wings' : 'Chicken', core: true }]
  if (wings && !has('plain', 'dusted', 'naked'))
    ings.push({ id: 'sauce', name: 'Wing sauce', share: 0.08, pr: PR.savoury })
  return {
    ings,
    extras: wings
      ? [
          { id: 'x-bluecheese', name: 'Blue cheese dip', cal: 150, pr: PR.dressing },
          { id: 'x-ranch', name: 'Ranch dip', cal: 110, pr: PR.dressing },
          { id: 'x-veg', name: 'Celery & carrots', cal: 20, pr: PR.veg },
          { id: 'x-extra-sauce', name: 'Extra wing sauce', cal: 40, pr: PR.savoury },
        ]
      : [
          { id: 'x-bbq', name: 'BBQ dip', cal: 45, pr: PR.sweetSauce },
          { id: 'x-honey-mustard', name: 'Honey mustard dip', cal: 90, pr: PR.savoury },
          { id: 'x-ranch', name: 'Ranch dip', cal: 110, pr: PR.dressing },
          { id: 'x-sweet-sour', name: 'Sweet & sour dip', cal: 50, pr: PR.sweetSauce },
          { id: 'x-gravy', name: 'Gravy', cal: 30, pr: PR.gravy },
        ],
  }
}

function sandwich(item: FixedItem): Recipe {
  const has = words(item)
  const hotdog = has('hot dog', 'hotdog')
  const deli = has('smoked meat', 'reuben', 'lox')
  const ings: Ing[] = [
    {
      id: 'bread',
      name: hotdog ? 'Hot dog bun' : has('sub', 'medium') ? 'Sub roll' : deli ? 'Rye bread' : 'Bread',
      share: 0.37,
      pr: PR.bread,
      locked: true,
    },
    { id: 'filling', name: hotdog ? 'Sausage' : proteinName(has, 'Filling'), core: true },
  ]
  if (!hotdog && !has('smoked meat')) ings.push({ id: 'cheese', name: 'Cheese', share: 0.08, pr: PR.cheese })
  ings.push({
    id: 'sauce',
    name: hotdog ? 'Ketchup, mustard & relish' : 'Sauce',
    share: 0.09,
    pr: hotdog ? PR.sweetSauce : PR.mayo,
  })
  if (!hotdog && !deli) ings.push({ id: 'veg', name: 'Lettuce, tomato & onion', share: 0.03, pr: PR.veg })
  return {
    ings,
    extras: [
      { id: 'x-meat', name: 'Extra meat', cal: 120, pr: PR.meat },
      { id: 'x-cheese', name: 'Extra cheese', cal: 60, pr: PR.cheese },
      X.bacon,
      X.avocado,
      X.sauce,
    ],
  }
}

function wrap(item: FixedItem): Recipe {
  const has = words(item)
  const crunchy = has('crunchy taco', 'taco shell', 'hard taco')
  const quesadilla = has('quesadilla')
  const ings: Ing[] = [
    { id: 'tortilla', name: crunchy ? 'Taco shell' : 'Tortilla', share: 0.36, pr: crunchy ? PR.shell : PR.tortilla, locked: true },
    { id: 'filling', name: proteinName(has, has('bean') ? 'Beans' : 'Filling'), core: true },
    { id: 'cheese', name: 'Cheese', share: quesadilla ? 0.3 : 0.09, pr: PR.cheese },
    { id: 'sauce', name: 'Sauce', share: 0.09, pr: PR.savoury },
  ]
  if (!quesadilla) ings.push({ id: 'veg', name: 'Lettuce, tomato & salsa', share: 0.04, pr: PR.veg })
  return { ings, extras: [X.guac, X.sourCream, { ...X.cheese, name: 'Extra cheese', cal: 90 }, X.protein, X.jalapeno] }
}

function bowl(item: FixedItem): Recipe {
  const has = words(item)
  return {
    ings: [
      { id: 'base', name: has('noodle') ? 'Noodles' : has('salad') ? 'Greens' : 'Rice', share: 0.32, pr: PR.rice, locked: true },
      { id: 'protein', name: proteinName(has, 'Protein'), core: true },
      { id: 'toppings', name: 'Beans & toppings', share: 0.1, pr: PR.beans },
      { id: 'sauce', name: 'Sauce / dressing', share: 0.12, pr: PR.savoury },
      { id: 'veg', name: 'Veggies', share: 0.04, pr: PR.veg },
    ],
    extras: [X.guac, X.protein, { ...X.cheese, cal: 90 }, X.sourCream, X.avocado],
  }
}

function salad(item: FixedItem): Recipe {
  const has = words(item)
  const noDressing = has('no dressing')
  const hasProtein = has('chicken', 'salmon', 'shrimp', 'steak', 'cobb', 'tuna', 'halloumi')
  const ings: Ing[] = [{ id: 'greens', name: 'Greens & veggies', share: 0.08, pr: PR.veg, locked: true }]
  if (hasProtein) ings.push({ id: 'protein', name: proteinName(has, 'Protein'), core: true })
  ings.push({
    id: 'toppings',
    name: has('caesar') ? 'Croutons & parmesan' : has('greek', 'feta') ? 'Feta & olives' : 'Toppings',
    ...(hasProtein ? { share: 0.15, pr: PR.mixin } : { core: true }),
  })
  if (!noDressing) ings.push({ id: 'dressing', name: 'Dressing', share: 0.3, pr: PR.dressing })
  const extras: Extra[] = []
  if (noDressing) extras.push({ id: 'x-dressing', name: 'Add dressing', cal: 120, pr: PR.dressing })
  else extras.push({ id: 'x-dressing', name: 'Extra dressing', cal: 120, pr: PR.dressing })
  if (!hasProtein) extras.push(X.chicken)
  extras.push(X.bacon, X.avocado)
  return { ings, extras }
}

function pizza(item: FixedItem): Recipe {
  const has = words(item)
  const plainCheese = has('cheese') && !has('pepperoni', 'deluxe', 'supreme', 'hawaiian', 'works', 'veggie', 'canadiana')
  const ings: Ing[] = [
    { id: 'crust', name: 'Crust', share: 0.42, pr: PR.bread, locked: true },
    { id: 'sauce', name: 'Tomato sauce', share: 0.05, pr: PR.sweetSauce },
  ]
  if (plainCheese) ings.push({ id: 'cheese', name: 'Mozzarella', core: true })
  else
    ings.push(
      { id: 'cheese', name: 'Mozzarella', share: 0.28, pr: PR.cheese },
      { id: 'toppings', name: 'Toppings', core: true },
    )
  return {
    ings,
    extras: [
      { id: 'x-cheese', name: 'Extra cheese', cal: 60, pr: PR.cheese },
      { id: 'x-pepperoni', name: 'Add pepperoni', cal: 70, pr: PR.meat },
      { id: 'x-veg', name: 'Add veggies', cal: 15, pr: PR.veg },
      X.bacon,
      { id: 'x-garlic-dip', name: 'Garlic dip', cal: 150, pr: PR.mayo },
    ],
  }
}

function poutine(item: FixedItem): Recipe {
  const has = words(item)
  const ings: Ing[] = [
    { id: 'fries', name: 'Fries', core: true },
    { id: 'gravy', name: 'Gravy', share: 0.15, pr: PR.gravy },
    { id: 'curds', name: 'Cheese curds', share: 0.28, pr: PR.cheese },
  ]
  if (has('chicken', 'shawarma', 'butter chicken'))
    ings.push({ id: 'topping', name: 'Chicken', share: 0.18, pr: PR.chicken })
  else if (has('smoked meat', 'gyro', 'beef', 'brisket', 'bacon'))
    ings.push({ id: 'topping', name: proteinName(has, 'Meat topping'), share: 0.18, pr: PR.meat })
  return {
    ings,
    extras: [X.bacon, { ...X.chicken, name: 'Add chicken', cal: 170 }, { ...X.gravy, name: 'Extra gravy' }, { id: 'x-curds', name: 'Extra cheese curds', cal: 110, pr: PR.cheese }],
  }
}

function fries(item: FixedItem): Recipe {
  const has = words(item)
  const t = item.nutrition
  const ings: Ing[] = [
    { id: 'base', name: has('ring') ? 'Onion rings' : has('tater') ? 'Taters' : has('chip') ? 'Chips' : 'Fries', core: true },
  ]
  if (t.sodium > 60)
    ings.push({ id: 'salt', name: 'Salt', n: { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: Math.round(t.sodium * 0.55) } })
  return {
    ings,
    extras: [X.gravy, { id: 'x-cheese-sauce', name: 'Add cheese sauce', cal: 80, pr: PR.cheese }, { id: 'x-ketchup', name: 'Ketchup', cal: 20, pr: PR.sweetSauce }, X.dip, upsize(t)],
  }
}

function side(item: FixedItem): Recipe {
  const has = words(item)
  if (has('nacho'))
    return {
      ings: [
        { id: 'chips', name: 'Tortilla chips', core: true },
        { id: 'cheese', name: 'Cheese', share: 0.3, pr: PR.cheese },
        { id: 'veg', name: 'Tomato, peppers & onion', share: 0.08, pr: PR.veg },
        { id: 'sour', name: 'Sour cream', share: 0.06, pr: PR.sourCream },
      ],
      extras: [X.guac, { ...X.cheese, name: 'Extra cheese', cal: 90 }, { id: 'x-beef', name: 'Add seasoned beef', cal: 120, pr: PR.meat }, X.jalapeno],
    }
  if (has('hummus'))
    return {
      ings: [
        { id: 'hummus', name: 'Hummus', core: true },
        { id: 'pita', name: 'Pita', share: 0.45, pr: PR.bread },
      ],
      extras: [{ id: 'x-pita', name: 'Extra pita', cal: 170, pr: PR.bread }, { id: 'x-oil', name: 'Olive oil drizzle', cal: 120, pr: PR.cream }],
    }
  if (has('garlic bread', 'breadstick', 'garlic stick', 'crazy bread', 'cornbread'))
    return {
      ings: [
        { id: 'bread', name: 'Bread', core: true },
        { id: 'butter', name: 'Garlic butter', share: 0.28, pr: PR.cream },
      ],
      extras: [{ id: 'x-marinara', name: 'Marinara dip', cal: 40, pr: PR.tomatoSauce }, { ...X.cheese, name: 'Add cheese', cal: 60 }],
    }
  if (has('coleslaw', 'slaw'))
    return {
      ings: [
        { id: 'cabbage', name: 'Cabbage & carrots', core: true },
        { id: 'dressing', name: 'Dressing', share: 0.7, pr: PR.dressing },
      ],
      extras: [upsize(item.nutrition)],
    }
  if (has('chili'))
    return {
      ings: [{ id: 'chili', name: 'Chili', core: true }],
      extras: [{ ...X.cheese, cal: 90 }, X.sourCream, { id: 'x-crackers', name: 'Add crackers', cal: 60, pr: PR.bread }, { id: 'x-onion', name: 'Add onions', cal: 10, pr: PR.veg }],
    }
  if (has('edamame'))
    return {
      ings: [
        { id: 'edamame', name: 'Edamame', core: true },
        { id: 'salt', name: 'Salt', n: { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: Math.round(item.nutrition.sodium * 0.6) } },
      ],
      extras: [{ id: 'x-spicy', name: 'Spicy garlic seasoning', cal: 30, pr: PR.savoury }],
    }
  if (has('miso', 'soup'))
    return soup(item)
  if (has('gyoza', 'dumpling', 'spring roll', 'egg roll', 'samosa', 'karaage', 'tender', 'popcorn'))
    return {
      ings: [
        { id: 'base', name: item.name.replace(/\s*\(.*\)/, ''), core: true },
        { id: 'dip', name: 'Dipping sauce', share: 0.08, pr: PR.sweetSauce },
      ],
      extras: [{ id: 'x-dip', name: 'Extra dipping sauce', cal: 40, pr: PR.sweetSauce }, upsize(item.nutrition)],
    }
  return {
    ings: [{ id: 'base', name: item.name.replace(/\s*\(.*\)/, ''), core: true }],
    extras: [X.dip, upsize(item.nutrition)],
  }
}

function breakfastSandwich(item: FixedItem): Recipe {
  const has = words(item)
  const ings: Ing[] = [
    {
      id: 'bread',
      name: has('biscuit') ? 'Biscuit' : has('bagel') ? 'Bagel' : has('wrap') ? 'Tortilla wrap' : has('muffin', 'egger') ? 'English muffin' : 'Bread',
      share: 0.38,
      pr: has('biscuit') ? PR.dough : PR.bread,
      locked: true,
    },
    { id: 'egg', name: 'Egg', core: true },
  ]
  if (has('bacon', 'sausage', 'ham', 'mcmuffin', 'egger', 'belt'))
    ings.push({ id: 'meat', name: has('sausage') ? 'Sausage' : has('mcmuffin', 'ham') ? 'Canadian bacon' : 'Bacon', share: 0.2, pr: PR.bacon })
  ings.push({ id: 'cheese', name: 'Cheese', share: 0.12, pr: PR.cheese })
  return {
    ings,
    extras: [{ ...X.egg, name: 'Extra egg', cal: 70 }, X.cheese, X.bacon, { id: 'x-sausage', name: 'Add sausage', cal: 190, pr: PR.meat }, { id: 'x-hashbrown', name: 'Add hash brown', cal: 150, pr: PR.fries }],
  }
}

function breakfastPlate(item: FixedItem): Recipe {
  const has = words(item)
  if (has('egg bite'))
    return {
      ings: [
        { id: 'egg', name: 'Egg', core: true },
        { id: 'cheese', name: has('gruy') ? 'Gruyère' : 'Cheese', share: 0.25, pr: PR.cheese },
        ...(has('bacon') ? [{ id: 'bacon', name: 'Bacon', share: 0.2, pr: PR.bacon } as Ing] : []),
      ],
      extras: [{ id: 'x-toast', name: 'Add toast', cal: 150, pr: PR.bread }, { id: 'x-fruit', name: 'Add fruit cup', cal: 60, pr: PR.veg }],
    }
  if (has('oatmeal', 'porridge'))
    return {
      ings: [
        { id: 'oats', name: 'Oatmeal', core: true },
        { id: 'sugar', name: 'Brown sugar', share: 0.2, pr: PR.sugar },
        { id: 'fruit', name: 'Fruit', share: 0.12, pr: PR.veg },
      ],
      extras: [{ id: 'x-nuts', name: 'Add nuts', cal: 90, pr: PR.nuts }, { id: 'x-milk', name: 'Add milk', cal: 40, pr: PR.milk }],
    }
  return {
    ings: [
      { id: 'base', name: has('waffle') ? 'Waffles' : has('hash') ? 'Hash browns' : 'Hotcakes', core: true },
      { id: 'syrup', name: 'Syrup', share: 0.3, pr: PR.sugar },
      { id: 'butter', name: 'Butter', share: 0.1, pr: PR.cream },
    ],
    extras: [{ id: 'x-syrup', name: 'Extra syrup', cal: 100, pr: PR.sugar }, { id: 'x-sausage', name: 'Add sausage', cal: 190, pr: PR.meat }, { ...X.egg, cal: 90 }],
  }
}

function blended(item: FixedItem): Recipe {
  const has = words(item)
  if (has('smoothie'))
    return {
      ings: [
        { id: 'base', name: 'Fruit & yogurt blend', core: true },
        { id: 'sweetener', name: 'Sweetener', share: 0.25, pr: PR.sugar },
      ],
      extras: [{ id: 'x-protein', name: 'Add protein boost', cal: 100, pr: PR.leanProtein }, { id: 'x-fruit', name: 'Extra fruit', cal: 40, pr: PR.veg }, upsize(item.nutrition)],
    }
  return {
    ings: [
      { id: 'base', name: has('frappuccino', 'capp') ? 'Coffee & milk base' : 'Ice cream & milk', core: true },
      { id: 'syrup', name: 'Flavour syrup', share: 0.18, pr: PR.sugar },
      { id: 'whip', name: 'Whipped cream', share: 0.14, pr: PR.whip },
    ],
    extras: [{ ...X.whip, name: 'Extra whipped cream' }, X.syrup, X.shot, { id: 'x-drizzle', name: 'Add drizzle', cal: 40, pr: PR.sugar }, upsize(item.nutrition)],
  }
}

function milkTea(item: FixedItem): Recipe {
  const has = words(item)
  const fruit = has('fruit', 'refresher', 'lemonade')
  const pearls = has('pearl', 'tapioca', 'boba', 'brown sugar', 'classic')
  const ings: Ing[] = [
    { id: 'base', name: fruit ? 'Tea & fruit' : 'Tea & milk', core: true },
    { id: 'sugar', name: 'Sugar (choose less)', share: fruit ? 0.5 : 0.35, pr: PR.sugar },
  ]
  if (pearls) ings.push({ id: 'pearls', name: 'Tapioca pearls', share: 0.25, pr: PR.tapioca })
  return {
    ings,
    extras: [
      ...(pearls ? [] : [{ id: 'x-pearls', name: 'Add tapioca pearls', cal: 120, pr: PR.tapioca }]),
      { id: 'x-jelly', name: 'Add jelly', cal: 70, pr: PR.sugar },
      { id: 'x-pudding', name: 'Add pudding', cal: 110, pr: PR.milk },
      { id: 'x-foam', name: 'Add cheese foam', cal: 120, pr: PR.cream },
      upsize(item.nutrition),
    ],
  }
}

function softDrink(item: FixedItem): Recipe {
  const has = words(item)
  const t = item.nutrition
  if (t.calories < 15)
    return {
      ings: [{ id: 'base', name: 'Drink', core: true }],
      extras: [{ id: 'x-flavour', name: 'Add flavour shot', cal: 20, pr: PR.sugar }, upsize(t)],
    }
  if (has('juice', 'milk'))
    return { ings: [{ id: 'base', name: has('milk') ? 'Milk' : 'Juice', core: true }], extras: [upsize(t)] }
  return {
    ings: [
      { id: 'base', name: 'Water & flavour', core: true },
      { id: 'sugar', name: 'Sugar (switch to diet / no sugar)', share: 0.97, pr: PR.sugar },
    ],
    extras: [upsize(t)],
  }
}

function coffee(item: FixedItem): Recipe {
  const has = words(item)
  const t = item.nutrition
  const base = has('tea') ? 'Brewed tea' : has('cold brew') ? 'Cold brew' : has('americano', 'espresso', 'latte', 'cappuccino', 'macchiato', 'mocha', 'flat white') ? 'Espresso' : 'Brewed coffee'
  if (t.calories < 20)
    return {
      ings: [{ id: 'base', name: base, core: true }],
      extras: [
        { id: 'x-milk', name: 'Add milk', cal: 20, pr: PR.milk },
        { id: 'x-cream', name: 'Add cream', cal: 50, pr: PR.cream },
        { id: 'x-sugar', name: 'Add sugar', cal: 30, pr: PR.sugar },
        X.syrup,
        X.shot,
        upsize(t),
      ],
    }
  if (has('double-double', 'double double', 'regular'))
    return {
      ings: [
        { id: 'base', name: base, core: true },
        { id: 'cream', name: 'Cream', share: 0.45, pr: PR.cream },
        { id: 'sugar', name: 'Sugar', share: 0.5, pr: PR.sugar },
      ],
      extras: [{ id: 'x-flavour', name: 'Add flavour shot', cal: 10, pr: PR.sugar }, upsize(t)],
    }
  if (has('french vanilla', 'hot chocolate', 'iced capp'))
    return {
      ings: [{ id: 'base', name: has('french vanilla') ? 'French vanilla mix' : 'Drink mix', core: true }],
      extras: [X.whip, X.shot, upsize(t)],
    }
  const flavoured = has('vanilla', 'caramel', 'mocha', 'pumpkin', 'macchiato', 'hazelnut', 'chai')
  const ings: Ing[] = [
    { id: 'base', name: base, core: true },
    { id: 'milk', name: 'Steamed milk', share: flavoured ? 0.62 : 0.95, pr: PR.milk },
  ]
  if (flavoured) ings.push({ id: 'syrup', name: 'Flavour syrup', share: 0.25, pr: PR.sugar })
  if (has('mocha', 'pumpkin')) ings.push({ id: 'whip', name: 'Whipped cream', share: 0.1, pr: PR.whip })
  return {
    ings,
    extras: [X.shot, X.whip, X.syrup, { id: 'x-caramel', name: 'Caramel drizzle', cal: 30, pr: PR.sugar }, upsize(t)],
  }
}

function donut(item: FixedItem): Recipe {
  const has = words(item)
  const ings: Ing[] = [
    { id: 'dough', name: has('timbit') ? 'Timbit' : 'Doughnut', core: true },
    { id: 'glaze', name: has('chocolate') ? 'Chocolate icing' : has('maple') ? 'Maple glaze' : 'Glaze / icing', share: 0.28, pr: PR.glaze },
  ]
  if (has('boston', 'cream', 'filled', 'jelly', 'lemon', 'custard'))
    ings.push({ id: 'filling', name: 'Filling', share: 0.15, pr: PR.cream })
  if (has('sprinkle')) ings.push({ id: 'sprinkles', name: 'Sprinkles', share: 0.05, pr: PR.sugar })
  if (has('bacon')) ings.push({ id: 'bacon', name: 'Bacon bits', share: 0.1, pr: PR.bacon })
  return { ings, extras: [{ id: 'x-glaze', name: 'Extra glaze', cal: 40, pr: PR.glaze }] }
}

function bagel(item: FixedItem): Recipe {
  const has = words(item)
  const ings: Ing[] = [{ id: 'bagel', name: 'Bagel', core: true }]
  if (has('cream cheese')) ings.push({ id: 'spread', name: 'Cream cheese', share: 0.3, pr: PR.creamCheese })
  else if (has('butter')) ings.push({ id: 'spread', name: 'Butter', share: 0.25, pr: PR.cream })
  return {
    ings,
    extras: [
      ...(has('cream cheese') ? [] : [{ id: 'x-cc', name: 'Add cream cheese', cal: 120, pr: PR.creamCheese }]),
      { id: 'x-butter', name: 'Add butter', cal: 100, pr: PR.cream },
      { ...X.egg, cal: 90 },
      X.bacon,
      X.cheese,
      { id: 'x-tomato', name: 'Add tomato', cal: 5, pr: PR.veg },
    ],
  }
}

function bakedGood(item: FixedItem): Recipe {
  const has = words(item)
  if (has('quiche'))
    return {
      ings: [
        { id: 'crust', name: 'Pastry crust', share: 0.35, pr: PR.dough, locked: true },
        { id: 'filling', name: 'Egg & bacon filling', core: true },
      ],
      extras: [{ id: 'x-salad', name: 'Side salad', cal: 80, pr: PR.dressing }],
    }
  const topped = has('almond', 'chocolate', 'fruit', 'frost', 'glaze', 'cream', 'tart', 'cinnamon')
  const ings: Ing[] = [{ id: 'base', name: item.name.replace(/\s*\(.*\)/, ''), core: true }]
  if (topped) ings.push({ id: 'topping', name: 'Topping / filling', share: 0.18, pr: PR.glaze })
  return {
    ings,
    extras: [
      { id: 'x-butter', name: 'Add butter', cal: 100, pr: PR.cream },
      { id: 'x-jam', name: 'Add jam', cal: 50, pr: PR.sugar },
      X.whip,
    ],
  }
}

function frozenDessert(item: FixedItem): Recipe {
  const has = words(item)
  const ings: Ing[] = [{ id: 'base', name: has('frosty') ? 'Frosty' : 'Soft serve', core: true }]
  if (has('blizzard', 'mcflurry', 'oreo', "m&m", 'mix'))
    ings.push({ id: 'mixins', name: has('oreo') ? 'Oreo pieces' : 'Mix-ins', share: 0.3, pr: PR.mixin })
  if (has('sundae', 'fudge', 'caramel')) ings.push({ id: 'sauce', name: 'Sauce', share: 0.12, pr: PR.sugar })
  if (has('dilly', 'dipped')) ings.push({ id: 'coating', name: 'Chocolate coating', share: 0.35, pr: PR.mixin })
  if (has('cone')) ings.push({ id: 'cone', name: 'Cone (or cup)', share: 0.08, pr: PR.bread })
  return {
    ings,
    extras: [
      { id: 'x-mixins', name: 'Extra mix-ins', cal: 140, pr: PR.mixin },
      { id: 'x-fudge', name: 'Add hot fudge', cal: 120, pr: PR.mixin },
      X.whip,
      { id: 'x-nuts', name: 'Add nuts', cal: 90, pr: PR.nuts },
      upsize(item.nutrition),
    ],
  }
}

function dessert(item: FixedItem): Recipe {
  return {
    ings: [
      { id: 'base', name: item.name.replace(/\s*\(.*\)/, ''), core: true },
      { id: 'topping', name: 'Sauce / topping', share: 0.15, pr: PR.sugar },
    ],
    extras: [
      { id: 'x-icecream', name: 'Add a scoop of ice cream', cal: 140, pr: PR.iceCream },
      X.whip,
      { id: 'x-choc', name: 'Chocolate sauce', cal: 100, pr: PR.mixin },
    ],
  }
}

function soup(item: FixedItem): Recipe {
  const has = words(item)
  const ramen = has('ramen', 'tonkotsu', 'shoyu', 'miso ramen', 'tantanmen')
  const pho = has('pho')
  if (ramen || pho)
    return {
      ings: [
        { id: 'noodles', name: pho ? 'Rice noodles' : 'Ramen noodles', share: 0.38, pr: pho ? PR.rice : PR.noodle, locked: true },
        { id: 'broth', name: 'Broth', share: 0.25, pr: PR.broth, locked: true },
        { id: 'protein', name: pho ? proteinName(has, 'Beef') : has('chicken') ? 'Chicken' : 'Chashu pork', core: true },
        ...(ramen ? [{ id: 'egg', name: 'Soft-boiled egg', share: 0.08, pr: PR.egg } as Ing] : []),
        { id: 'toppings', name: pho ? 'Bean sprouts, basil & lime' : 'Green onion & toppings', share: 0.03, pr: PR.veg },
      ],
      extras: [
        { id: 'x-noodles', name: 'Extra noodles', cal: 200, pr: PR.noodle },
        { id: 'x-meat', name: 'Extra meat', cal: 120, pr: PR.meat },
        { ...X.egg, cal: 70 },
        { id: 'x-corn', name: 'Add corn', cal: 40, pr: PR.veg },
        { id: 'x-spice', name: 'Add spicy paste', cal: 30, pr: PR.savoury },
      ],
    }
  return {
    ings: [
      { id: 'broth', name: 'Broth', core: true },
      { id: 'fill', name: 'Noodles, veggies & tofu', share: 0.4, pr: PR.noodle },
    ],
    extras: [{ id: 'x-crackers', name: 'Add crackers', cal: 60, pr: PR.bread }, { id: 'x-roll', name: 'Add bread roll', cal: 150, pr: PR.bread }],
  }
}

function asianPlate(item: FixedItem): Recipe {
  const has = words(item)
  const entreeOnly = has('1 entrée', 'entree') && !has('rice', 'noodle')
  const noodles = has('noodle', 'pad thai', 'vermicelli', 'hokkien', 'singapore', 'lo mein', 'chow mein')
  const ings: Ing[] = []
  if (!entreeOnly)
    ings.push({ id: 'base', name: noodles ? 'Noodles' : 'Steamed rice', share: noodles ? 0.45 : 0.42, pr: noodles ? PR.noodle : PR.rice, locked: true })
  ings.push(
    { id: 'protein', name: proteinName(has, 'Protein'), core: true },
    { id: 'sauce', name: 'Sauce', share: entreeOnly ? 0.3 : 0.15, pr: has('sweet', 'orange', 'honey', 'teriyaki') ? PR.sweetSauce : PR.savoury },
    { id: 'veg', name: 'Vegetables', share: 0.05, pr: PR.veg },
  )
  if (has('pad thai')) ings.push({ id: 'peanuts', name: 'Crushed peanuts', share: 0.04, pr: PR.nuts })
  return {
    ings,
    extras: [
      X.protein,
      { id: 'x-sauce', name: 'Extra sauce', cal: 80, pr: PR.savoury },
      { ...X.egg, name: 'Add fried egg', cal: 90 },
      { id: 'x-springroll', name: 'Add spring roll', cal: 115, pr: PR.dough },
      { id: 'x-rice', name: noodles ? 'Extra noodles' : 'Extra rice', cal: 210, pr: noodles ? PR.noodle : PR.rice },
    ],
  }
}

function pasta(item: FixedItem): Recipe {
  const has = words(item)
  const creamy = has('alfredo', 'cream', 'mac', 'carbonara', 'risotto')
  const withProtein = has('chicken', 'beef', 'bolognese', 'meat', 'shrimp', 'jambalaya', 'brisket', 'sausage')
  const ings: Ing[] = [
    { id: 'pasta', name: has('risotto') ? 'Arborio rice' : 'Pasta', share: 0.45, pr: has('risotto') ? PR.rice : PR.noodle, locked: true },
  ]
  if (withProtein)
    ings.push(
      { id: 'protein', name: proteinName(has, 'Meat'), core: true },
      { id: 'sauce', name: creamy ? 'Cream sauce' : 'Tomato sauce', share: 0.22, pr: creamy ? PR.cream : PR.tomatoSauce },
    )
  else ings.push({ id: 'sauce', name: creamy ? 'Cream sauce' : has('mushroom') ? 'Mushroom sauce' : 'Tomato sauce', core: true })
  ings.push({ id: 'parm', name: 'Parmesan', share: 0.06, pr: PR.cheese })
  return {
    ings,
    extras: [
      ...(withProtein ? [] : [{ ...X.chicken, name: 'Add chicken' }]),
      { id: 'x-shrimp', name: 'Add shrimp', cal: 100, pr: PR.leanProtein },
      { id: 'x-cheese', name: 'Extra cheese', cal: 80, pr: PR.cheese },
      { id: 'x-garlic-bread', name: 'Add garlic bread', cal: 150, pr: PR.bread },
      { id: 'x-salad', name: 'Add side salad', cal: 80, pr: PR.dressing },
    ],
  }
}

function plated(item: FixedItem): Recipe {
  const has = words(item)
  const withFries = has('fries', 'frites', 'chips', '& chips')
  const fajitas = has('fajita')
  const ings: Ing[] = [
    {
      id: 'protein',
      name: has('rib') ? 'Ribs' : has('chicken') ? 'Chicken' : proteinName(has, 'Main'),
      core: true,
    },
  ]
  if (fajitas)
    ings.push(
      { id: 'tortillas', name: 'Tortillas', share: 0.3, pr: PR.tortilla },
      { id: 'toppings', name: 'Cheese, sour cream & guacamole', share: 0.15, pr: PR.sourCream },
      { id: 'veg', name: 'Peppers & onions', share: 0.05, pr: PR.veg },
    )
  else {
    ings.push({
      id: 'side',
      name: withFries ? 'Fries' : has('rice') ? 'Rice' : 'Potatoes / side',
      share: 0.32,
      pr: withFries ? PR.fries : has('rice') ? PR.rice : PR.starch,
    })
    ings.push({
      id: 'sauce',
      name: has('chalet') || has('quarter', 'half chicken') ? 'Dipping sauce' : has('fish', 'halibut') ? 'Tartar sauce' : has('rib') ? 'BBQ sauce' : 'Sauce',
      share: 0.1,
      pr: has('rib') ? PR.sweetSauce : PR.savoury,
    })
    ings.push({ id: 'veg', name: has('fish', 'halibut') ? 'Coleslaw' : 'Veggies / salad', share: 0.06, pr: has('fish', 'halibut') ? PR.dressing : PR.veg })
  }
  return {
    ings,
    extras: [
      { id: 'x-fries', name: 'Add fries', cal: 320, pr: PR.fries },
      { id: 'x-sauce', name: 'Extra sauce', cal: 60, pr: PR.savoury },
      { id: 'x-salad', name: 'Add side salad', cal: 80, pr: PR.dressing },
      { id: 'x-soup', name: 'Add soup', cal: 130, pr: PR.broth },
      { id: 'x-roll', name: 'Add bread roll', cal: 150, pr: PR.bread },
    ],
  }
}

function generic(item: FixedItem): Recipe {
  return {
    ings: [
      { id: 'base', name: item.name.replace(/\s*\(.*\)/, ''), core: true },
      { id: 'sauce', name: 'Sauce / topping', share: 0.1, pr: PR.savoury },
    ],
    extras: [X.sauce, upsize(item.nutrition)],
  }
}

/** Does the item come on bread (bun, tortilla, muffin…)? Uses official parts when available. */
function onBread(item: FixedItem): boolean {
  const bread = /bun|tortilla|muffin|bagel|griddles|bread|biscuit|pita/i
  if ([...(item.parts ?? []), ...(item.ingredients ?? [])].some((p) => bread.test(p.name))) return true
  return words(item)('sandwich', 'burger', 'royale', 'mcchicken', 'mccrispy', 'zinger', 'wrap', 'big mary', 'junior chicken', 'club', 'sub')
}

/** Pick the recipe archetype for an item from its category and name. */
export function recipeFor(item: FixedItem): Recipe {
  const has = words(item)
  switch (item.category) {
    case 'Burgers':
      if (has('chicken') && !has('beef')) return chickenSandwich(item)
      return burger(item)
    case 'Chicken':
      if (onBread(item)) return chickenSandwich(item)
      return chickenPieces(item)
    case 'Sandwiches':
      if (has('chicken') && !has('club', 'sub', 'philly')) return chickenSandwich(item)
      return sandwich(item)
    case 'Wraps':
      return wrap(item)
    case 'Bowls & Burritos':
      if (has('burrito', 'wrap', 'quesadilla', 'taco', 'crunchwrap')) return wrap(item)
      return bowl(item)
    case 'Salads':
      return salad(item)
    case 'Pizza':
      return pizza(item)
    case 'Sides':
      if (has('poutine', 'messy fries', 'loaded')) return poutine(item)
      if (has('fries', 'ring', 'tater', 'tots', 'stix', 'chips') && !has('nacho', 'pita chip', '& chips', 'guac')) return fries(item)
      return side(item)
    case 'Breakfast':
      if (has('muffin', 'biscuit', 'bagel', 'wrap', 'sandwich', 'egger', 'belt', 'mcmuffin')) return breakfastSandwich(item)
      return breakfastPlate(item)
    case 'Drinks':
      if (has('shake', 'smoothie', 'frappuccino', 'float', 'freeze')) return blended(item)
      if (has('milk tea', 'tea +', 'bubble', 'taro', 'matcha', 'fruit tea', 'pearl', 'boba')) return milkTea(item)
      return softDrink(item)
    case 'Coffee':
      if (has('frappuccino', 'iced capp')) return blended(item)
      return coffee(item)
    case 'Bakery':
      if (has('doughnut', 'donut', 'timbit')) return donut(item)
      if (has('bagel')) return bagel(item)
      return bakedGood(item)
    case 'Desserts':
      if (has('blizzard', 'mcflurry', 'sundae', 'cone', 'frosty', 'dilly', 'ice cream', 'soft serve', 'float', 'shake')) return frozenDessert(item)
      return dessert(item)
    case 'Mains':
      if (has('ramen', 'pho', 'soup', 'tantanmen', 'tonkotsu', 'shoyu', 'miso')) return soup(item)
      if (has('chili')) return side(item)
      if (has('spaghetti', 'fettuccine', 'pasta', 'penne', 'linguine', 'risotto', 'mac ', 'lasagna', 'jambalaya')) return pasta(item)
      if (has('pad thai', 'curry', 'basil', 'noodle', 'stir', 'orange chicken', 'sweet & sour', 'broccoli', 'black pepper', 'teriyaki', 'butter chicken', 'vermicelli', 'hokkien', 'singapore'))
        return asianPlate(item)
      if (has('roll', 'nigiri', 'sashimi')) return sushi(item)
      return plated(item)
    default:
      return generic(item)
  }
}

function sushi(item: FixedItem): Recipe {
  const has = words(item)
  if (has('sashimi'))
    return {
      ings: [{ id: 'fish', name: 'Fresh fish', core: true }],
      extras: [{ id: 'x-soy', name: 'Soy sauce', cal: 10, n: { calories: 10, protein: 1, carbs: 1, fat: 0, sodium: 900 } }, { id: 'x-rice', name: 'Side of rice', cal: 210, pr: PR.rice }],
    }
  const ings: Ing[] = [
    { id: 'rice', name: 'Sushi rice', share: has('nigiri') ? 0.55 : 0.5, pr: PR.rice, locked: true },
    { id: 'filling', name: has('california') ? 'Imitation crab & avocado' : has('dynamite') ? 'Tempura shrimp' : proteinName(has, 'Fish'), core: true },
  ]
  if (!has('nigiri')) ings.push({ id: 'nori', name: 'Nori', share: 0.02, pr: PR.veg })
  if (has('spicy', 'dynamite')) ings.push({ id: 'mayo', name: 'Spicy mayo', share: 0.12, pr: PR.mayo })
  if (has('california', 'avocado')) ings.push({ id: 'avocado', name: 'Avocado', share: 0.1, pr: PR.guac })
  return {
    ings,
    extras: [
      { id: 'x-soy', name: 'Soy sauce', n: { calories: 10, protein: 1, carbs: 1, fat: 0, sodium: 900 } },
      { id: 'x-mayo', name: 'Add spicy mayo', cal: 90, pr: PR.mayo },
      { id: 'x-eel', name: 'Add eel sauce', cal: 40, pr: PR.sweetSauce },
      { id: 'x-tempura', name: 'Add tempura crunch', cal: 50, pr: PR.dough },
    ],
  }
}

// --- Official per-ingredient calories ---------------------------------------

/** Macro profile + lock flag for an ingredient, inferred from its name. */
function partProfile(name: string): { pr: Profile; locked?: boolean } {
  const n = name.toLowerCase()
  const has = (...w: string[]) => w.some((x) => n.includes(x))
  if (has('bun', 'muffin', 'bagel', 'griddles cakes', 'english'))
    return { pr: PR.bread, locked: !has('muffin mix', 'carrot muffin', 'blueberry muffin', 'chip muffin', 'fibre muffin', 'orange muffin') }
  if (has('tortilla strips')) return { pr: PR.shell }
  if (has('tortilla')) return { pr: PR.tortilla, locked: true }
  if (has('cone')) return { pr: PR.bread }
  if (has('cream cheese')) return { pr: PR.creamCheese }
  if (has('curds', 'cheese')) return { pr: PR.cheese }
  if (has('bacon') && !has('canadian')) return { pr: PR.bacon }
  if (has('egg')) return { pr: PR.egg }
  if (has('chicken', 'mcnugget')) return { pr: PR.chicken }
  if (has('fish', 'filet')) return { pr: PR.chicken }
  if (has('veggie patty')) return { pr: PR.generic }
  if (has('patty', 'beef', 'pork', 'sausage', 'canadian bacon')) return { pr: PR.meat }
  if (has('fries', 'hashbrown', 'hash brown', 'crispy onions')) return { pr: PR.fries }
  if (has('gravy')) return { pr: PR.gravy }
  if (has('ketchup', 'bbq', 'sweet chili', 'marinara')) return { pr: PR.sweetSauce }
  if (has('buffalo')) return { pr: PR.savoury }
  if (has('sauce', 'mayo', 'dressing', 'tartar', 'ranch')) return { pr: PR.mayo }
  if (has('butter')) return { pr: PR.cream }
  if (has('whipped')) return { pr: PR.whip }
  if (has('18% cream', 'cold foam', 'cream')) return { pr: PR.cream }
  if (has('milk', 'oat beverage', 'yogurt')) return { pr: PR.milk }
  if (has('ice milk', 'ice cream', 'soft serve')) return { pr: PR.iceCream }
  if (has('mix-in', 'pieces', 'smarties', 'oreo', 'snickers', 'skor', 'cookie dough')) return { pr: PR.mixin }
  if (has('syrup', 'sugar', 'topping', 'caramel', 'fudge', 'strawberry sauce', 'juice', 'cola', 'coke', 'sprite', 'root beer', 'red bull', 'fruitopia', 'fuze', 'lemonade', 'pearls', 'fruit base', 'smoothie base', 'freeze dried'))
    return { pr: PR.sugar }
  if (has('lettuce', 'onion', 'pickle', 'tomato', 'cucumber', 'apple slices')) return { pr: PR.veg }
  return { pr: PR.generic }
}

const PROTEIN_WORDS = ['patty', 'chicken', 'mcnugget', 'filet', 'fish', 'egg', 'sausage', 'beef', 'pork', 'portion']

/** Build components from official per-ingredient calories, or null if unusable. */
function componentsFromParts(item: FixedItem): IngredientComponent[] | null {
  const t = item.nutrition
  let parts = (item.parts ?? []).filter((p) => p.name.trim() !== '')
  // Drop zero-calorie ice / water when there's anything else in the drink.
  if (parts.length > 1) parts = parts.filter((p) => !/^(ice|water)$/i.test(p.name.trim()))
  if (parts.length === 0) return null
  const partSum = parts.reduce((s, p) => s + p.cal, 0)
  // Ignore inconsistent source data (parts that don't add up to the item).
  if (Math.abs(partSum - t.calories) > Math.max(20, t.calories * 0.1)) return null

  // The core absorbs rounding: the main protein if present, else the biggest part.
  const lower = (s: string) => s.toLowerCase()
  const coreIdx = (() => {
    const i = parts.findIndex((p) => PROTEIN_WORDS.some((w) => lower(p.name).includes(w)))
    if (i >= 0) return i
    return parts.reduce((m, p, idx) => (p.cal > parts[m].cal ? idx : m), 0)
  })()

  const specs: PartSpec[] = parts.map((p, i) => {
    if (i === coreIdx) return { id: `p${i}`, name: p.name, core: true }
    if (/^salt$/i.test(p.name.trim()))
      return { id: `p${i}`, name: 'Salt', n: { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: Math.round(t.sodium * 0.5) } }
    const { pr, locked } = partProfile(p.name)
    return { id: `p${i}`, name: p.name, n: nut(p.cal, pr), removable: locked ? false : undefined }
  })
  return buildComponents(t, specs)
}

/** Typical calories of one serving of an ingredient, from its name. */
function typicalCal(name: string): number {
  const n = name.toLowerCase()
  const has = (...w: string[]) => w.some((x) => n.includes(x))
  if (has('large beef patty')) return 300
  if (has('small beef patty')) return 110
  if (has('plant-based patty', 'veggie patty')) return 250
  if (has('patty') && has('sausage')) return 200
  if (has('beef patty')) return 220
  if (has('sausage')) return 150
  if (has('cruncher chicken')) return 400
  if (has('chicken buddy')) return 150
  if (has('chicken strip')) return 100
  if (has('chicken')) return 300
  if (has('fish')) return 350
  if (has('eggs')) return 160
  if (has('egg')) return 80
  if (has('bacon')) return 70
  if (has('cheese curds')) return 180
  if (has('cheese')) return 60
  if (has('hash brown', 'hashbrown')) return 180
  if (has('fries')) return 300
  if (has('pancake')) return 120
  if (has('toast')) return 80
  if (has('english muffin')) return 140
  if (has('hamburger bun')) return 150
  if (has('bun')) return 200
  if (has('tortilla')) return 180
  if (has('margarine', 'butter')) return 35
  if (has('syrup')) return has('table') ? 200 : 40
  if (has('gravy', 'poutine sauce')) return 100
  if (has('coleslaw')) return 50
  if (has('tartar', 'mayo', 'aioli', 'teen', 'mozza', 'chipotle', 'sauce', 'ranch')) return 80
  if (has('glaze')) return 40
  if (has('ketchup')) return 15
  if (has('mustard')) return 5
  if (has('grilled onion')) return 10
  if (has('pickle')) return 2
  if (has('lettuce', 'tomato', 'onion')) return 5
  if (has('milk', 'oat beverage', 'cream')) return 120
  if (has('espresso')) return 5
  return 60
}

/** Names that are cooking media / seasoning rather than removable toppings. */
const NOT_A_TOPPING = /seasoning|pan coating|frying oil|^batter|breadcrumbs|^salt$|^-$|creamer \(for|kraft (liquid|pure|peanut|raspberry|blueberry|table syrup)/i

/** Build components from the restaurant's ingredient names, or null if too few. */
function componentsFromIngredients(item: FixedItem): IngredientComponent[] | null {
  const t = item.nutrition
  const seen = new Set<string>()
  const list = (item.ingredients ?? []).filter((g) => {
    const key = g.name.trim().toLowerCase()
    if (!key || NOT_A_TOPPING.test(key) || seen.has(key)) return false
    seen.add(key)
    return true
  })
  if (list.length < 2 || t.calories <= 0) return null

  // Known (officially derived) calories stay as-is; the rest share what's left.
  const known = list.reduce((s, g) => s + (g.cal ?? 0), 0)
  const unknown = list.filter((g) => g.cal == null)
  const typical = unknown.reduce((s, g) => s + typicalCal(g.name), 0)
  const room = t.calories - known
  if (room < 0 || (unknown.length > 0 && typical <= 0)) return null
  const k = unknown.length ? room / typical : 0
  const parts = list.map((g) => ({ name: g.name, cal: Math.round(g.cal ?? typicalCal(g.name) * k) }))
  return componentsFromParts({ ...item, parts })
}

/** Drop "Add X" extras when X is already in the item (keep "Extra X"). */
function relevantExtras(extras: Extra[], present: IngredientComponent[]): Extra[] {
  const names = present.map((c) => c.name.toLowerCase())
  return extras.filter((x) => {
    const m = x.name.match(/^add (?:a |an )?(.+)$/i)
    if (!m) return true
    const key = m[1].toLowerCase().split(' ')[0]
    return !names.some((nm) => nm.includes(key))
  })
}

function extrasToComponents(extras: Extra[]): IngredientComponent[] {
  return extras.map((x) => ({
    id: x.id,
    name: x.name,
    default: false,
    nutrition: x.n ?? nut(x.cal ?? 0, x.pr ?? PR.generic),
  }))
}

/**
 * The full customizable breakdown for any fixed item: its own `components`
 * (if defined) plus archetype extras, or a generated recipe otherwise. Default
 * ingredients always sum exactly to the item's published nutrition.
 */
export function componentsFor(item: FixedItem): IngredientComponent[] {
  const recipe = recipeFor(item)
  if (item.parts && item.parts.length > 0) {
    const official = componentsFromParts(item)
    if (official) return [...official, ...extrasToComponents(relevantExtras(recipe.extras, official))]
  }
  if (item.ingredients && item.ingredients.length > 0) {
    const named = componentsFromIngredients(item)
    if (named) return [...named, ...extrasToComponents(relevantExtras(recipe.extras, named))]
  }
  if (item.components && item.components.length > 0) {
    const hasExtras = item.components.some((c) => c.default === false)
    const existing = new Set(item.components.map((c) => c.id))
    const extra = hasExtras ? [] : extrasToComponents(recipe.extras.filter((x) => !existing.has(x.id)))
    return [...item.components, ...extra]
  }
  const t = item.nutrition
  const parts: PartSpec[] = recipe.ings.map((g) =>
    g.core
      ? { id: g.id, name: g.name, core: true }
      : { id: g.id, name: g.name, n: g.n ?? nut(t.calories * (g.share ?? 0), g.pr ?? PR.generic), removable: g.locked ? false : undefined },
  )
  return [...buildComponents(t, parts), ...extrasToComponents(recipe.extras)]
}
