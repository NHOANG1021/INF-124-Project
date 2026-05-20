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
]

export const requests = [
  { name: 'QuestCrafter', level: 12 },
  { name: 'PixelPilot', level: 8 },
]

export const notifications = [
  {
    id: 1,
    type: 'challenge',
    title: 'Daily Challenge Updated',
    body: 'Finish 2 internship applications today.',
    unread: true,
  },
  {
    id: 2,
    type: 'friend',
    title: 'PeterAnteater sent you a friend request',
    body: 'Wants to add you as a friend.',
    unread: true,
  },
]

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
    category: 'Powerups',
    title: 'Double XP',
    price: 1000,
    art: 'xp',
    description: 'Boost rewards for the next streak of completed tasks.',
  },
  {
    id: 5,
    category: 'Powerups',
    title: 'Task Extension',
    price: 750,
    art: 'calendar',
    description: 'Use one extension token when you need extra time.',
  },
  {
    id: 6,
    category: 'Powerups',
    title: 'Custom Avatar',
    price: 1200,
    art: 'avatar',
    description: 'Unlock a personalized profile look and badge frame.',
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
