// Maps each restaurant id to its verified official website domain. Logos are
// loaded at runtime from Google's favicon service keyed on this domain (so the
// icon is always that brand's own mark), with a styled-badge fallback — no
// copyrighted logo files are stored in the repo.
//
// Every entry below was verified two ways: the domain against the brand's
// official site, and the returned icon visually, to confirm it is the brand's
// own mark and not a generic placeholder (Google's default globe, or a site
// builder's default icon such as Wix or WordPress).
export const LOGO_DOMAINS: Record<string, string> = {
  // Build-your-own
  'bar-burrito': 'barburrito.ca',
  subway: 'subway.com',
  freshii: 'freshii.com',
  'mucho-burrito': 'muchoburrito.com',
  'pita-pit': 'pitapit.ca',
  // Fast food
  mcdonalds: 'mcdonalds.com',
  aw: 'web.aw.ca',
  harveys: 'harveys.ca',
  wendys: 'wendys.com',
  kfc: 'kfc.ca',
  'burger-king': 'burgerking.ca',
  'taco-bell': 'tacobell.ca',
  'pizza-hut': 'pizzahut.ca',
  'little-caesars': 'littlecaesars.ca',
  'dairy-queen': 'dairyqueen.com',
  'mary-browns': 'marybrowns.com',
  'thai-express': 'thaiexpress.ca',
  'manchu-wok': 'manchuwok.com',
  'firehouse-subs': 'firehousesubs.ca',
  // Coffee, bakery & desserts
  'tim-hortons': 'timhortons.ca',
  starbucks: 'starbucks.ca',
  coco: 'cocobubbletea.ca',
  'tea-live': 'tealive.ca',
  'suzy-q': 'suzyq.ca',
  kettlemans: 'kettlemansbagels.ca',
  lokma: 'lokma.ca',
  // Sit-down
  'swiss-chalet': 'swisschalet.com',
  'boston-pizza': 'bostonpizza.com',
  'lone-star': 'lonestartexasgrill.com',
  'st-louis': 'stlouiswings.com',
  zolas: 'zolas.ca',
  // Shawarma / Mediterranean
  osmows: 'osmows.com',
  tahinis: 'tahinis.com',
  'shawarma-prince': 'shawarmaprince.com',
  'three-brothers': '3brothersshawarma.com',
  'mr-shawarma': 'mrshawarma.ca',
  'shelbys-shawarma': 'shelbys.ca',
  'chain-smoker-bbq': 'chainsmoker.ca',
  // Ramen & sushi
  'kinton-ramen': 'kintonramen.com',
  'sansotei-ramen': 'sansotei.com',
  'sushi-sama': 'sushisama.com',
  // Pizza (local chains)
  'gabriel-pizza': 'gabrielpizza.com',
  'red-swan-pizza': 'redswanpizza.ca',
  'toppers-pizza': 'toppers.ca',
  // Wings
  'wing-up': 'wingsup.com',
  '6ixty-wings': '6ixtywings.com',
  // Other
  'halibut-house': 'halibuthouse.ca',
  moes: 'moes.com',
  'rock-n-deli': 'rockndeli.com',
  'bad-radish': 'madradish.com',
  'streats-kitchen': 'streats.ca',
  'noodle-box': 'noodlebox.ca',
}

// Deliberately NOT mapped — these publish no brand icon on their website, so a
// logo service can only return a generic placeholder. They show the styled
// badge (name initials in brand colour) instead of a wrong icon:
//   koichi-ramen (koichiramen.com), kuma-takumi (kumatakumi.com, Wix default),
//   windbell-sushi (sushiwindbell.ca, POS-template icon), sushi-eki
//   (sushieki.ca, WordPress default), chicha-san-chen (chichasanchen.ca),
//   tartelette (tartelette.ca, Wix default), the-works (worksburger.com),
//   green-leaf (no verifiable Ottawa site).
