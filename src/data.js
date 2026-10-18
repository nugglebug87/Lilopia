/* LILOPIA content catalog. Pure data: no DOM, no drawing.
   Art for each object id lives in art.js; rules that read this data live in logic.js. */
(function (L) {
'use strict';

/* ---------------------------------------------------------------
   Products and entitlements (Sections 11 and 12)
   `available: false` products are listed and previewable but cannot be bought yet,
   because their content has not been built. Nothing here is a placeholder button.
   --------------------------------------------------------------- */
L.PRODUCTS = {
  exp_pet_paradise: { kind: 'expansion', name: 'Pet Paradise', price: '$5.99', productId: 'com.lilopia.expansion.pet_paradise', color: '#f27324', available: false, location: 'petparadise',
    blurb: 'An adoption center, vet clinic, grooming salon and breeding facilities.', includes: ['Pet adoption center', 'Veterinary clinic', 'Grooming salon', 'Panda and fox pets'], content: ['pet:panda', 'pet:fox'] },
  exp_farm_life: { kind: 'expansion', name: 'Farm Life', price: '$5.99', productId: 'com.lilopia.expansion.farm_life', color: '#d9573b', available: false, location: 'farm',
    blurb: 'A farmhouse, barn, livestock, fields and farming equipment.', includes: ['Farmhouse', 'Barn and animals', 'Crop fields', 'Tractor'], content: [] },
  exp_dream_mansion: { kind: 'expansion', name: 'Dream Mansion', price: '$5.99', productId: 'com.lilopia.expansion.dream_mansion', color: '#a25cff', available: true, location: 'mansion',
    blurb: 'A luxury mansion with a castle bed, grand piano, sparkle fountain and fancy walls and floors.', includes: ['Dream Mansion location', 'Castle bed', 'Grand piano', 'Sparkle fountain', 'Gold damask walls and marble floors'], content: ['castlebed', 'piano', 'fountain', 'wall:damask', 'floor:marble'] },
  exp_magical_gardens: { kind: 'expansion', name: 'Magical Gardens', price: '$5.99', productId: 'com.lilopia.expansion.magical_gardens', color: '#2fae6a', available: false, location: 'gardens',
    blurb: 'Greenhouses, botanical gardens, rare plants and flower breeding.', includes: ['Greenhouse', 'Botanical garden', 'Moonflower seeds'], content: ['crop:moonflower'] },
  exp_shopping_district: { kind: 'expansion', name: 'Shopping District', price: '$5.99', productId: 'com.lilopia.expansion.shopping_district', color: '#ff5fa8', available: false, location: 'shopping',
    blurb: 'Clothing stores, restaurants, a beauty salon and specialty shops.', includes: ['Clothing store', 'Restaurant', 'Beauty salon'], content: [] },
  exp_fantasy_kingdom: { kind: 'expansion', name: 'Fantasy Kingdom', price: '$5.99', productId: 'com.lilopia.expansion.fantasy_kingdom', color: '#6d5cff', available: false, location: 'kingdom',
    blurb: 'A castle, magical village, fantasy characters and themed objects.', includes: ['Castle', 'Magical village', 'Fantasy characters'], content: [] },
  exp_beach_vacation: { kind: 'expansion', name: 'Beach Vacation', price: '$5.99', productId: 'com.lilopia.expansion.beach_vacation', color: '#139fd8', available: true, location: 'beach',
    blurb: 'A sunny beach with ocean waves, a bubbly hot tub, an aquarium and beach toys.', includes: ['Beach location', 'Bubble hot tub', 'Aquarium', 'Surfboard', 'Beach umbrella and sandcastle'], content: ['hottub', 'aquarium', 'surfboard', 'umbrella', 'sandcastle'] },
  exp_school_adventures: { kind: 'expansion', name: 'School Adventures', price: '$5.99', productId: 'com.lilopia.expansion.school_adventures', color: '#ffa31f', available: false, location: 'school',
    blurb: 'A school with classrooms, a library, a cafeteria and school activities.', includes: ['Classrooms', 'Library', 'Cafeteria'], content: [] },
  exp_city_life: { kind: 'expansion', name: 'City Life', price: '$5.99', productId: 'com.lilopia.expansion.city_life', color: '#3a6cff', available: true, location: 'city',
    blurb: 'A busy town square with shops, a clock tower, street lamps and an ice cream cart.', includes: ['Town square location', 'Clock tower with real time', 'Street lamps', 'Ice cream cart'], content: ['streetlamp', 'icecream'] },
  exp_winter_wonderland: { kind: 'expansion', name: 'Winter Wonderland', price: '$5.99', productId: 'com.lilopia.expansion.winter_wonderland', color: '#58b6e8', available: false, location: 'winter',
    blurb: 'A snowy village, winter activities and seasonal decorations.', includes: ['Snowy village', 'Ice skating', 'Winter decorations'], content: [] },
  cos_royal: { kind: 'cosmetic', name: 'Royal Dress-Up', price: '$1.99', productId: 'com.lilopia.cosmetic.royal', color: '#e0a400', available: true,
    blurb: 'A gold crown plus princess and knight costumes.', includes: ['Gold crown', 'Princess costume', 'Knight costume'], content: ['acc:crown', 'costume:princess', 'costume:knight'] },
  cos_rainbow_hair: { kind: 'cosmetic', name: 'Rainbow Hair', price: '$0.99', productId: 'com.lilopia.cosmetic.rainbow_hair', color: '#ff5fa8', available: true,
    blurb: 'Rainbow and mint hair colors and a space-buns hairstyle.', includes: ['Rainbow hair color', 'Mint hair color', 'Space buns hairstyle'], content: ['hc:rainbow', 'hc:mint', 'hair:spacebuns'] },
  sea_spring: { kind: 'seasonal', name: 'Spring Blossom', price: '$2.99', productId: 'com.lilopia.seasonal.spring', color: '#ff8fc4', available: true,
    blurb: 'A flower crown and a cherry blossom tree. Yours to keep after spring ends.', includes: ['Flower crown', 'Cherry blossom tree'], content: ['acc:flowercrown', 'blossomtree'] },
};

/* ---------------------------------------------------------------
   World map and locations (Section 3)
   --------------------------------------------------------------- */
L.LOCATIONS = {
  home: { name: 'Starter Family House', short: 'Home', free: true, rooms: ['living', 'kitchen', 'bedroom', 'bathroom', 'backyard'], map: [.2, .64], icon: 'house' },
  playground: { name: 'Community Playground', short: 'Playground', free: true, map: [.38, .8], icon: 'playground' },
  market: { name: 'Neighborhood Market', short: 'Market', free: true, map: [.52, .58], icon: 'market' },
  city: { name: 'City Life', short: 'City', product: 'exp_city_life', map: [.6, .3], icon: 'city' },
  beach: { name: 'Beach Vacation', short: 'Beach', product: 'exp_beach_vacation', map: [.86, .64], icon: 'beach' },
  mansion: { name: 'Dream Mansion', short: 'Mansion', product: 'exp_dream_mansion', map: [.4, .3], icon: 'mansion' },
  petparadise: { name: 'Pet Paradise', short: 'Pets', product: 'exp_pet_paradise', map: [.08, .38], icon: 'pets' },
  farm: { name: 'Farm Life', short: 'Farm', product: 'exp_farm_life', map: [.22, .26], icon: 'farm' },
  gardens: { name: 'Magical Gardens', short: 'Gardens', product: 'exp_magical_gardens', map: [.72, .82], icon: 'gardens' },
  shopping: { name: 'Shopping District', short: 'Shops', product: 'exp_shopping_district', map: [.76, .46], icon: 'shopping' },
  kingdom: { name: 'Fantasy Kingdom', short: 'Kingdom', product: 'exp_fantasy_kingdom', map: [.82, .2], icon: 'kingdom' },
  school: { name: 'School Adventures', short: 'School', product: 'exp_school_adventures', map: [.58, .86], icon: 'school' },
  winter: { name: 'Winter Wonderland', short: 'Winter', product: 'exp_winter_wonderland', map: [.06, .14], icon: 'winter' },
};
L.MAP_ORDER = ['home', 'playground', 'market', 'mansion', 'city', 'beach', 'petparadise', 'farm', 'gardens', 'shopping', 'kingdom', 'school', 'winter'];

/* Each playable scene. House rooms are scenes keyed "home/<room>". */
L.SCENES = {
  'home/living': { label: 'Living room', icon: 'sofa', bg: 'room', horizon: .40, window: true, wall: 'hearts', floor: 'wood' },
  'home/kitchen': { label: 'Kitchen', icon: 'pot', bg: 'room', horizon: .40, window: true, wall: 'mint', floor: 'checker' },
  'home/bedroom': { label: 'Bedroom', icon: 'bed', bg: 'room', horizon: .40, window: true, wall: 'stars', floor: 'carpet' },
  'home/bathroom': { label: 'Bathroom', icon: 'bath', bg: 'room', horizon: .40, window: false, wall: 'tiles', floor: 'tile' },
  'home/backyard': { label: 'Backyard', icon: 'sprout', bg: 'yard', horizon: .44 },
  playground: { label: 'Community Playground', bg: 'park', horizon: .47 },
  market: { label: 'Neighborhood Market', bg: 'market', horizon: .42 },
  beach: { label: 'Beach Vacation', bg: 'beach', horizon: .52 },
  city: { label: 'City Life', bg: 'town', horizon: .5 },
  mansion: { label: 'Dream Mansion', bg: 'room', horizon: .38, window: true, wall: 'damask', floor: 'marble', chandelier: true },
};

L.WALLS = {
  hearts: { name: 'Heart stripes', base: '#f4e6ff', pattern: 'hearts', accent: '#ffaad7' },
  mint: { name: 'Mint stripes', base: '#ddf7ee', pattern: 'stripes', accent: '#ffffff' },
  stars: { name: 'Starry pink', base: '#ffe4f1', pattern: 'stars', accent: '#ffd36b' },
  tiles: { name: 'Blue tiles', base: '#dff1ff', pattern: 'grid', accent: '#ffffff' },
  sunny: { name: 'Sunny dots', base: '#fff3c9', pattern: 'dots', accent: '#ffc533' },
  sky: { name: 'Cloudy sky', base: '#d6ecff', pattern: 'clouds', accent: '#ffffff' },
  plain: { name: 'Soft lilac', base: '#ece2ff', pattern: 'none', accent: '#ffffff' },
  damask: { name: 'Gold damask', base: '#fbe9d4', pattern: 'damask', accent: '#e3b65f', product: 'exp_dream_mansion' },
};
L.FLOORS = {
  wood: { name: 'Honey wood', a: '#eebf8e', b: '#d9975f', pattern: 'planks' },
  light: { name: 'Light wood', a: '#f6dcb8', b: '#e6bd8c', pattern: 'planks' },
  checker: { name: 'Checker tile', a: '#ffffff', b: '#ffd1e6', pattern: 'checker' },
  tile: { name: 'Pool tile', a: '#e7f7ff', b: '#bfe3f7', pattern: 'grid' },
  carpet: { name: 'Lilac carpet', a: '#e5d4ff', b: '#cbb2f5', pattern: 'none' },
  mint: { name: 'Mint carpet', a: '#d6f6e8', b: '#b3e6cf', pattern: 'none' },
  marble: { name: 'Marble', a: '#ffffff', b: '#e9e3f2', pattern: 'marble', product: 'exp_dream_mansion' },
};

/* ---------------------------------------------------------------
   Objects. kind: 'furniture' sits on the floor; 'prop' is small and can be carried,
   held, stored, placed on surfaces or put in the bag.
   use/seats: where and how a character uses it (pose).
   container: storage or cooking station; stock items are unlimited.
   --------------------------------------------------------------- */
const WOODC = '#d79a63';
L.OBJECTS = {
  /* ---- living room ---- */
  sofa: { name: 'Comfy Sofa', cat: 'sofas', w: 170, h: 96, use: 'sit', seats: [[-36, -48], [36, -48]], colors: ['#ff8fc4', '#8fd0ff', '#b9a3ff', '#ffd36b', '#7ee0b5'] },
  armchair: { name: 'Armchair', cat: 'chairs', w: 92, h: 92, use: 'sit', seats: [[0, -42]], colors: ['#b9a3ff', '#ff8fc4', '#7ee0b5', '#ffd36b'] },
  coffeetable: { name: 'Coffee Table', cat: 'tables', w: 124, h: 70, surface: { y: 52, w: 100 }, colors: [WOODC, '#ffffff', '#9fd8ff', '#ffb3d1'] },
  tv: { name: 'Cartoon TV', cat: 'appliances', w: 120, h: 112, toggle: true, colors: ['#4a4e69', '#ff8fc4', '#ffffff', '#7ee0b5'], light: { y: -70, r: 120, tint: '150,190,255' } },
  lamp: { name: 'Glow Lamp', cat: 'lighting', w: 54, h: 132, toggle: true, colors: ['#ffd36b', '#ff9fc9', '#9fe0ff', '#b9a3ff'], light: { y: -104, r: 170 } },
  bookshelf: { name: 'Bookshelf', cat: 'storage', w: 100, h: 150, colors: [WOODC, '#ffffff', '#ffb3d1', '#9fd8ff'] },
  rug: { name: 'Round Rug', cat: 'decorations', w: 176, h: 56, floor: true, colors: ['#ffb8d9', '#bfe6ff', '#d5c4ff', '#ffe49a'] },
  plant: { name: 'Leafy Plant', cat: 'decorations', w: 64, h: 100, colors: ['#ee8f63', '#ffffff', '#7fb7ff', '#ff9fc9'] },
  toybox: { name: 'Toy Box', cat: 'storage', w: 96, h: 70, open: true, container: { accepts: ['toy'], max: 12, stock: ['teddy', 'blocks', 'ball', 'duck'] }, colors: ['#ffc533', '#ff8fc4', '#7ee0b5'] },
  /* ---- kitchen ---- */
  fridge: { name: 'Fridge', cat: 'appliances', w: 84, h: 168, open: true, container: { accepts: ['food', 'drink'], max: 16, stock: ['milk', 'cheese', 'egg', 'bread', 'flour'] }, colors: ['#e8f3ff', '#ffd1e6', '#c9f2df'] },
  stove: { name: 'Stove', cat: 'appliances', w: 100, h: 104, container: { accepts: ['ingredient'], max: 3, station: 'stove' }, use: 'cook', seats: [[0, 10]], colors: ['#ffffff', '#ffe08a', '#b9e3ff'] },
  counter: { name: 'Kitchen Cabinet', cat: 'storage', w: 110, h: 92, open: true, surface: { y: 88, w: 96 }, container: { accepts: ['food', 'drink', 'toy', 'tool', 'clothing'], max: 10 }, colors: ['#ffffff', '#ffd1e6', '#c9f2df', '#d7c6ff'] },
  sink: { name: 'Kitchen Sink', cat: 'appliances', w: 110, h: 104, toggle: true, colors: ['#ffffff', '#c9f2df'] },
  diningtable: { name: 'Dining Table', cat: 'tables', w: 150, h: 78, surface: { y: 64, w: 130 }, colors: [WOODC, '#ffffff', '#ffb3d1'] },
  chair: { name: 'Chair', cat: 'chairs', w: 56, h: 100, use: 'sit', seats: [[0, -40]], colors: [WOODC, '#ff8fc4', '#8fd0ff', '#ffffff'] },
  toaster: { name: 'Toaster', cat: 'appliances', kind: 'prop', w: 44, h: 36, tags: ['appliance'], container: { accepts: ['bread'], max: 1, station: 'toaster' }, colors: ['#ff8fc4', '#9fd8ff', '#ffd36b'] },
  blender: { name: 'Blender', cat: 'appliances', kind: 'prop', w: 34, h: 56, tags: ['appliance'], container: { accepts: ['fruit', 'milk'], max: 3, station: 'blender' }, colors: ['#7ee0b5', '#ff8fc4', '#b9a3ff'] },
  petfood: { name: 'Pet Food Bin', cat: 'petcare', w: 56, h: 66, open: true, container: { accepts: [], max: 0, stock: ['kibble'] }, colors: ['#ffc533', '#8fd0ff'] },
  foodbowl: { name: 'Pet Bowl', cat: 'petcare', w: 48, h: 22, colors: ['#ff8fc4', '#8fd0ff', '#ffd36b'] },
  /* ---- bedroom ---- */
  bed: { name: 'Cozy Bed', cat: 'beds', w: 176, h: 108, use: 'sleep', seats: [[-40, -62]], colors: ['#a98bff', '#ff9fc9', '#7cc8ff', '#8de0b0'] },
  crib: { name: 'Baby Crib', cat: 'beds', w: 110, h: 96, use: 'sleep', seats: [[-26, -44]], babyOnly: true, colors: ['#ffffff', '#ffd1e6', '#c9f2ff'] },
  wardrobe: { name: 'Wardrobe', cat: 'storage', w: 104, h: 160, open: true, container: { accepts: ['clothing'], max: 12, stock: ['cl_tee_pink', 'cl_tee_blue', 'cl_dress', 'cl_hoodie', 'cl_cap', 'cl_dino', 'cl_hero'] }, colors: ['#ffffff', '#ffd1e6', '#c9e7ff', WOODC] },
  petbed: { name: 'Pet Bed', cat: 'petcare', w: 70, h: 30, colors: ['#ff8fc4', '#8fd0ff', '#b9a3ff'] },
  desk: { name: 'Desk', cat: 'tables', w: 120, h: 86, surface: { y: 72, w: 104 }, colors: ['#ffffff', WOODC, '#ffd1e6'] },
  /* ---- bathroom ---- */
  bathtub: { name: 'Bathtub', cat: 'bathroom', w: 170, h: 80, use: 'bathe', seats: [[-6, -34]], colors: ['#ffffff', '#ffd1e6', '#c9f2ff'] },
  toilet: { name: 'Toilet', cat: 'bathroom', w: 60, h: 92, use: 'sit', seats: [[0, -36]], colors: ['#ffffff', '#ffe4f1'] },
  bathsink: { name: 'Wash Basin', cat: 'bathroom', w: 70, h: 110, toggle: true, colors: ['#ffffff', '#c9f2ff', '#ffd1e6'] },
  mirror: { name: 'Mirror', cat: 'bathroom', w: 64, h: 124, colors: ['#ffd36b', '#ff8fc4', '#ffffff'] },
  /* ---- backyard and garden ---- */
  plot: { name: 'Garden Plot', cat: 'garden', w: 104, h: 44, plot: true, colors: ['#8a5a3c'] },
  seedbox: { name: 'Seed Box', cat: 'garden', w: 80, h: 64, open: true, container: { accepts: ['seed'], max: 12, stock: ['seed_tomato', 'seed_strawberry', 'seed_carrot', 'seed_sunflower', 'seed_daisy'] }, colors: [WOODC, '#ff8fc4'] },
  wateringcan: { name: 'Watering Can', cat: 'garden', kind: 'prop', w: 40, h: 32, tags: ['tool'], colors: ['#3aa8ff', '#ff8fc4', '#7ee0b5'] },
  tree: { name: 'Shade Tree', cat: 'outdoor', w: 160, h: 236, colors: ['#5cc85a', '#ffae42'] },
  blossomtree: { name: 'Cherry Blossom', cat: 'outdoor', w: 160, h: 236, product: 'sea_spring', colors: ['#ffa3d2'] },
  flowers: { name: 'Flower Bed', cat: 'outdoor', w: 84, h: 46, colors: ['#ff6fa8', '#ffc533', '#b37bff', '#ffffff'] },
  bench: { name: 'Park Bench', cat: 'outdoor', w: 144, h: 84, use: 'sit', seats: [[-34, -40], [34, -40]], colors: [WOODC, '#ff9fc9', '#8fd0ff', '#ffffff'] },
  fence: { name: 'Picket Fence', cat: 'outdoor', w: 150, h: 60, colors: ['#ffffff', '#ffd1e6'] },
  /* ---- playground ---- */
  swing: { name: 'Swing Set', cat: 'outdoor', w: 170, h: 170, use: 'swing', seats: [[-38, -46], [38, -46]], colors: ['#ff5fa8', '#3aa8ff', '#ffc533'] },
  slide: { name: 'Slide', cat: 'outdoor', w: 190, h: 150, use: 'slide', seats: [[-56, -104]], colors: ['#ffc533', '#ff5fa8', '#3aa8ff'] },
  sandbox: { name: 'Sandbox', cat: 'outdoor', w: 170, h: 60, use: 'sit', seats: [[-36, -20], [36, -20]], colors: ['#ff8fc4', '#7ee0b5', '#8fd0ff'] },
  picnic: { name: 'Picnic Table', cat: 'outdoor', w: 170, h: 86, use: 'sit', seats: [[-42, -34], [42, -34]], surface: { y: 66, w: 140 }, colors: ['#ff6b6b', '#3aa8ff', '#7ee0b5'] },
  /* ---- market ---- */
  shelf_produce: { name: 'Fruit and Veg Shelf', cat: 'storage', w: 176, h: 232, open: true, shop: true, container: { accepts: [], max: 0, stock: ['strawberry', 'apple', 'banana', 'tomato', 'carrot'] }, colors: ['#7ee0b5'] },
  shelf_dairy: { name: 'Dairy and Bakery Shelf', cat: 'storage', w: 176, h: 232, open: true, shop: true, container: { accepts: [], max: 0, stock: ['milk', 'cheese', 'egg', 'bread', 'flour', 'juice'] }, colors: ['#8fd0ff'] },
  shelf_garden: { name: 'Garden and Pets Shelf', cat: 'storage', w: 176, h: 232, open: true, shop: true, container: { accepts: [], max: 0, stock: ['seed_rose_red', 'seed_rose_white', 'seed_rose_yellow', 'kibble', 'teddy'] }, colors: ['#ffc533'] },
  checkout: { name: 'Checkout', cat: 'storage', w: 150, h: 96, checkout: true, use: 'shop', seats: [[30, 14]], colors: ['#ff8fc4'] },
  basket: { name: 'Shopping Basket', cat: 'storage', kind: 'prop', w: 46, h: 34, tags: ['basket'], container: { accepts: ['food', 'drink', 'seed', 'toy', 'petfood'], max: 8 }, colors: ['#ff5fa8', '#3aa8ff'] },
  /* ---- premium furniture ---- */
  castlebed: { name: 'Castle Bed', cat: 'beds', w: 200, h: 176, use: 'sleep', seats: [[-40, -66]], product: 'exp_dream_mansion', colors: ['#ff9fd0', '#b48cff', '#8fd8ff'] },
  piano: { name: 'Grand Piano', cat: 'decorations', w: 150, h: 150, use: 'play', seats: [[0, 8]], product: 'exp_dream_mansion', colors: ['#2b2340', '#ffffff', '#ff9fd0'] },
  fountain: { name: 'Sparkle Fountain', cat: 'decorations', w: 150, h: 140, product: 'exp_dream_mansion', colors: ['#7fd3ff', '#ff9fd0', '#b69bff'] },
  aquarium: { name: 'Aquarium', cat: 'decorations', w: 130, h: 132, product: 'exp_beach_vacation', colors: ['#5fd0ff', '#7ee8c6', '#b69bff'], light: { y: -80, r: 110, tint: '120,220,255' } },
  hottub: { name: 'Bubble Hot Tub', cat: 'outdoor', w: 176, h: 76, use: 'bathe', seats: [[-38, -26], [38, -26]], product: 'exp_beach_vacation', colors: ['#c98b5e', '#ffffff', '#ff9fd0'] },
  surfboard: { name: 'Surfboard', cat: 'outdoor', w: 48, h: 156, product: 'exp_beach_vacation', colors: ['#ff5fa8', '#19c7b5', '#ffbd1f'] },
  umbrella: { name: 'Beach Umbrella', cat: 'outdoor', w: 140, h: 190, product: 'exp_beach_vacation', colors: ['#ff5fa8', '#19c7b5', '#ffbd1f', '#9a5cff'] },
  sandcastle: { name: 'Sandcastle', cat: 'toys', w: 104, h: 124, product: 'exp_beach_vacation', colors: ['#ff5fa8', '#3aa8ff', '#9a5cff'] },
  streetlamp: { name: 'Street Lamp', cat: 'lighting', w: 56, h: 190, toggle: true, product: 'exp_city_life', colors: ['#4d4466', '#2f8f7a', '#c2457e'], light: { y: -150, r: 190 } },
  icecream: { name: 'Ice Cream Cart', cat: 'outdoor', w: 140, h: 176, open: true, product: 'exp_city_life', container: { accepts: [], max: 0, stock: ['icecream_cone'] }, colors: ['#ffd1e6', '#c9f2ff', '#fff0b3'] },

  /* ---- props: toys ---- */
  teddy: { name: 'Teddy Bear', cat: 'toys', kind: 'prop', w: 34, h: 38, tags: ['toy'], price: 4, colors: ['#c98b5e', '#ffb3d1', '#ffffff'] },
  ball: { name: 'Bouncy Ball', cat: 'toys', kind: 'prop', w: 36, h: 36, tags: ['toy'], bounce: true, colors: ['#ff5fa8', '#3aa8ff', '#ffc533'] },
  blocks: { name: 'Toy Blocks', cat: 'toys', kind: 'prop', w: 40, h: 34, tags: ['toy'], colors: ['#ff6b6b'] },
  duck: { name: 'Rubber Duck', cat: 'toys', kind: 'prop', w: 30, h: 26, tags: ['toy'], colors: ['#ffd23d', '#ff8fc4'] },
  /* ---- props: food (price = market coins, sell = coins when sold at checkout) ---- */
  bread: { name: 'Bread', kind: 'prop', w: 34, h: 24, tags: ['food', 'ingredient', 'bread'], food: 'eat', price: 2 },
  toast: { name: 'Toast', kind: 'prop', w: 26, h: 26, tags: ['food'], food: 'eat' },
  milk: { name: 'Milk', kind: 'prop', w: 20, h: 36, tags: ['drink', 'ingredient', 'milk'], food: 'drink', price: 2 },
  juice: { name: 'Orange Juice', kind: 'prop', w: 20, h: 36, tags: ['drink'], food: 'drink', price: 2 },
  cheese: { name: 'Cheese', kind: 'prop', w: 30, h: 20, tags: ['food', 'ingredient', 'cheese'], food: 'eat', price: 2 },
  egg: { name: 'Egg', kind: 'prop', w: 18, h: 22, tags: ['food', 'ingredient', 'egg'], price: 1 },
  flour: { name: 'Flour', kind: 'prop', w: 26, h: 34, tags: ['food', 'ingredient', 'flour'], price: 2 },
  tomato: { name: 'Tomato', kind: 'prop', w: 24, h: 24, tags: ['food', 'ingredient', 'produce', 'veg', 'tomato'], food: 'eat', price: 2, sell: 2 },
  carrot: { name: 'Carrot', kind: 'prop', w: 14, h: 34, tags: ['food', 'ingredient', 'produce', 'veg', 'carrot'], food: 'eat', price: 2, sell: 2 },
  strawberry: { name: 'Strawberry', kind: 'prop', w: 20, h: 22, tags: ['food', 'ingredient', 'produce', 'fruit', 'strawberry'], food: 'eat', price: 2, sell: 2 },
  apple: { name: 'Apple', kind: 'prop', w: 24, h: 26, tags: ['food', 'ingredient', 'produce', 'fruit', 'apple'], food: 'eat', price: 2, sell: 3 },
  banana: { name: 'Banana', kind: 'prop', w: 30, h: 18, tags: ['food', 'ingredient', 'produce', 'fruit', 'banana'], food: 'eat', price: 2, sell: 2 },
  smoothie_strawberry: { name: 'Strawberry Smoothie', kind: 'prop', w: 20, h: 38, tags: ['drink'], food: 'drink', liquid: '#ff8fb5' },
  smoothie_banana: { name: 'Banana Smoothie', kind: 'prop', w: 20, h: 38, tags: ['drink'], food: 'drink', liquid: '#ffe38a' },
  smoothie_fruit: { name: 'Fruit Smoothie', kind: 'prop', w: 20, h: 38, tags: ['drink'], food: 'drink', liquid: '#ffb36b' },
  pizza: { name: 'Pizza', kind: 'prop', w: 44, h: 18, tags: ['food'], food: 'eat' },
  applepie: { name: 'Apple Pie', kind: 'prop', w: 42, h: 20, tags: ['food'], food: 'eat' },
  friedegg: { name: 'Fried Egg', kind: 'prop', w: 34, h: 14, tags: ['food'], food: 'eat' },
  soup: { name: 'Veggie Soup', kind: 'prop', w: 34, h: 22, tags: ['food'], food: 'eat' },
  pancakes: { name: 'Pancakes', kind: 'prop', w: 38, h: 22, tags: ['food'], food: 'eat' },
  icecream_cone: { name: 'Ice Cream', kind: 'prop', w: 20, h: 38, tags: ['food'], food: 'eat' },
  kibble: { name: 'Pet Food', kind: 'prop', w: 28, h: 30, tags: ['petfood'], price: 1 },
  /* ---- props: clothing (drop on a character to dress them) ---- */
  cl_tee_pink: { name: 'Pink T-shirt', kind: 'prop', w: 34, h: 30, tags: ['clothing'], wear: { top: 'tee', topColor: 0 } },
  cl_tee_blue: { name: 'Blue T-shirt', kind: 'prop', w: 34, h: 30, tags: ['clothing'], wear: { top: 'tee', topColor: 3 } },
  cl_dress: { name: 'Party Dress', kind: 'prop', w: 34, h: 38, tags: ['clothing'], wear: { top: 'dress', topColor: 1 } },
  cl_hoodie: { name: 'Cozy Hoodie', kind: 'prop', w: 36, h: 32, tags: ['clothing'], wear: { outer: 'hoodie', outerColor: 2 } },
  cl_cap: { name: 'Sun Cap', kind: 'prop', w: 32, h: 20, tags: ['clothing'], wear: { acc: 'cap' } },
  cl_dino: { name: 'Dino Costume', kind: 'prop', w: 36, h: 36, tags: ['clothing'], wear: { costume: 'dino' } },
  cl_hero: { name: 'Hero Cape', kind: 'prop', w: 36, h: 34, tags: ['clothing'], wear: { costume: 'hero' } },
  /* ---- props: seeds ---- */
  seed_tomato: { name: 'Tomato Seeds', kind: 'prop', w: 24, h: 30, tags: ['seed'], crop: 'tomato' },
  seed_strawberry: { name: 'Strawberry Seeds', kind: 'prop', w: 24, h: 30, tags: ['seed'], crop: 'strawberry' },
  seed_carrot: { name: 'Carrot Seeds', kind: 'prop', w: 24, h: 30, tags: ['seed'], crop: 'carrot' },
  seed_sunflower: { name: 'Sunflower Seeds', kind: 'prop', w: 24, h: 30, tags: ['seed'], crop: 'sunflower' },
  seed_daisy: { name: 'Daisy Seeds', kind: 'prop', w: 24, h: 30, tags: ['seed'], crop: 'daisy' },
  seed_rose_red: { name: 'Red Rose Seeds', kind: 'prop', w: 24, h: 30, tags: ['seed'], crop: 'rose_red', price: 3 },
  seed_rose_white: { name: 'White Rose Seeds', kind: 'prop', w: 24, h: 30, tags: ['seed'], crop: 'rose_white', price: 3 },
  seed_rose_yellow: { name: 'Yellow Rose Seeds', kind: 'prop', w: 24, h: 30, tags: ['seed'], crop: 'rose_yellow', price: 3 },
  seed_moonflower: { name: 'Moonflower Seeds', kind: 'prop', w: 24, h: 30, tags: ['seed'], crop: 'moonflower', product: 'exp_magical_gardens' },
  bloom_sunflower: { name: 'Sunflower', kind: 'prop', w: 26, h: 44, tags: ['bloom', 'produce'], sell: 3, bloom: '#ffc533' },
  bloom_daisy: { name: 'Daisy', kind: 'prop', w: 22, h: 40, tags: ['bloom', 'produce'], sell: 2, bloom: '#ffffff' },
  bloom_rose_red: { name: 'Red Rose', kind: 'prop', w: 22, h: 40, tags: ['bloom', 'produce'], sell: 4, bloom: '#ff3d5e' },
  bloom_rose_white: { name: 'White Rose', kind: 'prop', w: 22, h: 40, tags: ['bloom', 'produce'], sell: 4, bloom: '#fff6f8' },
  bloom_rose_yellow: { name: 'Yellow Rose', kind: 'prop', w: 22, h: 40, tags: ['bloom', 'produce'], sell: 4, bloom: '#ffd23d' },
};

/* Catalog tabs for decorating (Section 8). Order matters. */
L.CATEGORIES = [
  ['beds', 'Beds'], ['sofas', 'Sofas'], ['chairs', 'Chairs'], ['tables', 'Tables'], ['appliances', 'Appliances'], ['storage', 'Storage'],
  ['lighting', 'Lighting'], ['decorations', 'Decor'], ['toys', 'Toys'], ['bathroom', 'Bathroom'], ['outdoor', 'Outdoor'], ['garden', 'Garden'], ['petcare', 'Pet care'],
];
/* Shop shelves are market fixtures, not things players place at home. */
L.NOT_IN_CATALOG = ['shelf_produce', 'shelf_dairy', 'shelf_garden', 'checkout'];

/* ---------------------------------------------------------------
   Cooking recipes (Sections 5 and 7). Inputs can be item ids or tags.
   --------------------------------------------------------------- */
L.RECIPES = [
  { station: 'toaster', inputs: ['bread'], output: 'toast', time: 2.5 },
  { station: 'blender', inputs: ['strawberry', 'milk'], output: 'smoothie_strawberry', time: 2 },
  { station: 'blender', inputs: ['banana', 'milk'], output: 'smoothie_banana', time: 2 },
  { station: 'blender', inputs: ['fruit', 'milk'], output: 'smoothie_fruit', time: 2 },
  { station: 'blender', inputs: ['fruit'], output: 'smoothie_fruit', time: 2 },
  { station: 'blender', inputs: ['fruit', 'fruit'], output: 'smoothie_fruit', time: 2 },
  { station: 'stove', inputs: ['tomato', 'cheese', 'bread'], output: 'pizza', time: 4 },
  { station: 'stove', inputs: ['apple', 'flour'], output: 'applepie', time: 4 },
  { station: 'stove', inputs: ['egg', 'flour', 'milk'], output: 'pancakes', time: 3.5 },
  { station: 'stove', inputs: ['carrot', 'tomato'], output: 'soup', time: 3.5 },
  { station: 'stove', inputs: ['egg'], output: 'friedegg', time: 2.5 },
];

/* ---------------------------------------------------------------
   Drag-and-drop interaction rules (Section 5). First match wins.
   a/b matchers: kind, type, tag, has (a property on the object definition).
   --------------------------------------------------------------- */
L.DROP_RULES = [
  { a: { kind: 'char' }, b: { kind: 'char' }, action: 'hugOrHold' },
  { a: { kind: 'char' }, b: { has: 'use' }, action: 'use' },
  { a: { kind: 'char' }, b: { has: 'plot' }, action: 'garden' },
  { a: { kind: 'pet' }, b: { kind: 'char' }, action: 'holdPet' },
  { a: { kind: 'pet' }, b: { type: 'foodbowl' }, action: 'petEat' },
  { a: { kind: 'pet' }, b: { type: 'petbed' }, action: 'petSleep' },
  { a: { tag: 'clothing' }, b: { kind: 'char' }, action: 'wear' },
  { a: { tag: 'food' }, b: { kind: 'pet' }, action: 'feedPet' },
  { a: { tag: 'petfood' }, b: { kind: 'pet' }, action: 'feedPet' },
  { a: { has: 'food' }, b: { kind: 'char' }, action: 'eat' },
  { a: { kind: 'prop' }, b: { kind: 'char' }, action: 'carry' },
  { a: { tag: 'petfood' }, b: { type: 'foodbowl' }, action: 'fillBowl' },
  { a: { tag: 'seed' }, b: { has: 'plot' }, action: 'plant' },
  { a: { type: 'wateringcan' }, b: { has: 'plot' }, action: 'water' },
  { a: { tag: 'bloom' }, b: { has: 'plot' }, action: 'pollinate' },
  { a: { tag: 'basket' }, b: { has: 'checkout' }, action: 'checkout' },
  { a: { kind: 'prop' }, b: { has: 'checkout' }, action: 'payOrSell' },
  { a: { kind: 'prop' }, b: { has: 'container' }, action: 'insert' },
  { a: { kind: 'prop' }, b: { has: 'surface' }, action: 'placeOn' },
];

/* ---------------------------------------------------------------
   Gardening (Section 7). Stage thresholds are seconds of growth.
   Watered plants grow twice as fast. Plants never die.
   --------------------------------------------------------------- */
L.PLANT_STAGES = ['Seed', 'Sprout', 'Young plant', 'Mature plant', 'Ready to harvest'];
L.CROPS = {
  tomato: { name: 'Tomato', kind: 'veg', stages: [0, 15, 35, 60, 90], yield: ['tomato', 'tomato', 'tomato'], regrow: 2, color: '#ff4d4d' },
  strawberry: { name: 'Strawberry', kind: 'fruit', stages: [0, 12, 30, 50, 75], yield: ['strawberry', 'strawberry', 'strawberry'], regrow: 2, color: '#ff3d6e' },
  carrot: { name: 'Carrot', kind: 'veg', stages: [0, 10, 25, 45, 65], yield: ['carrot', 'carrot'], regrow: 0, color: '#ff8a2a' },
  sunflower: { name: 'Sunflower', kind: 'flower', stages: [0, 12, 30, 55, 80], yield: ['bloom_sunflower', 'seed_sunflower'], regrow: 0, color: '#ffc533' },
  daisy: { name: 'Daisy', kind: 'flower', stages: [0, 8, 20, 35, 50], yield: ['bloom_daisy', 'seed_daisy'], regrow: 0, color: '#ffffff' },
  rose_red: { name: 'Red Rose', kind: 'flower', stages: [0, 10, 25, 45, 65], yield: ['bloom_rose_red', 'seed_rose_red'], regrow: 0, color: '#ff3d5e' },
  rose_white: { name: 'White Rose', kind: 'flower', stages: [0, 10, 25, 45, 65], yield: ['bloom_rose_white', 'seed_rose_white'], regrow: 0, color: '#fff6f8' },
  rose_yellow: { name: 'Yellow Rose', kind: 'flower', stages: [0, 10, 25, 45, 65], yield: ['bloom_rose_yellow', 'seed_rose_yellow'], regrow: 0, color: '#ffd23d' },
  moonflower: { name: 'Moonflower', kind: 'flower', stages: [0, 20, 45, 80, 120], yield: [], regrow: 0, color: '#c9b8ff', product: 'exp_magical_gardens' },
};

/* ---------------------------------------------------------------
   Pets (Section 6). Breeds are starting looks; every trait stays editable.
   --------------------------------------------------------------- */
L.SPECIES = {
  dog: { name: 'Dog', ears: ['floppy', 'pointy'], breeds: { Beagle: { color: '#f6e6d2', patch: '#b4733f', pattern: 'patch', ears: 'floppy' }, Poodle: { color: '#ffffff', fur: 'fluffy', ears: 'floppy' }, Husky: { color: '#cfd6e6', patch: '#ffffff', pattern: 'mask', ears: 'pointy', eye: '#5fb7ff' } } },
  cat: { name: 'Cat', ears: ['pointy', 'folded'], breeds: { Tabby: { color: '#ffb36b', patch: '#e07a2a', pattern: 'stripes' }, 'Grey Kitten': { color: '#bfc2cf', patch: '#ffffff', pattern: 'mask', eye: '#3fae5a' }, Persian: { color: '#ffffff', fur: 'fluffy', eye: '#5fb7ff' } } },
  rabbit: { name: 'Rabbit', ears: ['long', 'lop'], breeds: { Lop: { color: '#d9b48a', ears: 'lop' }, Dutch: { color: '#ffffff', patch: '#3b3348', pattern: 'patch' }, Lionhead: { color: '#f0d9b5', fur: 'fluffy' } } },
  hamster: { name: 'Hamster', ears: ['round'], breeds: { Golden: { color: '#f2b56b', patch: '#fff4ea', pattern: 'mask' }, Snowball: { color: '#ffffff' }, Panda: { color: '#ffffff', patch: '#3b3348', pattern: 'patch' } } },
  bird: { name: 'Bird', ears: ['none', 'crest'], breeds: { Budgie: { color: '#7ed957', patch: '#ffe36b', pattern: 'mask' }, Canary: { color: '#ffe14d' }, Cockatiel: { color: '#cfd2dc', patch: '#ffd23d', pattern: 'mask', ears: 'crest' } } },
  fish: { name: 'Fish', ears: ['none'], breeds: { Goldfish: { color: '#ff8a2a' }, Betta: { color: '#6d5cff', patch: '#ff5fa8', pattern: 'stripes' }, Clownfish: { color: '#ff7a1a', patch: '#ffffff', pattern: 'stripes' } } },
  panda: { name: 'Panda', product: 'exp_pet_paradise', ears: ['round'], breeds: { Panda: { color: '#ffffff', patch: '#2a2733', pattern: 'panda' } } },
  fox: { name: 'Fox', product: 'exp_pet_paradise', ears: ['pointy'], breeds: { 'Red Fox': { color: '#ff8a3d', patch: '#ffffff', pattern: 'mask' } } },
};
L.PET_COLORS = ['#f6e6d2', '#c98b5e', '#6b4a3a', '#ffffff', '#bfc2cf', '#3b3348', '#ffb36b', '#f2b56b', '#ffe14d', '#7ed957', '#6d5cff', '#ff8fc4'];
L.PET_PATTERNS = [['none', 'Plain'], ['patch', 'Patches'], ['spots', 'Spots'], ['stripes', 'Stripes'], ['mask', 'Mask']];
L.PET_SIZES = [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']];
L.PET_ACCS = [['none', 'None'], ['collar', 'Collar'], ['bow', 'Bow'], ['bandana', 'Bandana']];
L.PET_PERSONALITIES = [['cuddly', 'Cuddly'], ['playful', 'Playful'], ['sleepy', 'Sleepy'], ['curious', 'Curious']];
L.EYE_COLORS = ['#5a3420', '#2f6fd6', '#2f9e6a', '#7a4bd6', '#9a6a2a', '#6b7a8c'];

/* ---------------------------------------------------------------
   Character creator options (Section 4 and Section 18)
   Values with a product id are premium and show a lock until owned.
   --------------------------------------------------------------- */
L.LOOKS = {
  gender: [['girl', 'Girl'], ['boy', 'Boy'], ['either', 'Either']],
  age: [['baby', 'Baby'], ['toddler', 'Toddler'], ['child', 'Child'], ['teen', 'Teen'], ['adult', 'Adult'], ['elder', 'Elder']],
  body: [['slim', 'Slim'], ['average', 'Average'], ['round', 'Round']],
  skin: ['#ffe2cc', '#f9d3b4', '#f4c4a0', '#e8b088', '#dda47a', '#c48a5e', '#a86b44', '#8a5636', '#6e4128'],
  face: [['round', 'Round'], ['oval', 'Oval'], ['heart', 'Heart'], ['wide', 'Wide']],
  eyes: [['round', 'Round'], ['almond', 'Almond'], ['sleepy', 'Sleepy'], ['sparkle', 'Sparkly']],
  eyeColor: L.EYE_COLORS,
  brows: [['soft', 'Soft'], ['arched', 'Arched'], ['straight', 'Straight'], ['bold', 'Bold']],
  nose: [['button', 'Button'], ['round', 'Round'], ['tiny', 'Tiny']],
  mouth: [['smile', 'Smile'], ['grin', 'Grin'], ['small', 'Small']],
  freckles: [['none', 'None'], ['few', 'A few'], ['lots', 'Lots']],
  marking: [['none', 'None'], ['beauty', 'Beauty mark'], ['heart', 'Heart'], ['whiskers', 'Whiskers'], ['star', 'Star']],
  makeup: [['none', 'None'], ['blush', 'Rosy cheeks'], ['lipstick', 'Lipstick'], ['shadow', 'Eyeshadow'], ['glitter', 'Glitter']],
  glasses: [['none', 'None'], ['round', 'Round'], ['square', 'Square'], ['star', 'Star'], ['sun', 'Sunglasses']],
  hair: [['tuft', 'Baby tuft'], ['short', 'Short'], ['buzz', 'Buzz'], ['long', 'Long'], ['wavy', 'Wavy'], ['bun', 'Top bun'], ['pony', 'Ponytail'], ['pigtails', 'Pigtails'], ['curly', 'Curly'], ['braids', 'Braids'], ['spacebuns', 'Space buns', 'cos_rainbow_hair']],
  hairColor: [['#6b3e26', 'Brown'], ['#f3cf6b', 'Blonde'], ['#2d2230', 'Black'], ['#d9573b', 'Ginger'], ['#ff8fc4', 'Pink'], ['#8e7cff', 'Purple'], ['#b8b3c4', 'Grey'], ['#f4f1f7', 'White'], ['rainbow', 'Rainbow', 'cos_rainbow_hair'], ['#7fe0c4', 'Mint', 'cos_rainbow_hair']],
  top: [['tee', 'T-shirt'], ['stripes', 'Stripes'], ['sweater', 'Sweater'], ['overalls', 'Overalls'], ['dress', 'Dress']],
  bottom: [['pants', 'Pants'], ['shorts', 'Shorts'], ['skirt', 'Skirt'], ['leggings', 'Leggings']],
  shoes: [['sneakers', 'Sneakers'], ['boots', 'Boots'], ['sandals', 'Sandals'], ['slippers', 'Slippers']],
  outer: [['none', 'None'], ['jacket', 'Jacket'], ['hoodie', 'Hoodie'], ['cardigan', 'Cardigan']],
  costume: [['none', 'None'], ['dino', 'Dino'], ['hero', 'Hero cape'], ['bee', 'Bumblebee'], ['princess', 'Princess', 'cos_royal'], ['knight', 'Knight', 'cos_royal']],
  acc: [['none', 'None'], ['bow', 'Bow'], ['cap', 'Cap'], ['flower', 'Flower'], ['headband', 'Headband'], ['crown', 'Crown', 'cos_royal'], ['flowercrown', 'Flower crown', 'sea_spring']],
  jewelry: [['none', 'None'], ['necklace', 'Necklace'], ['earrings', 'Earrings'], ['bracelet', 'Bracelet']],
  hearing: [['none', 'None'], ['one', 'One ear'], ['both', 'Both ears']],
  mobility: [['none', 'None'], ['wheelchair', 'Wheelchair'], ['cane', 'Cane']],
  prosthetic: [['none', 'None'], ['leg', 'Leg'], ['arm', 'Arm']],
  personality: [['calm', 'Calm'], ['cheerful', 'Cheerful'], ['playful', 'Playful'], ['shy', 'Shy'], ['curious', 'Curious'], ['sleepy', 'Sleepy']],
  role: [['parent', 'Parent'], ['child', 'Child'], ['sibling', 'Sibling'], ['grandparent', 'Grandparent'], ['baby', 'Baby'], ['friend', 'Friend'], ['neighbor', 'Neighbor']],
};
L.CLOTH_COLORS = ['#ff8fc4', '#b9a3ff', '#ffffff', '#4f8dff', '#3fd0b4', '#ffc533', '#ff7a6b', '#3b3560', '#7ed957', '#5fb7ff', '#c98b5e', '#ff5fa8'];
L.NAMES = ['Mia', 'Kai', 'Rosie', 'Max', 'Luna', 'Theo', 'Ivy', 'Noah', 'Zara', 'Eli', 'Pip', 'June', 'Omar', 'Nia', 'Sam', 'Ada'];
L.PET_NAMES = ['Biscuit', 'Mochi', 'Pepper', 'Sunny', 'Button', 'Clover', 'Pudding', 'Nugget', 'Waffles', 'Pebble', 'Maple', 'Bubbles'];

/* ---------------------------------------------------------------
   Free will (Section 13). Weights per personality for idle activities.
   'calm' is the neutral, docile default.
   --------------------------------------------------------------- */
L.ACTIVITIES = ['idle', 'wander', 'sit', 'socialize', 'petplay', 'dance', 'watchtv', 'nap', 'eat'];
L.ACTIVITY_WEIGHTS = {
  calm: { idle: 5, wander: 3, sit: 4, socialize: 2, petplay: 1, dance: 0, watchtv: 2, nap: 1, eat: 1 },
  cheerful: { idle: 2, wander: 3, sit: 2, socialize: 5, petplay: 2, dance: 3, watchtv: 1, nap: 0, eat: 1 },
  playful: { idle: 1, wander: 4, sit: 1, socialize: 3, petplay: 4, dance: 4, watchtv: 1, nap: 0, eat: 1 },
  shy: { idle: 6, wander: 2, sit: 4, socialize: 1, petplay: 3, dance: 0, watchtv: 2, nap: 1, eat: 1 },
  curious: { idle: 1, wander: 6, sit: 1, socialize: 3, petplay: 2, dance: 1, watchtv: 2, nap: 0, eat: 1 },
  sleepy: { idle: 4, wander: 1, sit: 3, socialize: 1, petplay: 1, dance: 0, watchtv: 2, nap: 5, eat: 2 },
};
L.IDLE_EMOTION = { calm: 'neutral', cheerful: 'happy', playful: 'playful', shy: 'shy', curious: 'neutral', sleepy: 'sleepy' };

/* ---------------------------------------------------------------
   New game: starter household and room layouts (Section 18)
   --------------------------------------------------------------- */
L.DEFAULT_LAYOUTS = {
  'home/living': [['rug', .5, .56], ['bookshelf', .17, .03], ['tv', .48, .02], ['lamp', .83, .05], ['sofa', .3, .34], ['armchair', .74, .4], ['coffeetable', .52, .6], ['plant', .06, .52], ['toybox', .9, .62], ['teddy', .66, .82]],
  'home/kitchen': [['fridge', .09, .04], ['counter', .27, .05, { kids: [['toaster', -22]] }], ['stove', .45, .05], ['counter', .63, .05, { ci: 1, kids: [['blender', 20]] }], ['sink', .82, .05], ['diningtable', .52, .56, { kids: [['apple', -30], ['bread', 22]] }], ['chair', .32, .52], ['chair', .72, .52, { ci: 1 }], ['petfood', .08, .66], ['foodbowl', .2, .86]],
  'home/bedroom': [['bed', .72, .3], ['wardrobe', .14, .03], ['lamp', .9, .05, { ci: 1 }], ['rug', .44, .62, { ci: 2 }], ['crib', .5, .18], ['desk', .34, .02, { kids: [['duck', 30]] }], ['petbed', .2, .8]],
  'home/bathroom': [['bathtub', .3, .2], ['toilet', .74, .06], ['bathsink', .55, .03], ['mirror', .55, .0], ['plant', .9, .5, { ci: 2 }], ['duck', .44, .8]],
  'home/backyard': [['fence', .2, .0], ['fence', .5, .0], ['fence', .8, .0], ['plot', .3, .4, { crop: { id: 'tomato', g: 70 } }], ['plot', .52, .4, { crop: { id: 'sunflower', g: 20 } }], ['plot', .3, .66], ['plot', .52, .66], ['seedbox', .12, .3], ['wateringcan', .72, .74], ['tree', .9, .1], ['flowers', .78, .5], ['bench', .62, .12]],
  playground: [['swing', .24, .18], ['slide', .7, .2], ['sandbox', .42, .58], ['picnic', .8, .66], ['tree', .07, .06], ['ball', .56, .82], ['bench', .5, .14, { ci: 1 }]],
  market: [['shelf_produce', .18, .02], ['shelf_dairy', .42, .02], ['shelf_garden', .66, .02], ['checkout', .8, .45], ['basket', .5, .7], ['basket', .58, .76, { ci: 1 }], ['plant', .06, .5]],
  beach: [['umbrella', .2, .2], ['sandcastle', .72, .46], ['surfboard', .9, .16], ['hottub', .44, .3], ['ball', .46, .7, { ci: 1 }]],
  city: [['streetlamp', .08, .12], ['streetlamp', .92, .12], ['icecream', .74, .3], ['bench', .3, .22, { ci: 1 }], ['flowers', .12, .62], ['flowers', .9, .64, { ci: 2 }]],
  mansion: [['rug', .5, .58, { ci: 2 }], ['castlebed', .72, .26], ['piano', .26, .22], ['fountain', .5, .1], ['lamp', .9, .05], ['sofa', .32, .6, { ci: 2 }]],
};
L.DEFAULT_CHARS = [
  { name: 'Lila', role: 'child', gender: 'girl', age: 'child', skin: 4, hair: 'wavy', hc: 0, eyeColor: 0, acc: 'bow', top: 'overalls', topColor: 0, bottomColor: 3, personality: 'cheerful', scene: 'home/living', x: .36, z: .8 },
  { name: 'Sunny', role: 'sibling', gender: 'girl', age: 'child', skin: 1, hair: 'bun', hc: 1, eyeColor: 1, acc: 'bow', top: 'overalls', topColor: 1, bottomColor: 1, personality: 'playful', scene: 'home/living', x: .52, z: .86 },
  { name: 'Leo', role: 'sibling', gender: 'boy', age: 'child', skin: 5, hair: 'curly', hc: 2, eyeColor: 0, acc: 'none', top: 'tee', topColor: 2, outer: 'hoodie', outerColor: 3, bottom: 'pants', bottomColor: 7, personality: 'curious', scene: 'home/living', x: .68, z: .8 },
  { name: 'Rosa', role: 'parent', gender: 'girl', age: 'adult', skin: 6, hair: 'long', hc: 2, eyeColor: 4, acc: 'none', top: 'sweater', topColor: 4, bottom: 'pants', bottomColor: 3, jewelry: 'earrings', personality: 'calm', scene: 'home/kitchen', x: .26, z: .84 },
];
L.DEFAULT_PETS = [
  { species: 'cat', breed: 'Grey Kitten', name: 'Mochi', scene: 'home/living', x: .2, z: .9, acc: 'collar' },
  { species: 'dog', breed: 'Beagle', name: 'Biscuit', scene: 'home/living', x: .44, z: .95, acc: 'collar' },
  { species: 'rabbit', breed: 'Lop', name: 'Clover', scene: 'home/backyard', x: .82, z: .9 },
];
L.START_COINS = 30;
})(typeof window !== 'undefined' ? (window.L = window.L || {}) : (globalThis.L = globalThis.L || {}));

/* Flower cross-pollination (Section 7): drop a bloom on a different blooming flower. */
(function (L) {
'use strict';
L.FLOWER_CROSS = {
  'rose_red+rose_white': 'rose_pink', 'rose_red+rose_yellow': 'rose_orange', 'rose_white+rose_yellow': 'rose_cream',
  'daisy+rose_red': 'rose_pink', 'sunflower+rose_red': 'rose_orange', 'daisy+sunflower': 'rose_cream',
};
L.RARE_CROSS = 'rose_rainbow';
const extra = { rose_pink: ['Pink Rose', '#ff8fc4', 5], rose_orange: ['Orange Rose', '#ff8a2a', 5], rose_cream: ['Cream Rose', '#fff0c2', 5], rose_rainbow: ['Rainbow Rose', 'rainbow', 9] };
for (const [id, [name, color, sell]] of Object.entries(extra)) {
  L.CROPS[id] = { name, kind: 'flower', stages: [0, 10, 25, 45, 65], yield: ['bloom_' + id, 'seed_' + id], regrow: 0, color, bred: true };
  L.OBJECTS['seed_' + id] = { name: name + ' Seeds', kind: 'prop', w: 24, h: 30, tags: ['seed'], crop: id };
  L.OBJECTS['bloom_' + id] = { name, kind: 'prop', w: 22, h: 40, tags: ['bloom', 'produce'], sell, bloom: color };
}
})(typeof window !== 'undefined' ? window.L : globalThis.L);
