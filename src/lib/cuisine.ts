import { type MenuItem, type Restaurant } from '../types'

/**
 * Cuisines a dish can be browsed by. A dish belongs to a cuisine when its name
 * says so (pad thai, burrito, sushi…), or — for its mains, not drinks or
 * desserts — when its restaurant serves that cuisine (everything savoury at
 * Thai Express is Thai). A dish can belong to more than one.
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

export const CUISINES: Cuisine[] = [
  {
    id: 'italian',
    sweets: true,
    label: 'Italian',
    dish: /\bpizza|pizzas?\b|pasta|spaghetti|fettucc?in|linguine|penne|rigatoni|lasagn|ravioli|gnocchi|risotto|alfredo|carbonara|bolognes|marinara|arrabbiat|calzone|p'?zone|bruschetta|focaccia|panini|panuzzo|margherita|tiramisu|cannoli|parmesan chicken|chicken parm|garlic bread|italian\b|pizzaghetti/i,
    restaurant: /italian/i,
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
  },
  {
    id: 'korean',
    label: 'Korean',
    dish: /korean|bibim|bulgogi|kimchi|gochujang|japchae|tteok|galbi|kalbi|yangnyeom/i,
  },
  {
    id: 'thai',
    sweets: true,
    label: 'Thai',
    dish: /\bthai\b|tha[iï]|pad thai|pad see ew|tom yum|green curry|red curry|yellow curry|panaeng|panang|massaman|satay|larb|lemongrass|basil fried rice|thairacha|pad prik/i,
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
    dish: /butter chicken|tikka|masala|paneer|naan|samosa|tandoori|biryani|korma|vindaloo|dal\b|bombay|chana|aloo/i,
  },
  {
    id: 'mexican',
    sweets: true,
    label: 'Mexican',
    dish: /burrito|taco|quesadilla|nacho|fajita|enchilada|chimichanga|churro|guac|tortilla chips|mexican|tex[- ]mex|carnitas|barbacoa|elote|pico de gallo/i,
    restaurant: /mexican|tex-mex/i,
  },
  {
    id: 'middle-eastern',
    sweets: true,
    label: 'Middle Eastern',
    dish: /shawarma|falafel|hummus|donair|kebab|kabob|kofta|tabbouleh|fattoush|baba gh|baklava|halloumi|\bsaj\b|za'?atar|tahini|toum|kibbeh|grape leaves|dolma|labneh|manakeesh|awama|lokma|turnips|lebanese|zaatar/i,
    restaurant: /shawarma|middle eastern|lebanese|mediterranean/i,
  },
  {
    id: 'greek',
    sweets: true,
    label: 'Greek',
    dish: /greek|gyro|souvlaki|tzatziki|feta|spanakopita|moussaka/i,
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
    dish: /poutine|beaver ?tail|nanaimo|butter tart|montr[eé]al|timbit|peameal|bannock|tourti[eè]re|sugar pie/i,
  },
]

const SWEET_OR_DRINK = new Set(['Drinks', 'Coffee', 'Desserts', 'Bakery'])

/** Cuisine ids a dish belongs to. */
export function cuisinesOf(restaurant: Restaurant, item: MenuItem): string[] {
  const out: string[] = []
  if (CONDIMENT.test(item.name)) return out
  for (const c of CUISINES) {
    if (c.notAt?.test(restaurant.cuisine)) continue
    if (c.dish.test(item.name) && (c.sweets || !SWEET_OR_DRINK.has(item.category))) out.push(c.id)
    else if (c.restaurant && c.restaurant.test(restaurant.cuisine) && !SWEET_OR_DRINK.has(item.category)) out.push(c.id)
  }
  return out
}
