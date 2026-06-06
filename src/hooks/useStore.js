import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAccountById, syncAccountStats } from '../utils/storage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const defaultStoreState = {
  coins: 1500,
  xp: 320,
  cart: [],
  inventory: [],
  taskExtensionCredits: 0,
  equippedItems: {
    Themes: null,
    Powerups: null,
    Frames: null,
  },
}

function isRepeatableStoreItem(item) {
  return item?.title === 'Task Extension'
}

function getStoreCategory(itemType) {
  const numericType = Number(itemType)

  if (numericType === 1) return 'Themes'
  if (numericType === 2) return 'Powerups'
  if (numericType === 3) return 'Frames'
  return 'Powerups'
}

function formatStoreItem(item) {
  const title = item.ItemName
  const art = item.Art || 'default'
  const isAvatarItem = art === 'avatar' || title === 'Custom Avatar'

  return {
    id: item.ItemID,
    title,
    description: item.Description || 'Store item',
    price: Number(item.Price) || 0,
    category:
      Number(item.ItemType) === 3 && isAvatarItem
        ? 'Powerups'
        : getStoreCategory(item.ItemType),
    art,
    itemType: Number(item.ItemType),
  }
}

export function useStore(profileKey, currentAccount, onAccountUpdate) {
  const [coins, setCoins] = useState(defaultStoreState.coins)
  const [xp, setXp] = useState(defaultStoreState.xp)
  const [cart, setCart] = useState(defaultStoreState.cart)
  const [inventory, setInventory] = useState(defaultStoreState.inventory)
  const [taskExtensionCredits, setTaskExtensionCredits] = useState(
    defaultStoreState.taskExtensionCredits,
  )
  const [storeItems, setStoreItems] = useState([])
  const [storeLoading, setStoreLoading] = useState(true)
  const [storeError, setStoreError] = useState('')
  const [equippedItems, setEquippedItems] = useState(defaultStoreState.equippedItems)
  const [storeFeedback, setStoreFeedback] = useState('')
  const [statsHydrated, setStatsHydrated] = useState(false)
  const [hydratedAccountId, setHydratedAccountId] = useState(null)

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

  useEffect(() => {
    let isActive = true

    async function hydrateStoreState() {
      setStatsHydrated(false)
      setHydratedAccountId(null)
      setCart(defaultStoreState.cart)
      setInventory(defaultStoreState.inventory)
      setTaskExtensionCredits(defaultStoreState.taskExtensionCredits)
      setEquippedItems(defaultStoreState.equippedItems)
      setStoreFeedback('')

      if (!currentAccount?.id) {
        if (!isActive) return
        setCoins(defaultStoreState.coins)
        setXp(defaultStoreState.xp)
        setHydratedAccountId(null)
        setStatsHydrated(true)
        return
      }

      setCoins(Number(currentAccount.coins) || 0)
      setXp(Number(currentAccount.xp) || 0)

      let latestAccount = currentAccount

      try {
        latestAccount = (await fetchAccountById(currentAccount.id)) ?? currentAccount
      } catch (error) {
        console.error('Error hydrating user stats:', error)
      }

      if (!isActive) return

      setCoins(Number(latestAccount.coins) || 0)
      setXp(Number(latestAccount.xp) || 0)
      onAccountUpdate?.(latestAccount)
      setHydratedAccountId(latestAccount.id ?? currentAccount.id)
      setStatsHydrated(true)
    }

    hydrateStoreState()

    return () => {
      isActive = false
    }
  }, [profileKey, currentAccount, onAccountUpdate])

  useEffect(() => {
    if (!statsHydrated || !currentAccount?.id) return
    if (hydratedAccountId !== currentAccount.id) return

    let isCancelled = false

    async function persistStats() {
      const result = await syncAccountStats(currentAccount.id, coins, xp)

      if (!isCancelled && result.ok) {
        onAccountUpdate?.(result.data.user)
      }
    }

    persistStats()

    return () => {
      isCancelled = true
    }
  }, [statsHydrated, hydratedAccountId, currentAccount?.id, coins, xp, onAccountUpdate])

  const ownedItemIds = useMemo(
    () =>
      new Set(
        inventory.filter((item) => !isRepeatableStoreItem(item)).map((item) => item.id),
      ),
    [inventory],
  )
  const cartItemIds = useMemo(
    () =>
      new Set(
        cart.filter((item) => !isRepeatableStoreItem(item)).map((item) => item.id),
      ),
    [cart],
  )
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
  const availableTaskExtensions = taskExtensionCredits

  /** Reward coins and XP atomically (avoids two-render flash). */
  const applyReward = useCallback((coinDelta, xpDelta) => {
    if (coinDelta !== 0) setCoins((c) => Math.max(0, c + coinDelta))
    if (xpDelta !== 0) setXp((x) => Math.max(0, x + xpDelta))
  }, [])

  const addToCart = useCallback(
    (item) => {
      const repeatable = isRepeatableStoreItem(item)

      if (!repeatable && ownedItemIds.has(item.id)) {
        setStoreFeedback(`${item.title} is already in your inventory.`)
        return
      }

      if (!repeatable && cart.some((entry) => entry.id === item.id)) {
        return
      }

      setCart((current) => [
        ...current,
        {
          ...item,
          cartEntryId: repeatable
            ? `${item.id}-${Math.random().toString(36).slice(2, 8)}`
            : String(item.id),
        },
      ])
      setStoreFeedback(
        repeatable
          ? `${item.title} added. You now have ${currentTaskExtensionCount(cart, 1)} extra task slot${currentTaskExtensionCount(cart, 1) === 1 ? '' : 's'} in cart.`
          : `${item.title} added to cart.`,
      )
    },
    [ownedItemIds, cart],
  )

  const removeFromCart = useCallback((cartEntryId) => {
    setCart((current) => current.filter((item) => item.cartEntryId !== cartEntryId))
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
    const purchasedTaskExtensions = cart.filter((item) => isRepeatableStoreItem(item)).length
    setInventory((current) => [
      ...current,
      ...cart.filter(
        (item) =>
          !isRepeatableStoreItem(item) && !current.some((owned) => owned.id === item.id),
      ),
    ])
    if (purchasedTaskExtensions > 0) {
      setTaskExtensionCredits((count) => count + purchasedTaskExtensions)
    }
    setStoreFeedback(
      purchasedTaskExtensions > 0
        ? `Purchase complete. You now have ${taskExtensionCredits + purchasedTaskExtensions} task extension slot${taskExtensionCredits + purchasedTaskExtensions === 1 ? '' : 's'} available.`
        : 'Purchase complete. Your items are now in inventory.',
    )
    setCart([])
  }, [cart, cartTotal, coins, taskExtensionCredits])

  const consumeTaskExtension = useCallback(() => {
    let consumed = false

    setTaskExtensionCredits((count) => {
      if (count <= 0) return count
      consumed = true
      return count - 1
    })

    return consumed
  }, [])

  // Equip an item or unequip by passing null and a category string.
  const equipItem = useCallback((itemOrNull, category) => {
    if (itemOrNull == null) {
      // unequip the specified category
      setEquippedItems((current) => ({ ...current, [category]: null }))
      return
    }
    setEquippedItems((current) => ({ ...current, [itemOrNull.category]: itemOrNull.id }))
  }, [])

  const currentLevel =
    currentAccount?.id != null
      ? Number(currentAccount.level ?? 0)
      : Math.floor(xp / 100) + 1
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
    availableTaskExtensions,
    storeFeedback,

    // actions
    addToCart,
    removeFromCart,
    checkoutCart,
    equipItem,
    consumeTaskExtension,
  }
}

function currentTaskExtensionCount(cart, increment = 0) {
  return cart.filter((item) => isRepeatableStoreItem(item)).length + increment
}
