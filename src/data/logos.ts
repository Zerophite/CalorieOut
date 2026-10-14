// Official logo for each restaurant, loaded at runtime (no logo files are
// stored in the repo). Each is the brand's own mark at high resolution: the
// logo or app icon from the restaurant's website, or — for chains whose site
// only offers a tiny favicon (Tim Hortons, Subway, A&W, Burger King, Firehouse
// Subs, Dairy Queen, McDonald's, Pizza Hut, Taco Bell, Harvey's, Swiss Chalet,
// Mary Brown's) — the brand's logo file on Wikimedia. Every entry was checked
// visually.
export const LOGOS: Record<string, string> = {
  '6ixty-wings': "https://6ixtywings.com/wp-content/uploads/2022/11/profile-01-300x300.png",
  aw: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/A%26W_Canada_Logo.svg/500px-A%26W_Canada_Logo.svg.png",
  'bad-radish': "https://www.madradish.com/wp-content/uploads/2022/10/MR-Logo-2022.png",
  'bar-burrito': "https://barburrito.agencydominion.net/uploads/2020/01/cropped-barburrito-favicon-414x414.png",
  'boston-pizza': "https://bostonpizza.com/etc.clientlibs/bostonpizza/clientlibs/clientlib-site/resources/images/favicon/web-app-manifest-512x512.png",
  'burger-king': "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Burger_King_2020.svg/500px-Burger_King_2020.svg.png",
  'chain-smoker-bbq': "https://chainsmoker.ca/wp-content/uploads/fbrfg/apple-touch-icon.png?v=M4KAerv5Yp",
  'chicha-san-chen': "https://chichasanchen.ca/img/chichasanchen-logo-en.jpg",
  coco: "https://static.wixstatic.com/media/101c9c_03fd4b09de66445d9f1d9ddc71bc442a%7Emv2.png/v1/fill/w_192%2Ch_192%2Clg_1%2Cusm_0.66_1.00_0.01/101c9c_03fd4b09de66445d9f1d9ddc71bc442a%7Emv2.png",
  'dairy-queen': "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Dairy_Queen_logo.svg/500px-Dairy_Queen_logo.svg.png",
  'firehouse-subs': "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Firehosue_Subs_Logo_2024.png/500px-Firehosue_Subs_Logo_2024.png",
  freshii: "https://freshii.com/wp-content/uploads/2024/01/freshii_favicon_180.png",
  'gabriel-pizza': "https://gabrielpizza.com/wp-content/themes/gabriel-theme/img/favicons/android-chrome-192x192.png",
  'halibut-house': "https://irp.cdn-website.com/2076d543/dms3rep/multi/opt/halibut_logo_new+%281%29+copy+%281%29-1920w.png",
  harveys: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/Harvey%27s_logo.svg/500px-Harvey%27s_logo.svg.png",
  kettlemans: "https://www.kettlemansbagels.ca/wp-content/uploads/2024/12/cropped-Screenshot-2024-12-22-at-1.02.29%E2%80%AFPM-180x180.png",
  kfc: "https://images.ctfassets.net/a2mgcrjjefyo/1RHtlfQBulQEbCq2w2NJ7w/8fd9a53869d65bff664f39b8d0a457af/kfc_logo_icon.svg",
  'kinton-ramen': "https://kintonramen.com/wp-content/uploads/2024/10/kinton_favicon-300x300.jpg",
  kochu: "https://www.kochu.ca/uploads/b/c23702c0-5db7-11ec-b02b-cf5d84270820/icon_180x180_ios_Nzg5OD.png?width=180",
  'little-caesars': "https://littlecaesars.ca/icon-512x512.png",
  lokma: "https://static.wixstatic.com/media/ef0612_2ccafa09da364f56bd6bd00e92473969%7Emv2.gif/v1/fill/w_192%2Ch_192%2Clg_1%2Cusm_0.66_1.00_0.01/ef0612_2ccafa09da364f56bd6bd00e92473969%7Emv2.gif",
  'lone-star': "https://lonestartexasgrill.com/build/images/page/favicon.e44de31a.png",
  'manchu-wok': "https://manchuwok.com/wp-content/uploads/2026/02/cropped-cropped-512x512-WOK-image-transparent-192x192.png",
  'mary-browns': "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Marybrowns-2021-logo.svg/500px-Marybrowns-2021-logo.svg.png",
  mcdonalds: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/500px-McDonald%27s_Golden_Arches.svg.png",
  moes: "https://images.ctfassets.net/zqt8tllj2cy0/2gtyLmJDfeDReSOwpJ6euF/2f491e0e84a66b0e7dbc44e8f91d3557/Moes_LOGO.svg",
  'mr-shawarma': "https://mrshawarma.ca/wp-content/uploads/2025/11/Logo-Mr-Shawarma-06.png",
  'mucho-burrito': "https://muchoburrito.com/wp-content/uploads/2024/05/fav-icon-300x300.png",
  'noodle-box': "https://noodlebox.ca/wp-content/uploads/2026/06/NBX_LOGO_2020.png",
  osmows: "https://framerusercontent.com/images/hhHzUN89Q1R2Ut7HkUrGBRs6GA.png",
  'pita-bell': "https://betterresto.s3.us-west-1.wasabisys.com/production/13345/logo_9e8cc084b8.jpg",
  'pita-pit': "https://pitapit.ca/wp-content/uploads/2022/01/pita-pit-logo-retina-4.jpg",
  'pizza-hut': "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Pizza_Hut_2025.svg/500px-Pizza_Hut_2025.svg.png",
  'red-swan-pizza': "https://redswanpizza.ca/images/logo.png",
  'rock-n-deli': "https://static.tildacdn.one/tild6438-3731-4431-a433-343461333463/Logo_Affiche_RND_1.png",
  'sansotei-ramen': "https://static.wixstatic.com/media/a0c5d8_98c7fc6d9efa4655ba39012bedf5fa1b%7Emv2.png/v1/fill/w_180%2Ch_180%2Clg_1%2Cusm_0.66_1.00_0.01/a0c5d8_98c7fc6d9efa4655ba39012bedf5fa1b%7Emv2.png",
  'shawarma-prince': "https://shawarmaprince.com/wp-content/uploads/2026/06/Shawarma-Prince-Logo-300x300.png",
  'shelbys-shawarma': "https://cdn.prod.website-files.com/69233a0782977e6bf5f00df5/6940a333e17c6c58f8e3782d_Webclip.png",
  'st-louis': "https://www.stlouiswings.com/wp-content/uploads/2026/06/cropped-cropped-SLBG-Monogram-800px-180x180.png",
  starbucks: "https://www.starbucks.ca/apple-touch-icon.png",
  'streats-kitchen': "https://streatskitchens.com/wp-content/uploads/2020/08/cropped-cropped-streats-logo-512x512-32x32-1-180x180.png",
  subway: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Subway_2016_logo.svg/500px-Subway_2016_logo.svg.png",
  'sushi-eki': "https://sushieki.ca/wp-content/uploads/2022/05/logo.png",
  'sushi-sama': "https://www.sushisama.com/android-chrome-512x512.png",
  'suzy-q': "https://img.pagecloud.com/0OMZJ0Id6okWtp5xGzz3pByyYNo=/250x250/filters:no_upscale()/pagecloud-sites/suzyq/images/favicon-f9dd624a-362e-487a-bb56-7de4f2c94b2d.png",
  'swiss-chalet': "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Swiss_Chalet_wordmark.svg/500px-Swiss_Chalet_wordmark.svg.png",
  'taco-bell': "https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Taco_Bell_2023.svg/500px-Taco_Bell_2023.svg.png",
  tahinis: "https://tahinis.com/wp-content/uploads/2025/06/cropped-Tahinis-Favicon-180x180.png",
  tartelette: "https://static.wixstatic.com/media/4ab16f_4b0fca8c2d7a49bb9f04e8e3612176a7~mv2.png/v1/fill/w_132,h_56,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo%20revision%20white%20transparent.png",
  'tea-live': "https://tealive.ca/wp-content/uploads/2022/01/Favicon-Apple-Tealive.png",
  'thai-express': "https://thaiexpress.ca/wp-content/uploads/2021/11/cropped-logo.png",
  'the-works': "https://worksburger.com/wp-content/uploads/elementor/thumbs/THE-WORKS-LOGO-04-2-scaled-r8urr6fysnw3r8i3qeokjamqrjlemsm21ut73pjahc.png",
  'three-brothers': "https://www.3brothersshawarma.com/wp-content/uploads/2021/07/cropped-favicon-180x180.png",
  'tim-hortons': "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Tim_Hortons_Logo.svg/500px-Tim_Hortons_Logo.svg.png",
  'toppers-pizza': "https://toppers.ca/images/favicon-196.png",
  'turkish-kebab-house': "https://static.wixstatic.com/media/0c146d_1a0eaf7a68cf4dcaa8e6597884c67198%7Emv2.png/v1/fill/w_300%2Ch_300%2Clg_1%2Cusm_0.66_1.00_0.01/0c146d_1a0eaf7a68cf4dcaa8e6597884c67198%7Emv2.png",
  wendys: "https://www.wendys.com/themes/custom/wendys_main/favicons/apple-touch-icon-180x180.png",
  'wing-up': "https://wingsup.com/WingsUp/media/images/logo_Main-Logo.svg",
  zolas: "https://zolas.ca/wp-content/uploads/2024/02/cropped-ZOLAS.png",
}

/** Logos drawn in white, shown on a dark tile. */
export const DARK_LOGOS = new Set(['the-works'])

// No logo: these spots publish none of their own (their sites use a site
// builder's default icon), so they show the initials badge instead:
//   koichi-ramen, kuma-takumi, windbell-sushi, green-leaf.
