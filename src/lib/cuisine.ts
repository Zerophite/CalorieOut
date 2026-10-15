import { type MenuItem, type Restaurant } from '../types'

/**
 * Cuisines a dish can be browsed by. A dish belongs to a cuisine when its name
 * says so (pad thai, burrito, sushi…), or — for its savoury dishes that aren't
 * plainly another cuisine — when its restaurant serves that cuisine (everything
 * savoury at Thai Express is Thai, but the poutine at a shawarma shop isn't
 * Middle Eastern). A dish can belong to more than one.
 *
 * A dish's form wins over a flavour in its name: a butter chicken pizza is a
 * pizza, a jerk chicken taco is a taco, and a teriyaki sub or Korean BBQ
 * sandwich isn't Japanese or Korean food.
 */
export interface Cuisine {
  id: string
  label: string
  /** Dish names that are this cuisine wherever they're sold. */
  dish: RegExp
  /** Restaurant cuisines whose savoury dishes all count. */
  restaurant?: RegExp
  /** Restaurant cuisines where a shared dish name belongs to them instead (Thai fried rice). */
  notAt?: RegExp
  /** Desserts and drinks count too (tiramisu, churros) — otherwise a dessert spring roll isn't Chinese. */
  sweets?: boolean
}

/** Condiments aren't dishes: a sweet & sour dip shouldn't list as Chinese food. */
const CONDIMENT = /\b(sauce|dip|dressing|gravy|cup|packet|seasoning)\b/i

/** Pizzas (by name or menu section) count as pizza, not as their toppings' cuisine. */
const PIZZA = /pizza|calzone|p'?zone|panzerott|stromboli|panuzzo/i
/** Tacos, burritos and the like are Mexican food whatever goes in them. */
const MEXICAN_FORM = /\b(tacos?|burritos?|quesadillas?|nachos|fajitas?)\b/i
/** Subs, burgers, sandwiches and snack bites take a flavour, not a cuisine (a tonkatsu sando or banh mi still counts). */
const WESTERN_FORM = /\b(subs?|burgers?|sandwich(es)?|melts?|cheesesteaks?|pretzels?|bites|pop-ins|omelett?es?|doritos)\b/i
const STILL_COUNTS = /\bsando\b|banh mi/i

export const CUISINES: Cuisine[] = [
  {
    // Italian food by dish: an Italian-inspired café's burgers and brunch aren't Italian.
    id: 'italian',
    sweets: true,
    label: 'Italian',
    dish: /pasta|spaghetti|fettucc?in|linguin|penne|rigatoni|lasagn|ravioli|gnocchi|risotto|alfredo|carbonara|bolognes|arrabbiat|bruschetta|focaccia|caprese|prosciutto|tiramisu|cannoli|parmesan chicken|chicken parm|parmigiana/i,
  },
  {
    // Pizza is its own thing: a pizza chain isn't an Italian restaurant, and
    // sushi pizza and Turkish pide aren't pizza.
    id: 'pizza',
    label: 'Pizza',
    dish: PIZZA,
    notAt: /sushi|japanese|turkish/i,
  },
  {
    id: 'chinese',
    label: 'Chinese',
    dish: /chow mein|lo mein|fried rice|general tao|general tso|kung pao|szechuan|sichuan|wonton|dumpling|potsticker|spring roll|egg roll|sweet (&|and) sour|ginger beef|orange chicken|chop suey|hot (&|and) sour|black bean (sauce|(&|and) garlic)|mongolian|hunan|shanghai|yangzhou|char siu|bok choy|lemon chicken|egg drop|chicken balls/i,
    restaurant: /chinese/i,
    notAt: /thai|japanese|sushi|ramen/i,
  },
  {
    id: 'japanese',
    label: 'Japanese',
    dish: /sushi|sashimi|nigiri|maki|hosomaki|futomaki|ramen|udon|soba|teriyaki|tempura|gyoza|katsu|donburi|karaage|takoyaki|miso|edamame|onigiri|tonkotsu|shoyu|wasabi|yakitori|japanese|bento|tamago|tartare maki/i,
    restaurant: /japanese|sushi|ramen/i,
    // A Korean place that also rolls sushi (Kochu) is Korean, not Japanese; a
    // Chinese noodle soup isn't ramen; and a sub shop's teriyaki is a sub.
    notAt: /korean|chinese|sandwich|\bsubs?\b/i,
  },
  {
    id: 'korean',
    label: 'Korean',
    dish: /korean|bibim|bulgogi|kimchi|gochujang|japchae|tteok|galbi|kalbi|yangnyeom|gimbap|kimbap|dakgangjeong/i,
    restaurant: /korean/i,
  },
  {
    id: 'thai',
    sweets: true,
    label: 'Thai',
    dish: /\bthai\b|tha[iï]|pad thai|pad see ew|drunken noodle|tom yum|green curry|red curry|yellow curry|panaeng|panang|massaman|satay|larb|lemongrass|basil fried rice|thairacha|pad prik/i,
    restaurant: /\bthai\b/i,
  },
  {
    id: 'vietnamese',
    sweets: true,
    label: 'Vietnamese',
    dish: /\bpho\b|banh mi|vermicelli|vietnamese|tonkinese|bun bo|goi cuon/i,
  },
  {
    id: 'indian',
    sweets: true,
    label: 'Indian',
    dish: /butter chicken|tikka|masala|paneer|(?<!burmese )naan|samosa|tandoori|biryani|korma|vindaloo|dal\b|bombay|chana|aloo/i,
  },
  {
    id: 'mexican',
    sweets: true,
    label: 'Mexican',
    dish: /burrito|taco|quesadilla|nacho|fajita|enchilada|chimichanga|churro|guac|tortilla chips|mexican|tex[- ]mex|carnitas|barbacoa|elote|pico de gallo|refried|salsa|queso/i,
    // Only Mexican restaurants: a Tex-Mex grill's calamari and steaks aren't Mexican.
    restaurant: /mexican/i,
  },
  {
    id: 'middle-eastern',
    sweets: true,
    label: 'Middle Eastern',
    dish: /shawarma|falafel|hummus|donair|kebab|kabob|kofta|tabbouleh|fattoush|baba gh|baklava|\bsaj\b|za'?atar|tahini|toum|kibbeh|grape leaves|dolma|labneh|manakeesh|awama|turnips|lebanese|zaatar/i,
    restaurant: /shawarma|middle eastern|lebanese|mediterranean/i,
    notAt: /turkish/i,
  },
  {
    id: 'turkish',
    sweets: true,
    label: 'Turkish',
    dish: /turkish|kebab|kabab|pide|lahmacun|k[uü]nefe|kunafa|iskender|adana|k[oö]fte|doner|d[oö]ner|ayran|beyti|ali nazik|s[uü]tla[cç]|havu[cç]|lokma/i,
    restaurant: /turkish/i,
  },
  {
    id: 'greek',
    sweets: true,
    label: 'Greek',
    // Feta and Greek yogurt are ingredients, not Greek dishes.
    dish: /greek(?!\s+yog)|gyro|souvlaki|tzatziki|spanakopita|moussaka/i,
  },
  {
    id: 'caribbean',
    label: 'Caribbean',
    dish: /jerk|caribbean|jamaican|plantain|roti\b|patty\b.*jamaican/i,
  },
  {
    id: 'canadian',
    sweets: true,
    label: 'Canadian',
    dish: /poutine|beaver ?tail|nanaimo|butter tart|smoked meat|timbit|peameal|bannock|tourti[eè]re|sugar pie/i,
  },
]

const SWEETS = new Set(['Desserts', 'Bakery'])
const DRINKS = new Set(['Drinks', 'Coffee'])

/** Whether a dish's own name puts it in a cuisine (form before flavour). */
function byName(c: Cuisine, item: MenuItem): boolean {
  const pizza = PIZZA.test(item.name) || item.category === 'Pizza'
  if (c.id === 'pizza') return pizza && !SWEETS.has(item.category) // a dessert "pizza" is a dessert
  if (!c.dish.test(item.name)) return false
  // A drink only counts when it says so (Thai tea, Turkish coffee), not for a
  // flavour (a churro latte isn't Mexican, a tiramisu frappe isn't Italian).
  if (DRINKS.has(item.category)) return new RegExp(`\\b${c.label.split(' ')[0]}`, 'i').test(item.name)
  if (SWEETS.has(item.category)) return !!c.sweets
  if (pizza) return false
  if (c.id !== 'mexican' && MEXICAN_FORM.test(item.name)) return false
  if (c.id !== 'canadian' && WESTERN_FORM.test(item.name) && !STILL_COUNTS.test(item.name)) return false
  return true
}

/** Cuisine ids a dish belongs to. */
export function cuisinesOf(restaurant: Restaurant, item: MenuItem): string[] {
  if (CONDIMENT.test(item.name)) return []
  const open = CUISINES.filter((c) => !c.notAt?.test(restaurant.cuisine))
  const named = open.filter((c) => byName(c, item)).map((c) => c.id)
  // The restaurant's cuisine covers its savoury dishes that aren't plainly
  // something else (brunch included only where the restaurant's cuisine is it).
  const savoury = !SWEETS.has(item.category) && !DRINKS.has(item.category) && item.category !== 'Breakfast'
  const own = open.filter((c) => c.restaurant?.test(restaurant.cuisine) && savoury && named.every((id) => id === c.id)).map((c) => c.id)
  return [...new Set([...named, ...own])]
}

/**
 * What kind of restaurant a place is, for browsing restaurants: decided by the
 * restaurant itself (its name and cuisine), never by one dish on its menu — a
 * pizza chain isn't Italian and a sub shop with a teriyaki sub isn't Japanese.
 */
/** Sections the cuisine chips are shown in. */
export type CuisineGroup = 'cuisine' | 'food' | 'drinks'
export const CUISINE_GROUPS: { id: CuisineGroup; label: string }[] = [
  { id: 'cuisine', label: 'Cuisine' },
  { id: 'food', label: 'Food' },
  { id: 'drinks', label: 'Drinks & treats' },
]

export interface RestaurantCuisine {
  id: string
  label: string
  match: RegExp
  /** Restaurants that match but belong elsewhere (a Korean sushi bar isn't Japanese). */
  not?: RegExp
  group: CuisineGroup
}

export const RESTAURANT_CUISINES: RestaurantCuisine[] = [
  { id: 'italian', label: 'Italian', match: /italian/i, group: 'cuisine' },
  { id: 'chinese', label: 'Chinese', match: /chinese|asian noodles/i, group: 'cuisine' },
  { id: 'japanese', label: 'Japanese', match: /japanese|sushi|ramen/i, not: /korean/i, group: 'cuisine' },
  { id: 'korean', label: 'Korean', match: /korean/i, group: 'cuisine' },
  // Noodlebox's pan-Asian boxes are mostly Chinese-Canadian and Thai.
  { id: 'thai', label: 'Thai', match: /\bthai\b|asian noodles/i, group: 'cuisine' },
  { id: 'vietnamese', label: 'Vietnamese', match: /vietnam|\bpho\b|b[aá]nh m[iì]/i, group: 'cuisine' },
  { id: 'indian', label: 'Indian', match: /indian/i, group: 'cuisine' },
  { id: 'mexican', label: 'Mexican', match: /mexican|tex-mex|burrito|taco/i, group: 'cuisine' },
  // A Turkish grill is filed as Turkish, even when it calls itself Mediterranean too.
  { id: 'middle-eastern', label: 'Middle Eastern', match: /shawarma|middle eastern|lebanese|mediterranean/i, not: /turkish/i, group: 'cuisine' },
  { id: 'turkish', label: 'Turkish', match: /turkish/i, group: 'cuisine' },
  { id: 'greek', label: 'Greek', match: /greek|souvlaki/i, group: 'cuisine' },
  { id: 'pizza', label: 'Pizza', match: /pizza/i, group: 'food' },
  { id: 'burgers', label: 'Burgers', match: /burger/i, group: 'food' },
  { id: 'chicken', label: 'Chicken & wings', match: /chicken|wings|rotisserie/i, group: 'food' },
  { id: 'sandwiches', label: 'Sandwiches & subs', match: /sandwich|\bsubs?\b|pitas|deli|bagel/i, group: 'food' },
  { id: 'healthy', label: 'Bowls & salads', match: /bowls|salads|healthy/i, not: /smoothie/i, group: 'food' },
  { id: 'seafood', label: 'Fish & seafood', match: /fish|seafood/i, group: 'food' },
  { id: 'bbq', label: 'BBQ', match: /bbq|smokehouse/i, group: 'food' },
  { id: 'bubble-tea', label: 'Bubble tea', match: /bubble tea/i, group: 'drinks' },
  { id: 'smoothies', label: 'Smoothies & juice', match: /smoothie|juice/i, group: 'drinks' },
  // Whole words: "Streats" isn't a treats shop.
  { id: 'dessert', label: 'Desserts', match: /dessert|\btreats\b|doughnut|pastr/i, group: 'drinks' },
]

/** Restaurant cuisine ids a restaurant belongs to. */
export function restaurantCuisines(r: Restaurant): string[] {
  const text = `${r.name} ${r.cuisine}`
  return RESTAURANT_CUISINES.filter((c) => c.match.test(text) && !c.not?.test(text)).map((c) => c.id)
}
