/**
 * Plant Care Knowledge Base (Browser version)
 * Contains care schedules and requirements for all supported plants.
 *
 * Schedule months are 1-indexed (1=January, 12=December).
 * Watering frequency is in days between waterings per season.
 * Southern Hemisphere seasons.
 */

const PLANT_TYPES = {
  DECIDUOUS_TREE: 'deciduous_tree',
  EVERGREEN_TREE: 'evergreen_tree',
  SHRUB: 'shrub',
  NATIVE_SHRUB: 'native_shrub',
  ORNAMENTAL_GRASS: 'ornamental_grass',
  PERENNIAL: 'perennial',
  FRUITING_SHRUB: 'fruiting_shrub',
  CLIMBER: 'climber',
  HEDGE: 'hedge',
};

const SEASONS = {
  SUMMER: 'summer',
  AUTUMN: 'autumn',
  WINTER: 'winter',
  SPRING: 'spring',
};

function getSeason(month) {
  if (month >= 12 || month <= 2) return SEASONS.SUMMER;
  if (month >= 3 && month <= 5) return SEASONS.AUTUMN;
  if (month >= 6 && month <= 8) return SEASONS.WINTER;
  return SEASONS.SPRING;
}

const WEATHER_THRESHOLDS = {
  MIN_TEMP_FOR_PRUNING: 5,
  MIN_TEMP_FOR_FERTILIZING: 8,
  MAX_TEMP_FOR_MULCHING: 35,
  MAX_WIND_FOR_MULCHING: 30,
  MAX_WIND_FOR_SPRAYING: 15,
  RAIN_SKIP_WATERING: 5,
  RAIN_DELAY_FERTILIZING: 10,
  FROST_TEMP: 2,
  HEAT_STRESS_TEMP: 35,
};

const ALERT_DAYS_BEFORE = [15, 7, 3, 1];

const plantCareDatabase = {
  'Silver Birch': {
    scientificName: 'Betula pendula',
    type: PLANT_TYPES.DECIDUOUS_TREE,
    description: 'Elegant deciduous tree with white bark and delicate leaves',
    watering: {
      summer: { frequencyDays: 5, depthMm: 25, notes: 'Deep water in hot weather' },
      autumn: { frequencyDays: 10, depthMm: 20, notes: 'Reduce as leaves drop' },
      winter: { frequencyDays: 21, depthMm: 15, notes: 'Minimal watering needed' },
      spring: { frequencyDays: 7, depthMm: 20, notes: 'Increase as growth resumes' },
    },
    pruning: { months: [7, 8], frequency: 'annually', notes: 'Prune in mid-late summer to avoid sap bleeding. Remove dead/crossing branches.' },
    fertilizing: { months: [9, 10], frequency: 'annually', type: 'Balanced slow-release (10-10-10)', notes: 'Apply balanced fertilizer as new growth begins in spring.' },
    mulching: { months: [9, 3], frequency: 'biannually', depth: '75mm', type: 'Wood chip or bark mulch', notes: 'Maintain 75mm layer. Keep away from trunk.' },
    icon: '🌳',
  },
  'Stella Bella': {
    scientificName: 'Grevillea hybrid',
    type: PLANT_TYPES.NATIVE_SHRUB,
    description: 'Australian native shrub with spectacular flower clusters',
    watering: {
      summer: { frequencyDays: 7, depthMm: 20, notes: 'Weekly deep water' },
      autumn: { frequencyDays: 14, depthMm: 15, notes: 'Drought tolerant once established' },
      winter: { frequencyDays: 21, depthMm: 10, notes: 'Minimal' },
      spring: { frequencyDays: 10, depthMm: 15, notes: 'Moderate watering' },
    },
    pruning: { months: [11, 12], frequency: 'annually', notes: 'Prune after flowering. Tip prune to maintain shape.' },
    fertilizing: { months: [9, 3], frequency: 'biannually', type: 'Native plant fertilizer (low phosphorus)', notes: 'Use low-phosphorus native plant fertilizer. Avoid standard fertilizers.' },
    mulching: { months: [9], frequency: 'annually', depth: '50mm', type: 'Eucalyptus mulch or leaf litter', notes: 'Light mulch layer. Natives prefer minimal mulch.' },
    icon: '🌺',
  },
  'October Glory': {
    scientificName: 'Acer rubrum October Glory',
    type: PLANT_TYPES.DECIDUOUS_TREE,
    description: 'Red maple cultivar with brilliant autumn foliage',
    watering: {
      summer: { frequencyDays: 5, depthMm: 30, notes: 'Regular deep watering essential' },
      autumn: { frequencyDays: 10, depthMm: 20, notes: 'Maintain moisture for colour' },
      winter: { frequencyDays: 21, depthMm: 15, notes: 'Reduce significantly' },
      spring: { frequencyDays: 7, depthMm: 25, notes: 'Regular as growth resumes' },
    },
    pruning: { months: [6, 7], frequency: 'annually', notes: 'Prune during dormancy in winter. Shape and remove dead wood.' },
    fertilizing: { months: [9], frequency: 'annually', type: 'Balanced slow-release (10-10-10)', notes: 'Apply in early spring before new growth.' },
    mulching: { months: [9, 3], frequency: 'biannually', depth: '75mm', type: 'Composted bark mulch', notes: 'Maintain moisture retention. Keep clear of trunk.' },
    icon: '🍁',
  },
  'Nadine': {
    scientificName: 'Grevillea hybrid',
    type: PLANT_TYPES.NATIVE_SHRUB,
    description: 'Compact grevillea with abundant nectar-rich flowers',
    watering: {
      summer: { frequencyDays: 7, depthMm: 20, notes: 'Weekly when young' },
      autumn: { frequencyDays: 14, depthMm: 15, notes: 'Reduce once established' },
      winter: { frequencyDays: 28, depthMm: 10, notes: 'Very drought tolerant' },
      spring: { frequencyDays: 10, depthMm: 15, notes: 'Moderate' },
    },
    pruning: { months: [11, 12], frequency: 'annually', notes: 'Tip prune after flowering to encourage bushiness.' },
    fertilizing: { months: [9, 3], frequency: 'biannually', type: 'Native plant fertilizer (low phosphorus)', notes: 'Low-phosphorus fertilizer only. Standard fertilizers can harm grevilleas.' },
    mulching: { months: [9], frequency: 'annually', depth: '50mm', type: 'Native leaf mulch', notes: 'Light mulch, keep away from stems.' },
    icon: '🌸',
  },
  'Lomundra': {
    scientificName: 'Lomandra longifolia',
    type: PLANT_TYPES.ORNAMENTAL_GRASS,
    description: 'Hardy Australian native grass with strappy leaves',
    watering: {
      summer: { frequencyDays: 14, depthMm: 15, notes: 'Very drought tolerant' },
      autumn: { frequencyDays: 21, depthMm: 10, notes: 'Occasional deep water' },
      winter: { frequencyDays: 30, depthMm: 10, notes: 'Rarely needed' },
      spring: { frequencyDays: 14, depthMm: 15, notes: 'Moderate as growth resumes' },
    },
    pruning: { months: [8, 9], frequency: 'annually', notes: 'Cut back hard to 150mm to rejuvenate. Remove dead foliage.' },
    fertilizing: { months: [9], frequency: 'annually', type: 'Slow-release native fertilizer', notes: 'Light application of slow-release fertilizer in spring.' },
    mulching: { months: [9], frequency: 'annually', depth: '50mm', type: 'Bark chips', notes: 'Mulch around base but not over crown.' },
    icon: '🌿',
  },
  'Lavender': {
    scientificName: 'Lavandula spp.',
    type: PLANT_TYPES.PERENNIAL,
    description: 'Fragrant perennial herb with purple flower spikes',
    watering: {
      summer: { frequencyDays: 10, depthMm: 15, notes: 'Minimal, drought tolerant' },
      autumn: { frequencyDays: 14, depthMm: 10, notes: 'Very little needed' },
      winter: { frequencyDays: 30, depthMm: 10, notes: 'Almost none, avoid wet feet' },
      spring: { frequencyDays: 10, depthMm: 15, notes: 'Light watering' },
    },
    pruning: { months: [1, 2, 9], frequency: 'biannually', notes: 'Prune after flowering in late summer. Light shape in spring. Never cut into old wood.' },
    fertilizing: { months: [9], frequency: 'annually', type: 'Light balanced fertilizer or compost', notes: 'Minimal feeding. Too much fertilizer reduces fragrance.' },
    mulching: { months: [9], frequency: 'annually', depth: '25mm', type: 'Gravel or pebble mulch', notes: 'Use inorganic mulch (gravel). Organic mulch retains too much moisture.' },
    icon: '💜',
  },
  'Fox tail Grass': {
    scientificName: 'Pennisetum alopecuroides',
    type: PLANT_TYPES.ORNAMENTAL_GRASS,
    description: 'Graceful ornamental grass with fluffy foxtail-like plumes',
    watering: {
      summer: { frequencyDays: 7, depthMm: 20, notes: 'Regular in hot weather' },
      autumn: { frequencyDays: 14, depthMm: 15, notes: 'Reduce gradually' },
      winter: { frequencyDays: 21, depthMm: 10, notes: 'Minimal' },
      spring: { frequencyDays: 10, depthMm: 15, notes: 'Increase with growth' },
    },
    pruning: { months: [8], frequency: 'annually', notes: 'Cut back to 150mm in late winter before new growth appears.' },
    fertilizing: { months: [9, 10], frequency: 'annually', type: 'Balanced slow-release', notes: 'Apply in spring as new growth begins.' },
    mulching: { months: [9], frequency: 'annually', depth: '50mm', type: 'Bark or compost mulch', notes: 'Mulch around base to suppress weeds.' },
    icon: '🌾',
  },
  'Fox tail grass purple': {
    scientificName: 'Pennisetum advena Rubrum',
    type: PLANT_TYPES.ORNAMENTAL_GRASS,
    description: 'Striking purple-leafed ornamental grass with burgundy plumes',
    watering: {
      summer: { frequencyDays: 7, depthMm: 20, notes: 'Regular watering for best colour' },
      autumn: { frequencyDays: 14, depthMm: 15, notes: 'Moderate' },
      winter: { frequencyDays: 21, depthMm: 10, notes: 'Frost tender - protect if needed' },
      spring: { frequencyDays: 10, depthMm: 15, notes: 'Resume regular watering' },
    },
    pruning: { months: [8], frequency: 'annually', notes: 'Cut back hard in late winter. Remove any frost-damaged foliage.' },
    fertilizing: { months: [9, 10], frequency: 'annually', type: 'Balanced slow-release', notes: 'Feed in spring for best foliage colour.' },
    mulching: { months: [9], frequency: 'annually', depth: '50mm', type: 'Bark mulch', notes: 'Mulch to protect roots, especially in frost-prone areas.' },
    icon: '🌾',
  },
  'Acer palmatum': {
    scientificName: 'Acer palmatum',
    type: PLANT_TYPES.DECIDUOUS_TREE,
    description: 'Japanese maple with elegant leaf forms and stunning autumn colour',
    watering: {
      summer: { frequencyDays: 4, depthMm: 25, notes: 'Consistent moisture critical. Protect from hot winds.' },
      autumn: { frequencyDays: 10, depthMm: 20, notes: 'Maintain for good autumn colour' },
      winter: { frequencyDays: 21, depthMm: 15, notes: 'Reduce but don\'t let dry out completely' },
      spring: { frequencyDays: 7, depthMm: 20, notes: 'Regular as new leaves emerge' },
    },
    pruning: { months: [5, 6], frequency: 'annually', notes: 'Prune when fully dormant. Thin to maintain open structure. Minimal pruning preferred.' },
    fertilizing: { months: [9], frequency: 'annually', type: 'Slow-release organic fertilizer', notes: 'Light feeding in early spring. Avoid high-nitrogen fertilizers.' },
    mulching: { months: [9, 3], frequency: 'biannually', depth: '75mm', type: 'Fine composted bark', notes: 'Essential for root protection. Shallow roots are sensitive to heat.' },
    icon: '🍂',
  },
  'Ornamental plum': {
    scientificName: 'Prunus cerasifera',
    type: PLANT_TYPES.DECIDUOUS_TREE,
    description: 'Ornamental tree with pink blossoms and purple foliage',
    watering: {
      summer: { frequencyDays: 7, depthMm: 25, notes: 'Regular deep watering' },
      autumn: { frequencyDays: 14, depthMm: 15, notes: 'Reduce as leaves fall' },
      winter: { frequencyDays: 21, depthMm: 10, notes: 'Minimal' },
      spring: { frequencyDays: 7, depthMm: 20, notes: 'Regular during flowering' },
    },
    pruning: { months: [11, 12], frequency: 'annually', notes: 'Prune after flowering. Remove suckers and dead wood. Shape as needed.' },
    fertilizing: { months: [9], frequency: 'annually', type: 'Balanced fertilizer (8-8-8)', notes: 'Feed in early spring before flowering.' },
    mulching: { months: [9], frequency: 'annually', depth: '75mm', type: 'Composted bark mulch', notes: 'Maintain mulch ring around drip line.' },
    icon: '🌸',
  },
  'Ficus flash': {
    scientificName: 'Ficus hillii Flash',
    type: PLANT_TYPES.EVERGREEN_TREE,
    description: 'Compact evergreen fig with glossy leaves and new red growth',
    watering: {
      summer: { frequencyDays: 5, depthMm: 25, notes: 'Regular deep watering' },
      autumn: { frequencyDays: 10, depthMm: 20, notes: 'Moderate' },
      winter: { frequencyDays: 14, depthMm: 15, notes: 'Reduce but keep moist' },
      spring: { frequencyDays: 7, depthMm: 20, notes: 'Regular for new growth flush' },
    },
    pruning: { months: [7, 8], frequency: 'biannually', notes: 'Prune to shape in late winter. Can be hedged. Tolerates heavy pruning.' },
    fertilizing: { months: [9, 12], frequency: 'biannually', type: 'Complete fertilizer (NPK)', notes: 'Feed in spring and mid-summer for best growth.' },
    mulching: { months: [9], frequency: 'annually', depth: '75mm', type: 'Bark or wood chip mulch', notes: 'Keep mulch away from trunk to prevent collar rot.' },
    icon: '🌲',
  },
  'Blueberry': {
    scientificName: 'Vaccinium corymbosum',
    type: PLANT_TYPES.FRUITING_SHRUB,
    description: 'Fruiting shrub producing delicious berries with autumn foliage',
    watering: {
      summer: { frequencyDays: 3, depthMm: 25, notes: 'Critical during fruiting. Keep consistently moist.' },
      autumn: { frequencyDays: 10, depthMm: 15, notes: 'Reduce after harvest' },
      winter: { frequencyDays: 14, depthMm: 10, notes: 'Maintain some moisture' },
      spring: { frequencyDays: 5, depthMm: 20, notes: 'Increase for flowering and fruit set' },
    },
    pruning: { months: [6, 7], frequency: 'annually', notes: 'Remove old unproductive canes. Thin to allow light penetration.' },
    fertilizing: { months: [9], frequency: 'annually', type: 'Acidic fertilizer (azalea/camellia food)', notes: 'Use acid-loving plant fertilizer. Blueberries need pH 4.5-5.5.' },
    mulching: { months: [9], frequency: 'annually', depth: '100mm', type: 'Pine bark or pine needles', notes: 'Acidic mulch essential. Pine bark or needles are ideal.' },
    icon: '🫐',
  },
  'Rose': {
    scientificName: 'Rosa spp.',
    type: PLANT_TYPES.SHRUB,
    description: 'Classic flowering shrub with fragrant blooms',
    watering: {
      summer: { frequencyDays: 4, depthMm: 30, notes: 'Deep watering at base. Avoid wetting foliage.' },
      autumn: { frequencyDays: 7, depthMm: 20, notes: 'Moderate' },
      winter: { frequencyDays: 14, depthMm: 15, notes: 'Reduce significantly' },
      spring: { frequencyDays: 5, depthMm: 25, notes: 'Regular for flowering' },
    },
    pruning: { months: [7], frequency: 'annually', notes: 'Hard prune in mid-winter. Remove dead/diseased wood. Shape bush.' },
    fertilizing: { months: [8, 10, 12], frequency: 'triannually', type: 'Rose-specific fertilizer', notes: 'Feed every 6-8 weeks during growing season. Roses are heavy feeders.' },
    mulching: { months: [9], frequency: 'annually', depth: '75mm', type: 'Composted manure or lucerne mulch', notes: 'Rich organic mulch. Feeds soil as it breaks down.' },
    icon: '🌹',
  },
  'Teddy Magnolia': {
    scientificName: 'Magnolia grandiflora Teddy Bear',
    type: PLANT_TYPES.EVERGREEN_TREE,
    description: 'Compact evergreen magnolia with large fragrant white flowers',
    watering: {
      summer: { frequencyDays: 5, depthMm: 30, notes: 'Regular deep watering essential' },
      autumn: { frequencyDays: 10, depthMm: 20, notes: 'Moderate' },
      winter: { frequencyDays: 14, depthMm: 15, notes: 'Reduce but maintain moisture' },
      spring: { frequencyDays: 7, depthMm: 25, notes: 'Increase for flowering' },
    },
    pruning: { months: [1, 2], frequency: 'annually', notes: 'Light prune after flowering to shape. Remove dead branches anytime.' },
    fertilizing: { months: [9], frequency: 'annually', type: 'Slow-release complete fertilizer', notes: 'Feed in spring. Avoid disturbing shallow roots when applying.' },
    mulching: { months: [9, 3], frequency: 'biannually', depth: '100mm', type: 'Composted bark or leaf mould', notes: 'Thick mulch protects shallow root system. Essential.' },
    icon: '🌼',
  },
  'Kangaroo paw': {
    scientificName: 'Anigozanthos spp.',
    type: PLANT_TYPES.PERENNIAL,
    description: 'Iconic Australian native with furry tubular flowers',
    watering: {
      summer: { frequencyDays: 7, depthMm: 15, notes: 'Moderate, drought tolerant' },
      autumn: { frequencyDays: 14, depthMm: 10, notes: 'Reduce' },
      winter: { frequencyDays: 21, depthMm: 10, notes: 'Minimal, avoid wet conditions' },
      spring: { frequencyDays: 10, depthMm: 15, notes: 'Moderate for flowering' },
    },
    pruning: { months: [4, 5], frequency: 'annually', notes: 'Cut back old flower stems and damaged foliage. Can cut to ground level.' },
    fertilizing: { months: [9], frequency: 'annually', type: 'Low-phosphorus native fertilizer', notes: 'Native fertilizer only. Standard phosphorus levels are toxic.' },
    mulching: { months: [9], frequency: 'annually', depth: '50mm', type: 'Gravel or native leaf mulch', notes: 'Good drainage essential. Gravel mulch works well.' },
    icon: '🦘',
  },
  'English box': {
    scientificName: 'Buxus sempervirens',
    type: PLANT_TYPES.HEDGE,
    description: 'Classic formal hedging plant with dense evergreen foliage',
    watering: {
      summer: { frequencyDays: 5, depthMm: 20, notes: 'Regular watering especially hedges' },
      autumn: { frequencyDays: 10, depthMm: 15, notes: 'Moderate' },
      winter: { frequencyDays: 14, depthMm: 10, notes: 'Reduce' },
      spring: { frequencyDays: 7, depthMm: 20, notes: 'Regular for new growth' },
    },
    pruning: { months: [10, 11, 2], frequency: 'triannually', notes: 'Clip 2-3 times during growing season for formal shape. Hedge shears ideal.' },
    fertilizing: { months: [9], frequency: 'annually', type: 'Balanced slow-release fertilizer', notes: 'Feed in spring to support dense growth.' },
    mulching: { months: [9], frequency: 'annually', depth: '50mm', type: 'Fine bark mulch', notes: 'Mulch around base of hedge. Helps retain moisture.' },
    icon: '🌿',
  },
  'Border star': {
    scientificName: 'Lomandra longifolia Border Star',
    type: PLANT_TYPES.ORNAMENTAL_GRASS,
    description: 'Compact lomandra cultivar ideal for borders and mass planting',
    watering: {
      summer: { frequencyDays: 14, depthMm: 15, notes: 'Very drought tolerant' },
      autumn: { frequencyDays: 21, depthMm: 10, notes: 'Occasional deep water' },
      winter: { frequencyDays: 30, depthMm: 10, notes: 'Rarely needed' },
      spring: { frequencyDays: 14, depthMm: 15, notes: 'Moderate' },
    },
    pruning: { months: [8, 9], frequency: 'annually', notes: 'Cut back to 200mm in late winter to rejuvenate.' },
    fertilizing: { months: [9], frequency: 'annually', type: 'Slow-release native fertilizer', notes: 'Light feeding in spring. Very low maintenance.' },
    mulching: { months: [9], frequency: 'annually', depth: '50mm', type: 'Bark chips', notes: 'Mulch between plants for weed suppression.' },
    icon: '⭐',
  },
  'Ornamental Grape vine': {
    scientificName: 'Vitis vinifera Purpurea',
    type: PLANT_TYPES.CLIMBER,
    description: 'Vigorous climber with ornamental purple-red foliage',
    watering: {
      summer: { frequencyDays: 5, depthMm: 25, notes: 'Regular during growing season' },
      autumn: { frequencyDays: 10, depthMm: 15, notes: 'Reduce as leaves drop' },
      winter: { frequencyDays: 21, depthMm: 10, notes: 'Dormant, minimal' },
      spring: { frequencyDays: 7, depthMm: 20, notes: 'Increase with new growth' },
    },
    pruning: { months: [6, 7], frequency: 'annually', notes: 'Heavy prune in winter dormancy. Spur prune to 2-3 buds. Remove dead wood.' },
    fertilizing: { months: [9], frequency: 'annually', type: 'Balanced fertilizer with potassium', notes: 'Feed in early spring. Extra potassium promotes good foliage colour.' },
    mulching: { months: [9], frequency: 'annually', depth: '75mm', type: 'Composted bark or straw', notes: 'Mulch root zone to maintain moisture and suppress weeds.' },
    icon: '🍇',
  },
  'Boston ivy': {
    scientificName: 'Parthenocissus tricuspidata',
    type: PLANT_TYPES.CLIMBER,
    description: 'Self-clinging climber with spectacular autumn colour',
    watering: {
      summer: { frequencyDays: 7, depthMm: 20, notes: 'Moderate watering' },
      autumn: { frequencyDays: 14, depthMm: 15, notes: 'Reduce' },
      winter: { frequencyDays: 21, depthMm: 10, notes: 'Dormant, minimal' },
      spring: { frequencyDays: 10, depthMm: 15, notes: 'Resume as growth starts' },
    },
    pruning: { months: [7, 8, 12], frequency: 'biannually', notes: 'Major prune in late winter. Control growth in summer. Keep clear of gutters and windows.' },
    fertilizing: { months: [9], frequency: 'annually', type: 'Balanced slow-release fertilizer', notes: 'Light feeding in spring. Vigorous grower, avoid over-fertilizing.' },
    mulching: { months: [9], frequency: 'annually', depth: '50mm', type: 'Bark or compost mulch', notes: 'Mulch root zone at base of wall/fence.' },
    icon: '🍃',
  },
};

const PlantCareData = {
  plantCareDatabase,
  PLANT_TYPES,
  SEASONS,
  WEATHER_THRESHOLDS,
  ALERT_DAYS_BEFORE,
  getSeason,

  getPlantCare(plantName) {
    return plantCareDatabase[plantName] || null;
  },

  getAllPlantNames() {
    return Object.keys(plantCareDatabase);
  },

  getPlantsByType(type) {
    return Object.entries(plantCareDatabase)
      .filter(([, data]) => data.type === type)
      .map(([name, data]) => ({ name, ...data }));
  },
};
