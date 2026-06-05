import { useCallback, useEffect, useMemo, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

function getStoreCategory(itemType) {
  const numericType = Number(itemType)

  if (numericType === 1) return 'Themes'
  if (numericType === 2) return 'Powerups'
  if (numericType === 3) return 'Frames'
  return 'Powerups'
}

function getStoreArt(itemType) {
  const numericType = Number(itemType)

  if (numericType === 1) return 'theme'
  if (numericType === 2) return 'frame'
  return 'avatar'
}

function formatStoreItem(item) {
  return {
    id: item.ItemID,
    title: item.ItemName,
    description: item.Description || 'Store item',
    price: Number(item.Price) || 0,
    category: getStoreCategory(item.ItemType),
    art: item.Art || 'default',
  }
}

export function useStore() {
  const [coins, setCoins] = useState(1500)
  const [xp, setXp] = useState(320)
  const [cart, setCart] = useState([])
  const [inventory, setInventory] = useState([])
  const [storeItems, setStoreItems] = useState([])
  const [storeLoading, setStoreLoading] = useState(true)
  const [storeError, setStoreError] = useState('')
  const [equippedItems, setEquippedItems] = useState({
    Themes: null,
    Powerups: null,
    Frames: null,
  })
  const [storeFeedback, setStoreFeedback] = useState('')

  useEffect(() => {
    async function fetchStoreItems() {
      try {
        setStoreLoading(true)
        setStoreError('')

        const response = await fetch(`${API_BASE_URL}/api/store`)

        if (!response.ok) {
          throw new Error(`Store request failed with status ${response.status}`)
        }

        const data = await response.json()
        setStoreItems(data.map(formatStoreItem))
      } catch (err) {
        console.error('Error loading store items:', err)
        setStoreError('Could not load store items.')
      } finally {
        setStoreLoading(false)
      }
    }

    fetchStoreItems()
  }, [])

  const ownedItemIds = useMemo(() => new Set(inventory.map((item) => item.id)), [inventory])
  const cartItemIds = useMemo(() => new Set(cart.map((item) => item.id)), [cart])
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart])

  const equippedTheme = useMemo(
    () => inventory.find((item) => item.id === equippedItems.Themes) ?? null,
    [inventory, equippedItems.Themes],
  )

  const equippedAvatar = useMemo(
    () =>
      inventory.find(
        (item) => item.id === equippedItems.Powerups && item.art === 'avatar',
      ) ?? null,
    [inventory, equippedItems.Powerups],
  )

  const equippedFrame = useMemo(
    () => inventory.find((item) => item.id === equippedItems.Frames) ?? null,
    [inventory, equippedItems.Frames],
  )

  /** Reward coins and XP atomically (avoids two-render flash). */
  const applyReward = useCallback((coinDelta, xpDelta) => {
    if (coinDelta !== 0) setCoins((c) => Math.max(0, c + coinDelta))
    if (xpDelta !== 0) setXp((x) => Math.max(0, x + xpDelta))
  }, [])

  const addToCart = useCallback(
    (item) => {
      if (ownedItemIds.has(item.id)) {
        setStoreFeedback(`${item.title} is already in your inventory.`)
        return
      }
      if (!cart.some((entry) => entry.id === item.id)) {
        setCart((current) => [...current, item])
        setStoreFeedback(`${item.title} added to cart.`)
      }
    },
    [ownedItemIds, cart],
  )

  const removeFromCart = useCallback((itemId) => {
    setCart((current) => current.filter((item) => item.id !== itemId))
  }, [])

  const checkoutCart = useCallback(() => {
    if (cart.length === 0) {
      setStoreFeedback('Add items to your cart before checking out.')
      return
    }
    if (cartTotal > coins) {
      setStoreFeedback('Not enough coins for this purchase.')
      return
    }
    setCoins((c) => c - cartTotal)
    setInventory((current) => [
      ...current,
      ...cart.filter((item) => !current.some((owned) => owned.id === item.id)),
    ])
    setStoreFeedback('Purchase complete. Your items are now in inventory.')
    setCart([])
  }, [cart, cartTotal, coins])

  // Equip an item or unequip by passing null and a category string.
  const equipItem = useCallback((itemOrNull, category) => {
    if (itemOrNull == null) {
      // unequip the specified category
      setEquippedItems((current) => ({ ...current, [category]: null }))
      return
    }
    setEquippedItems((current) => ({ ...current, [itemOrNull.category]: itemOrNull.id }))
  }, [])

  const currentLevel = Math.floor(xp / 100) + 1
  const xpIntoLevel = xp % 100
  const xpGoal = 100

  return {
    // currency
    coins,
    xp,
    currentLevel,
    xpIntoLevel,
    xpGoal,
    applyReward,

    // store
    storeItems,
    storeLoading,
    storeError,
    cart,
    cartTotal,
    cartItemIds,
    inventory,
    ownedItemIds,
    equippedItems,
    equippedTheme,
    equippedAvatar,
    equippedFrame,
    storeFeedback,

    // actions
    addToCart,
    removeFromCart,
    checkoutCart,
    equipItem,
  }
}