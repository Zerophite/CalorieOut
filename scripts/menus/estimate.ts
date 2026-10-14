// Reference recipes for estimating dishes at spots that publish no nutrition
// data (see gen-local.ts). Each archetype is a typical restaurant portion of
// that dish: [calories, protein g, carbs g, fat g, sodium mg], plus the menu
// category, a recipe hint for the ingredient breakdown and a serving label.
//
// An item's estimate is its archetype scaled to the portion (`x` factor or
// size), or — when the restaurant posts calories on its menu — scaled so the
// calories match the posted figure, keeping the archetype's macro balance.
import type { MealCategory, Nutrition } from '../../src/types'

export interface Archetype {
  n: [number, number, number, number, number]
  category: MealCategory
  /** Recipe hint passed to the ingredient templates (defaults to the item name). */
  hint?: string
  serving: string
}

const A = (n: Archetype['n'], category: MealCategory, serving: string, hint?: string): Archetype => ({ n, category, serving, hint })

// Sit-down portions (tenders, kids' meals, Caesar salads, fish & chips) were
// recalibrated against the calories Ottawa restaurants post on their menus;
// scripts/menus/check-estimates.ts measures how close the references are.
export const ARCHETYPES: Record<string, Archetype> = {
  // --- Shawarma & Middle Eastern ------------------------------------------------------------------
  'wrap.chicken': A([660, 38, 55, 30, 1300], 'Wraps', '1 wrap', 'chicken shawarma wrap'),
  'wrap.beef': A([720, 36, 55, 38, 1400], 'Wraps', '1 wrap', 'beef shawarma wrap'),
  'wrap.mixed': A([690, 37, 55, 34, 1350], 'Wraps', '1 wrap', 'mixed shawarma wrap'),
  'wrap.donair': A([760, 32, 60, 42, 1600], 'Wraps', '1 wrap', 'donair wrap'),
  'wrap.kafta': A([740, 34, 56, 42, 1450], 'Wraps', '1 wrap', 'beef kafta wrap'),
  'wrap.falafel': A([560, 15, 70, 24, 1100], 'Wraps', '1 wrap', 'falafel wrap'),
  'wrap.veggie': A([450, 12, 62, 17, 950], 'Wraps', '1 wrap', 'veggie wrap'),
  'wrap.halloumi': A([700, 28, 58, 38, 1500], 'Wraps', '1 wrap', 'halloumi wrap'),
  'wrap.saj': A([780, 42, 62, 38, 1550], 'Wraps', '1 wrap', 'chicken saj wrap'),
  'wrap.combo': A([1220, 43, 133, 50, 1800], 'Wraps', 'wrap, side & drink', 'chicken shawarma wrap combo'),
  'plate.chicken': A([950, 55, 90, 38, 1900], 'Mains', 'with rice & sides', 'chicken shawarma platter'),
  'plate.beef': A([1020, 52, 90, 48, 2000], 'Mains', 'with rice & sides', 'beef shawarma platter'),
  'plate.mixed': A([990, 54, 90, 44, 1950], 'Mains', 'with rice & sides', 'mixed shawarma platter'),
  'plate.kafta': A([1000, 48, 88, 50, 1900], 'Mains', 'with rice & sides', 'kafta platter'),
  'plate.falafel': A([900, 25, 110, 40, 1700], 'Mains', 'with rice & sides', 'falafel platter'),
  'plate.veggie': A([750, 18, 105, 28, 1400], 'Mains', 'with rice & sides', 'veggie platter'),
  'bowl.shawarma': A([760, 42, 76, 30, 1500], 'Bowls & Burritos', '1 bowl', 'chicken shawarma rice bowl'),
  'bowl.butter-chicken': A([890, 45, 88, 38, 1600], 'Bowls & Burritos', '1 bowl', 'butter chicken rice bowl'),
  'poutine.classic': A([750, 18, 70, 42, 1550], 'Sides', 'regular', 'poutine'),
  'poutine.shawarma': A([980, 40, 74, 56, 2100], 'Sides', 'regular', 'chicken shawarma poutine'),
  'side.garlic-potatoes': A([380, 5, 45, 20, 600], 'Sides', 'regular', 'garlic potatoes'),
  'side.rice': A([300, 6, 58, 5, 500], 'Sides', 'regular', 'rice'),
  'side.hummus': A([250, 7, 18, 17, 450], 'Sides', '1 container', 'hummus'),
  'side.garlic-sauce': A([300, 2, 3, 32, 250], 'Sides', '1 container', 'garlic sauce'),
  'side.tahini': A([180, 5, 6, 16, 150], 'Sides', '1 container', 'tahini sauce'),
  'side.baba': A([150, 3, 9, 12, 350], 'Sides', '1 container', 'baba ghanoush'),
  'side.fattoush': A([250, 4, 22, 16, 550], 'Salads', '1 salad', 'fattoush salad'),
  'side.tabbouleh': A([180, 3, 16, 12, 400], 'Salads', '1 salad', 'tabbouleh salad'),
  'side.greek-salad': A([280, 6, 12, 24, 700], 'Salads', '1 salad', 'greek salad'),
  'side.coleslaw': A([180, 1, 12, 14, 250], 'Sides', 'regular', 'coleslaw'),
  'side.kibbeh': A([130, 6, 10, 7, 200], 'Sides', '1 piece', 'kibbeh'),
  'side.grape-leaves': A([220, 4, 30, 10, 550], 'Sides', '6 pieces', 'grape leaves'),
  'side.falafel-pc': A([60, 2, 6, 3, 100], 'Sides', '1 piece', 'falafel'),
  'side.pickles': A([15, 0, 3, 0, 600], 'Sides', '1 container', 'pickles'),
  'side.fried-veg': A([350, 4, 22, 28, 500], 'Sides', 'regular', 'fried vegetables'),
  'side.meat-pie': A([300, 12, 30, 15, 500], 'Sides', '1 piece', 'meat pie'),
  'side.pita': A([170, 6, 34, 1, 320], 'Sides', '1 pita', 'pita bread'),
  'sub.hot': A([760, 40, 72, 32, 1700], 'Sandwiches', '1 sub', 'chicken sub'),
  'sub.fries': A([650, 9, 85, 30, 1100], 'Sandwiches', '1 sub', 'fries sub'),
  'dessert.awama': A([480, 5, 62, 24, 150], 'Desserts', '12 pieces', 'awama'),
  'dessert.baklava': A([230, 4, 26, 13, 120], 'Desserts', '1 piece', 'baklava'),
  'dessert.churros': A([380, 5, 48, 19, 250], 'Desserts', '1 order', 'churros'),

  // --- Turkish grill -------------------------------------------------------------------------------
  'tr.kebab-plate': A([1100, 58, 92, 52, 2300], 'Mains', 'with bulgur & sides', 'adana kebab plate'),
  'tr.chicken-plate': A([950, 66, 90, 34, 2000], 'Mains', 'with bulgur & sides', 'chicken shish plate'),
  'tr.lamb-plate': A([1200, 60, 85, 66, 2000], 'Mains', 'with bulgur & sides', 'lamb chops plate'),
  'tr.mixed-grill': A([1350, 92, 80, 70, 2900], 'Mains', 'per person', 'mixed grill platter'),
  'tr.iskender': A([1200, 55, 85, 70, 2600], 'Mains', '1 plate', 'iskender kebab'),
  'tr.kebab-wrap': A([900, 40, 98, 38, 2000], 'Wraps', 'with fries', 'kebab wrap'),
  'tr.pide': A([1100, 50, 130, 40, 2400], 'Pizza', '1 pide', 'turkish pide'),
  'tr.lahmacun': A([600, 28, 80, 18, 1400], 'Pizza', '1 lahmacun', 'lahmacun'),
  'tr.meze': A([180, 4, 12, 13, 400], 'Sides', '1 dish', 'turkish meze'),
  'tr.salad': A([200, 3, 15, 15, 400], 'Salads', '1 salad', 'turkish salad'),
  'tr.kunefe': A([600, 14, 70, 30, 400], 'Desserts', '1 order', 'kunefe'),
  'dessert.rice-pudding': A([300, 8, 50, 7, 120], 'Desserts', '1 bowl', 'rice pudding'),
  'drink.ayran': A([110, 6, 8, 6, 400], 'Drinks', '1 bottle', 'ayran'),

  // --- BBQ & grill ----------------------------------------------------------------------------------
  'bbq.brisket-plate': A([1050, 60, 70, 58, 2300], 'Mains', 'with 2 sides', 'brisket dinner'),
  'bbq.ribs-half': A([950, 55, 40, 62, 1900], 'Mains', 'half rack', 'bbq beef ribs'),
  'bbq.chicken-dinner': A([900, 58, 70, 42, 1900], 'Mains', 'with 2 sides', 'bbq chicken dinner'),
  'bbq.sandwich': A([720, 40, 58, 36, 1700], 'Sandwiches', '1 sandwich', 'brisket sandwich'),
  'side.mac': A([420, 15, 40, 22, 900], 'Sides', 'regular', 'mac and cheese'),
  'side.cornbread': A([200, 4, 28, 8, 350], 'Sides', '1 piece', 'cornbread'),
  'side.beans': A([250, 10, 42, 4, 800], 'Sides', 'regular', 'baked beans'),

  // --- Ramen & Japanese -----------------------------------------------------------------------------
  'ramen.tonkotsu': A([680, 32, 66, 30, 2300], 'Mains', '1 bowl', 'tonkotsu ramen'),
  'ramen.shoyu': A([560, 28, 68, 18, 2400], 'Mains', '1 bowl', 'shoyu ramen'),
  'ramen.miso': A([620, 28, 68, 24, 2350], 'Mains', '1 bowl', 'miso ramen'),
  'ramen.spicy': A([720, 30, 66, 36, 2500], 'Mains', '1 bowl', 'spicy ramen'),
  'ramen.chicken': A([600, 32, 66, 22, 2200], 'Mains', '1 bowl', 'chicken ramen'),
  'ramen.veggie': A([520, 16, 74, 18, 2000], 'Mains', '1 bowl', 'vegetable ramen'),
  'ramen.tsukemen': A([760, 35, 95, 24, 2400], 'Mains', '1 bowl', 'tsukemen ramen'),
  'ramen.curry': A([720, 22, 88, 30, 2300], 'Mains', '1 bowl', 'curry ramen'),
  'ramen.mazemen': A([780, 30, 90, 32, 2000], 'Mains', '1 bowl', 'mazemen noodles'),
  'add.egg': A([75, 6, 1, 5, 150], 'Sides', '1 egg', 'seasoned egg'),
  'add.chashu': A([160, 12, 1, 12, 320], 'Sides', '2 slices', 'chashu pork'),
  'add.noodles': A([270, 9, 52, 3, 250], 'Sides', '1 portion', 'ramen noodles'),
  'don.rice-bowl': A([650, 28, 85, 20, 1300], 'Bowls & Burritos', '1 bowl', 'chicken rice bowl'),
  'don.omurice': A([750, 25, 90, 30, 1500], 'Mains', '1 plate', 'omurice'),
  'don.curry': A([800, 26, 110, 28, 1800], 'Mains', '1 plate', 'japanese curry rice'),
  'side.gyoza': A([290, 12, 30, 13, 620], 'Sides', '5 pieces', 'pork gyoza'),
  'side.karaage': A([450, 26, 22, 28, 900], 'Sides', '1 order', 'chicken karaage'),
  'side.takoyaki': A([300, 8, 30, 16, 600], 'Sides', '6 pieces', 'takoyaki'),
  'side.edamame': A([180, 16, 13, 8, 400], 'Sides', '1 order', 'edamame'),
  'side.steamed-rice': A([200, 4, 44, 0, 5], 'Sides', '1 bowl', 'steamed rice'),
  'side.tempura': A([450, 14, 45, 24, 800], 'Sides', '1 order', 'shrimp tempura'),
  'side.agedashi': A([280, 12, 20, 17, 700], 'Sides', '1 order', 'agedashi tofu'),
  'side.miso-soup': A([40, 3, 4, 1.5, 750], 'Sides', '1 bowl', 'miso soup'),
  'side.seaweed-salad': A([120, 2, 14, 6, 700], 'Salads', '1 order', 'seaweed salad'),
  'side.house-salad': A([90, 2, 9, 6, 300], 'Salads', '1 salad', 'house salad'),
  'side.fries-asian': A([380, 5, 48, 19, 600], 'Sides', '1 order', 'fries'),
  'side.spring-roll': A([300, 5, 34, 16, 550], 'Sides', '2 pieces', 'spring rolls'),
  'dessert.ice-cream': A([220, 4, 28, 10, 70], 'Desserts', '2 scoops', 'ice cream'),
  'dessert.mochi': A([200, 3, 34, 6, 30], 'Desserts', '2 pieces', 'mochi ice cream'),
  'dessert.cheesecake': A([430, 7, 35, 30, 330], 'Desserts', '1 slice', 'cheesecake'),

  // --- Sushi ------------------------------------------------------------------------------------------
  'maki.california': A([260, 9, 38, 7, 600], 'Mains', '8 pieces', 'california roll'),
  'maki.spicy-salmon': A([300, 13, 38, 10, 650], 'Mains', '8 pieces', 'spicy salmon roll'),
  'maki.spicy-tuna': A([290, 14, 38, 9, 650], 'Mains', '8 pieces', 'spicy tuna roll'),
  'maki.salmon-avocado': A([300, 12, 40, 10, 550], 'Mains', '8 pieces', 'salmon avocado roll'),
  'maki.small': A([190, 9, 32, 2, 400], 'Mains', '6 pieces', 'salmon roll'),
  'maki.veg': A([190, 3, 36, 4, 420], 'Mains', '6 pieces', 'avocado roll'),
  'maki.tempura': A([500, 15, 64, 20, 1000], 'Mains', '8 pieces', 'shrimp tempura roll'),
  'maki.dynamite': A([520, 16, 64, 22, 1100], 'Mains', '8 pieces', 'dynamite roll'),
  'maki.dragon': A([520, 18, 60, 22, 1100], 'Mains', '8 pieces', 'dragon roll'),
  'maki.rainbow': A([470, 22, 58, 16, 1000], 'Mains', '8 pieces', 'rainbow roll'),
  'maki.special': A([560, 20, 66, 23, 1150], 'Mains', '8 pieces', 'special sushi roll'),
  'maki.crispy': A([600, 18, 70, 27, 1200], 'Mains', '8 pieces', 'crispy sushi roll'),
  'nigiri.pc': A([65, 4, 9, 1, 150], 'Mains', '1 piece', 'salmon nigiri'),
  'sashimi.pc': A([40, 6, 0, 1.5, 15], 'Mains', '1 piece', 'salmon sashimi'),
  'sushi.combo': A([620, 30, 92, 12, 1400], 'Mains', '1 combo', 'sushi combo'),
  'sushi.boat': A([1400, 70, 200, 30, 3000], 'Mains', '1 boat (share)', 'sushi platter'),
  'jp.bento': A([900, 40, 110, 30, 2200], 'Mains', '1 box', 'chicken teriyaki bento'),
  'jp.teriyaki': A([750, 40, 90, 22, 1800], 'Mains', 'with rice', 'chicken teriyaki'),
  'jp.udon': A([520, 20, 85, 9, 2400], 'Mains', '1 bowl', 'udon noodle soup'),
  'jp.yaki-noodle': A([700, 26, 90, 24, 1900], 'Mains', '1 plate', 'yaki udon'),
  'jp.poke': A([650, 32, 75, 22, 1400], 'Bowls & Burritos', '1 bowl', 'salmon poke bowl'),
  'jp.donburi-fish': A([700, 35, 95, 16, 1200], 'Bowls & Burritos', '1 bowl', 'salmon rice bowl'),
  'jp.inari': A([300, 7, 50, 8, 600], 'Sides', '3 pieces', 'inari'),

  // --- Korean ---------------------------------------------------------------------------------------
  'kr.bibimbap': A([750, 30, 95, 26, 1500], 'Bowls & Burritos', '1 bowl', 'bibimbap'),
  'kr.bulgogi-bowl': A([780, 36, 95, 26, 1600], 'Bowls & Burritos', '1 bowl', 'bulgogi rice bowl'),
  'kr.chicken-bowl': A([900, 38, 100, 36, 1600], 'Bowls & Burritos', '1 bowl', 'crispy chicken mayo rice bowl'),
  'kr.japchae-bowl': A([650, 18, 100, 20, 1300], 'Bowls & Burritos', '1 bowl', 'japchae noodle bowl'),
  'kr.fried-chicken': A([1300, 55, 120, 65, 2600], 'Chicken', '1 order', 'korean glazed fried chicken'),
  'kr.tteokbokki': A([700, 15, 140, 8, 2200], 'Mains', '1 order', 'tteokbokki'),
  'kr.gimbap': A([480, 15, 80, 10, 900], 'Mains', '10 pieces', 'gimbap'),
  'kr.japchae': A([420, 8, 70, 12, 900], 'Sides', '1 order', 'japchae'),
  'dessert.sesame-balls': A([350, 5, 50, 14, 100], 'Desserts', '5 pieces', 'sesame balls'),

  // --- Bubble tea (regular ~500–700 mL, standard sweetness) ---------------------------------------
  'bt.milk-tea': A([400, 4, 72, 9, 90], 'Drinks', 'regular', 'milk tea'),
  'bt.brown-sugar': A([500, 5, 92, 11, 100], 'Drinks', 'regular', 'brown sugar milk tea'),
  'bt.taro': A([450, 4, 80, 11, 120], 'Drinks', 'regular', 'taro milk tea'),
  'bt.matcha': A([420, 5, 70, 12, 110], 'Drinks', 'regular', 'matcha milk tea'),
  'bt.fresh-milk': A([350, 8, 55, 10, 120], 'Drinks', 'regular', 'fresh milk tea'),
  'bt.fruit-tea': A([250, 0, 62, 0, 30], 'Drinks', 'regular', 'fruit tea'),
  'bt.foam-tea': A([380, 5, 58, 14, 200], 'Drinks', 'regular', 'cheese foam tea'),
  'bt.slush': A([380, 3, 85, 3, 80], 'Drinks', 'regular', 'slush'),
  'bt.yakult': A([300, 2, 70, 1, 60], 'Drinks', 'regular', 'yakult green tea'),
  'bt.coffee': A([330, 5, 55, 10, 100], 'Drinks', 'regular', 'milk coffee'),
  'bt.pure-tea': A([5, 0, 1, 0, 10], 'Drinks', 'regular', 'brewed tea'),
  'topping.pearls': A([150, 0, 37, 0, 10], 'Drinks', '1 serving', 'tapioca pearls'),

  // --- Bakery & café ---------------------------------------------------------------------------------
  'donut.yeast': A([260, 4, 31, 14, 270], 'Bakery', '1 doughnut', 'glazed doughnut'),
  'donut.filled': A([350, 5, 45, 17, 300], 'Bakery', '1 doughnut', 'filled doughnut'),
  'donut.cake': A([320, 4, 38, 17, 330], 'Bakery', '1 doughnut', 'cake doughnut'),
  'donut.specialty': A([420, 5, 54, 21, 330], 'Bakery', '1 doughnut', 'specialty doughnut'),
  'donut.mini': A([45, 1, 6, 2, 45], 'Bakery', '1 piece', 'mini doughnut'),
  'pastry.croissant': A([270, 5, 30, 14, 300], 'Bakery', '1 croissant', 'butter croissant'),
  'pastry.filled-croissant': A([400, 8, 40, 23, 320], 'Bakery', '1 croissant', 'almond croissant'),
  'pastry.danish': A([350, 5, 40, 19, 300], 'Bakery', '1 pastry', 'danish'),
  'pastry.tart': A([350, 5, 42, 18, 150], 'Desserts', '1 tart', 'fruit tart'),
  'pastry.cake': A([450, 5, 55, 24, 350], 'Desserts', '1 slice', 'cake'),
  'pastry.cheesecake': A([450, 7, 35, 32, 330], 'Desserts', '1 slice', 'cheesecake'),
  'pastry.macaron': A([90, 2, 12, 4, 15], 'Desserts', '1 macaron', 'macaron'),
  'pastry.cookie': A([220, 2, 30, 10, 170], 'Desserts', '1 cookie', 'cookie'),
  'pastry.muffin': A([400, 6, 55, 17, 380], 'Bakery', '1 muffin', 'muffin'),
  'pastry.scone': A([380, 7, 50, 17, 500], 'Bakery', '1 scone', 'scone'),
  'pastry.brownie': A([350, 4, 45, 18, 180], 'Desserts', '1 brownie', 'brownie'),
  'pastry.waffle': A([480, 8, 60, 23, 450], 'Desserts', '1 waffle', 'waffle with toppings'),
  'pastry.crepe': A([520, 9, 70, 22, 300], 'Desserts', '1 crêpe', 'nutella crepe'),
  'lokma.serving': A([520, 6, 66, 26, 180], 'Desserts', '1 serving', 'lokma with chocolate'),
  'bagel.plain': A([280, 11, 56, 2, 520], 'Bakery', '1 bagel', 'bagel'),
  'bagel.cream-cheese': A([380, 13, 58, 11, 640], 'Bakery', '1 bagel', 'bagel with cream cheese'),
  'bagel.sandwich': A([560, 26, 62, 22, 1150], 'Breakfast', '1 sandwich', 'egg and cheese bagel'),
  'bagel.lox': A([480, 24, 60, 15, 1400], 'Breakfast', '1 sandwich', 'smoked salmon bagel'),
  'bagel.lunch': A([620, 32, 64, 24, 1500], 'Sandwiches', '1 sandwich', 'turkey bagel sandwich'),
  'cafe.sandwich': A([520, 24, 50, 24, 1100], 'Sandwiches', '1 sandwich', 'cafe sandwich'),
  'cafe.quiche': A([450, 15, 25, 32, 600], 'Breakfast', '1 slice', 'quiche lorraine'),
  'cafe.salad': A([380, 12, 26, 26, 650], 'Salads', '1 salad', 'cafe salad'),
  'cafe.soup': A([220, 8, 26, 9, 900], 'Mains', '1 bowl', 'soup'),
  'cafe.breakfast-plate': A([720, 30, 60, 40, 1500], 'Breakfast', '1 plate', 'breakfast plate'),
  'coffee.drip': A([5, 0, 1, 0, 5], 'Coffee', 'medium', 'coffee'),
  'coffee.espresso': A([10, 1, 1, 0, 5], 'Coffee', 'double', 'espresso'),
  'coffee.americano': A([15, 1, 2, 0, 10], 'Coffee', 'medium', 'americano'),
  'coffee.cappuccino': A([140, 8, 12, 6, 115], 'Coffee', 'medium', 'cappuccino'),
  'coffee.latte': A([190, 12, 19, 7, 170], 'Coffee', 'medium', 'latte'),
  'coffee.flavoured-latte': A([280, 11, 38, 8, 160], 'Coffee', 'medium', 'vanilla latte'),
  'coffee.mocha': A([370, 13, 45, 15, 150], 'Coffee', 'medium', 'mocha'),
  'coffee.chai': A([240, 8, 42, 5, 120], 'Coffee', 'medium', 'chai latte'),
  'coffee.hot-chocolate': A([370, 14, 50, 13, 230], 'Drinks', 'medium', 'hot chocolate'),
  'coffee.tea': A([0, 0, 0, 0, 5], 'Drinks', 'medium', 'tea'),
  'drink.milkshake': A([650, 14, 90, 26, 400], 'Drinks', 'regular', 'milkshake'),
  'drink.smoothie': A([300, 4, 70, 1, 40], 'Drinks', 'regular', 'fruit smoothie'),
  'drink.lemonade': A([200, 0, 52, 0, 20], 'Drinks', 'regular', 'lemonade'),
  'drink.soft': A([140, 0, 39, 0, 30], 'Drinks', '355 mL', 'soft drink'),
  'drink.diet': A([0, 0, 0, 0, 35], 'Drinks', '355 mL', 'diet soft drink'),
  'drink.juice': A([150, 1, 36, 0, 10], 'Drinks', '1 bottle', 'juice'),
  'drink.water': A([0, 0, 0, 0, 0], 'Drinks', '1 bottle', 'water'),
  'drink.beer': A([200, 2, 16, 0, 15], 'Drinks', '16 oz', 'beer'),
  'drink.wine': A([125, 0, 4, 0, 6], 'Drinks', '5 oz', 'wine'),
  'drink.cocktail': A([250, 0, 20, 0, 10], 'Drinks', '1 drink', 'cocktail'),
  'drink.energy': A([170, 0, 42, 0, 280], 'Drinks', '355 mL', 'energy drink'),

  // --- Pizza (per slice; specialty pizzas scale this) -----------------------------------------------
  'pizza.slice': A([290, 12, 33, 12, 700], 'Pizza', '1 slice', 'pepperoni pizza'),
  'pizza.calzone': A([1150, 48, 115, 52, 2500], 'Pizza', '1 calzone', 'calzone'),
  'pizza.panzerotti': A([620, 26, 62, 28, 1300], 'Sandwiches', '1 sandwich', 'panzerotti'),
  'pizza.sticks': A([160, 6, 18, 7, 330], 'Sides', '1 piece', 'cheesy breadsticks'),
  'pizza.garlic-bread': A([180, 5, 22, 8, 330], 'Sides', '1 piece', 'garlic bread'),
  'pizza.dip': A([150, 0, 1, 16, 250], 'Sides', '1 cup', 'dipping sauce'),
  'pizza.dessert-stick': A([90, 1, 14, 3, 80], 'Desserts', '1 piece', 'cinnamon stick'),

  // --- Wings, pub & casual ---------------------------------------------------------------------------
  'wing.pc': A([75, 6.5, 0.5, 5.5, 180], 'Chicken', '1 wing', 'chicken wings'),
  'wing.boneless-pc': A([75, 4.5, 5, 4, 190], 'Chicken', '1 piece', 'boneless wings'),
  'wing.combo': A([1310, 66, 101, 75, 2600], 'Chicken', '1 lb wings, fries & pop', 'chicken wings combo'),
  'wing.sauce': A([60, 0, 8, 3, 500], 'Sides', '1 order', 'wing sauce'),
  'pub.tenders': A([900, 48, 72, 46, 2000], 'Chicken', 'with fries', 'chicken tenders'),
  'pub.burger': A([750, 38, 52, 42, 1300], 'Burgers', '1 burger', 'beef burger'),
  'pub.chicken-burger': A([720, 34, 64, 36, 1600], 'Burgers', '1 burger', 'crispy chicken burger'),
  'pub.veggie-burger': A([600, 22, 66, 26, 1200], 'Burgers', '1 burger', 'veggie burger'),
  'pub.wrap': A([700, 32, 66, 34, 1600], 'Wraps', '1 wrap', 'crispy chicken wrap'),
  'pub.quesadilla': A([820, 38, 60, 46, 1800], 'Mains', '1 order', 'chicken quesadilla'),
  'pub.salad': A([800, 46, 30, 54, 1500], 'Salads', '1 salad', 'chicken caesar salad'),
  'pub.side-salad': A([300, 6, 12, 25, 550], 'Salads', 'side', 'caesar salad'),
  'pub.nachos': A([1400, 44, 120, 80, 2600], 'Sides', 'shareable', 'loaded nachos'),
  'pub.mozza': A([600, 26, 50, 32, 1400], 'Sides', '1 order', 'mozzarella sticks'),
  'pub.onion-rings': A([480, 6, 54, 26, 800], 'Sides', 'regular', 'onion rings'),
  'pub.fries': A([420, 5, 56, 20, 470], 'Sides', 'regular', 'fries'),
  'pub.sweet-fries': A([450, 4, 60, 22, 400], 'Sides', 'regular', 'sweet potato fries'),
  'pub.loaded-fries': A([900, 28, 70, 56, 1900], 'Sides', 'regular', 'loaded fries'),
  'pub.dip': A([450, 12, 30, 32, 900], 'Sides', 'shareable', 'spinach dip'),
  'pub.pickles': A([400, 4, 36, 26, 1500], 'Sides', '1 order', 'fried pickles'),
  'pub.sandwich': A([850, 40, 75, 42, 2000], 'Sandwiches', 'with fries', 'club sandwich'),
  'pub.mains-chicken': A([800, 55, 60, 36, 1600], 'Mains', 'with sides', 'grilled chicken dinner'),
  'pub.steak': A([1050, 62, 60, 60, 1300], 'Mains', 'with sides', 'steak dinner'),
  'pub.ribs': A([1200, 60, 70, 75, 2400], 'Mains', 'with sides', 'bbq ribs dinner'),
  'pub.ribs-full': A([1700, 90, 90, 105, 3400], 'Mains', 'with sides', 'bbq ribs dinner'),
  'pub.salmon': A([800, 45, 55, 42, 1100], 'Mains', 'with sides', 'salmon dinner'),
  'pub.pasta': A([1000, 38, 105, 46, 1800], 'Mains', '1 plate', 'chicken alfredo pasta'),
  'pub.tomato-pasta': A([850, 36, 105, 30, 1700], 'Mains', '1 plate', 'spaghetti bolognese'),
  'pub.risotto': A([750, 18, 90, 34, 1300], 'Mains', '1 plate', 'mushroom risotto'),
  'pub.soup': A([250, 9, 24, 13, 1000], 'Mains', '1 bowl', 'soup'),
  'pub.chili': A([380, 26, 30, 17, 1200], 'Mains', '1 bowl', 'chili'),
  'pub.dessert': A([750, 9, 90, 38, 450], 'Desserts', '1 dessert', 'chocolate cake'),
  'pub.kids': A([540, 22, 60, 22, 1000], 'Mains', "kids' meal", 'kids chicken strips'),
  'pub.poutine': A([750, 18, 70, 42, 1550], 'Sides', 'regular', 'poutine'),
  'pub.loaded-poutine': A([1000, 40, 72, 60, 2300], 'Sides', 'regular', 'loaded poutine'),
  'pub.brunch': A([850, 32, 75, 45, 1700], 'Breakfast', '1 plate', 'eggs benedict'),
  'pub.pancakes': A([750, 16, 110, 26, 1400], 'Breakfast', '1 plate', 'pancakes'),

  // --- Tex-Mex -----------------------------------------------------------------------------------------
  'tex.fajitas': A([900, 52, 78, 38, 2200], 'Mains', 'with tortillas', 'chicken fajitas'),
  'tex.burrito': A([950, 45, 100, 40, 2200], 'Bowls & Burritos', '1 burrito', 'chicken burrito'),
  'tex.bowl': A([750, 40, 85, 26, 1800], 'Bowls & Burritos', '1 bowl', 'burrito bowl'),
  'tex.enchiladas': A([900, 42, 70, 50, 2100], 'Mains', 'with sides', 'chicken enchiladas'),
  'tex.tacos': A([650, 32, 55, 32, 1300], 'Bowls & Burritos', '3 tacos', 'chicken tacos'),
  'tex.taco-salad': A([720, 30, 56, 40, 1500], 'Salads', '1 salad', 'taco salad'),
  'tex.chips-salsa': A([450, 6, 60, 22, 700], 'Sides', '1 order', 'chips and salsa'),
  'tex.queso': A([650, 18, 60, 38, 1500], 'Sides', '1 order', 'queso and chips'),
  'tex.guac': A([700, 9, 64, 46, 900], 'Sides', '1 order', 'guacamole and chips'),
  'tex.rice': A([250, 4, 46, 5, 600], 'Sides', 'side', 'mexican rice'),
  'tex.beans': A([220, 12, 32, 4, 700], 'Sides', 'side', 'refried beans'),

  // --- Fish & chips ------------------------------------------------------------------------------------
  'fish.and-chips': A([1000, 40, 100, 48, 1600], 'Mains', '1 piece with fries', 'fish and chips'),
  'fish.piece': A([380, 30, 22, 20, 600], 'Mains', '1 piece', 'battered fish'),
  'fish.shrimp': A([800, 28, 90, 36, 1700], 'Mains', 'with fries', 'fried shrimp and chips'),
  'fish.clams': A([750, 22, 90, 34, 1500], 'Mains', 'with fries', 'clam strips and chips'),
  'fish.chowder': A([300, 12, 20, 18, 900], 'Mains', '1 bowl', 'seafood chowder'),
  'fish.burger': A([600, 24, 60, 28, 1100], 'Sandwiches', '1 burger', 'fish burger'),
  'fish.tartar': A([140, 0, 4, 14, 200], 'Sides', '1 cup', 'tartar sauce'),

  // --- Deli -------------------------------------------------------------------------------------------
  'deli.smoked-meat': A([700, 45, 50, 35, 2600], 'Sandwiches', '1 sandwich', 'smoked meat sandwich'),
  'deli.reuben': A([900, 48, 52, 55, 3000], 'Sandwiches', '1 sandwich', 'reuben sandwich'),
  'deli.sandwich': A([620, 32, 55, 28, 1700], 'Sandwiches', '1 sandwich', 'deli sandwich'),
  'deli.platter': A([1200, 60, 110, 58, 3600], 'Mains', 'with fries & slaw', 'smoked meat platter'),
  'deli.poutine': A([1050, 42, 74, 64, 2900], 'Sides', 'regular', 'smoked meat poutine'),

  // --- Vietnamese / Thai / pan-Asian --------------------------------------------------------------------
  'viet.pho': A([480, 30, 62, 10, 2000], 'Mains', 'regular bowl', 'beef pho'),
  'viet.vermicelli': A([650, 30, 85, 20, 1400], 'Bowls & Burritos', '1 bowl', 'grilled pork vermicelli'),
  'viet.banh-mi': A([550, 25, 65, 18, 1200], 'Sandwiches', '1 sandwich', 'banh mi'),
  'viet.rice-plate': A([750, 38, 95, 22, 1600], 'Mains', '1 plate', 'lemongrass chicken rice'),
  'viet.fresh-roll': A([180, 6, 30, 4, 400], 'Sides', '2 rolls', 'fresh spring rolls'),
  'asian.curry': A([800, 30, 90, 34, 1700], 'Mains', 'with rice', 'thai curry'),
  'asian.pad-thai': A([900, 30, 110, 35, 1800], 'Mains', '1 plate', 'pad thai'),
  'asian.stir-fry': A([700, 32, 90, 22, 1900], 'Mains', '1 plate', 'stir fry'),
  'asian.fried-rice': A([750, 26, 100, 26, 1800], 'Mains', '1 plate', 'fried rice'),
  'indian.butter-chicken': A([890, 45, 88, 38, 1600], 'Mains', 'with rice', 'butter chicken'),

  // --- Healthy bowls & salads ------------------------------------------------------------------------------
  'healthy.bowl': A([620, 32, 62, 26, 1100], 'Bowls & Burritos', '1 bowl', 'chicken grain bowl'),
  'healthy.veg-bowl': A([560, 20, 66, 24, 1000], 'Bowls & Burritos', '1 bowl', 'tofu grain bowl'),
  'healthy.salad': A([480, 28, 26, 30, 900], 'Salads', '1 salad', 'chicken salad'),
  'healthy.wrap': A([600, 32, 55, 27, 1300], 'Wraps', '1 wrap', 'chicken wrap'),
  'healthy.soup': A([240, 8, 30, 9, 900], 'Mains', '1 bowl', 'soup'),
}

/** Scale a reference nutrition by `k`. */
export function scaled(a: Archetype, k: number): Nutrition {
  const [cal, p, c, f, na] = a.n
  return { calories: Math.round(cal * k), protein: Math.round(p * k), carbs: Math.round(c * k), fat: Math.round(f * k), sodium: Math.round(na * k) }
}

/** The archetype's macro balance at a given calorie count (for posted-calorie items). */
export function atCalories(a: Archetype, calories: number): Nutrition {
  const base = a.n[0] || 1
  const n = scaled(a, calories / base)
  n.calories = Math.round(calories)
  return n
}
