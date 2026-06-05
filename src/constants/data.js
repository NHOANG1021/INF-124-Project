export const navItems = [
  'Dashboard',
  'Store',
  'Leaderboard',
  'Profile',
  'Friends',
  'Notifications',
]

export const friendList = [
  { name: 'PeterAnteater', level: 42, favorite: true, exp: 85200 },
  { name: 'TopTierDev', level: 45, favorite: false, exp: 98000 },
  { name: 'DataWiz', level: 14, favorite: true, exp: 11900 },
  { name: 'QuestQueen', level: 37, favorite: false, exp: 76100 },
  { name: 'BugHunter', level: 29, favorite: true, exp: 52300 },
  { name: 'PixelPilot', level: 25, favorite: false, exp: 48800 },
  { name: 'TaskTitan', level: 33, favorite: false, exp: 64200 },
  { name: 'StudyStorm', level: 18, favorite: true, exp: 27400 },
  { name: 'CodeComet', level: 31, favorite: false, exp: 59800 },
  { name: 'NightOwl', level: 22, favorite: true, exp: 43600 },
]

const globalOnlyUsers = [
  { name: 'AlphaArc', level: 49, favorite: false, exp: 112300 },
  { name: 'ByteBloom', level: 41, favorite: false, exp: 90750 },
  { name: 'ClutchCraft', level: 39, favorite: false, exp: 83500 },
  { name: 'DeltaDrive', level: 28, favorite: false, exp: 55600 },
  { name: 'EchoEdge', level: 35, favorite: false, exp: 71300 },
  { name: 'FluxFable', level: 16, favorite: false, exp: 20900 },
  { name: 'GlitchGrove', level: 24, favorite: false, exp: 40100 },
  { name: 'HyperHawk', level: 44, favorite: false, exp: 95400 },
  { name: 'IonIris', level: 27, favorite: false, exp: 51900 },
  { name: 'JoltJade', level: 19, favorite: false, exp: 31800 },
]

export const globalList = [...friendList, ...globalOnlyUsers]

export const requests = [
  { name: 'QuestCrafter', level: 12 },
  { name: 'PixelPilot', level: 8 },
]

export const notifications = []

export const storeItems = [
  {
    id: 1,
    category: 'Themes',
    title: 'Dark Theme',
    price: 500,
    art: 'moon',
    description: 'A midnight UI skin for deep-focus work sessions.',
  },
  {
    id: 2,
    category: 'Themes',
    title: 'Space Theme',
    price: 500,
    art: 'planet',
    description: 'A cosmic dashboard with brighter highlights and stars.',
  },
  {
    id: 3,
    category: 'Themes',
    title: 'Forest Theme',
    price: 500,
    art: 'forest',
    description: 'A calm woodland palette for a softer productivity mood.',
  },
  {
    id: 4,
    category: 'Themes',
    title: 'Pink Strawberry Theme',
    price: 650,
    art: 'strawberry',
    description: 'A playful pink UI with sweet berry highlights and soft cards.',
  },
  {
    id: 5,
    category: 'Themes',
    title: 'Orange Citrus Theme',
    price: 650,
    art: 'orange',
    description: 'A bright tangerine theme with warm glow accents and energy.',
  },
  {
    id: 6,
    category: 'Themes',
    title: 'Blue Ocean Theme',
    price: 650,
    art: 'ocean',
    description: 'A refreshing deep-sea palette with cool blues and wave tones.',
  },
  // {
  //   id: 7,
  //   category: 'Powerups',
  //   title: 'Double XP',
  //   price: 1000,
  //   art: 'xp',
  //   description: 'Boost rewards for the next streak of completed tasks.',
  // },
  // {
  //   id: 8,
  //   category: 'Powerups',
  //   title: 'Task Extension',
  //   price: 750,
  //   art: 'calendar',
  //   description: 'Use one extension token when you need extra time.',
  // },
  {
    id: 10,
    category: 'Frames',
    title: 'Strawberry Frame',
    price: 300,
    art: 'frame-strawberry',
    description: 'A rosy berry frame that wraps your avatar in pink highlights.',
  },
  {
    id: 11,
    category: 'Frames',
    title: 'Citrus Frame',
    price: 300,
    art: 'frame-orange',
    description: 'A sunny orange frame for a bold and energetic profile look.',
  },
  {
    id: 12,
    category: 'Frames',
    title: 'Ocean Frame',
    price: 300,
    art: 'frame-ocean',
    description: 'A cool blue frame that gives your avatar a wave-inspired border.',
  },
]

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export const defaultAccount = {
  firstName: 'Task',
  lastName: 'Guide',
  username: 'TaskGuide123',
  email: 'guide@uci.edu',
  password: 'password123',
}
