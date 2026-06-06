const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export async function validateAccount(username, email) {
  const response = await fetch(`${API_BASE_URL}/api/users/check-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email }),
  })

  return response.status === 409
}

export async function loginAccount(identifier, password) {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier, password }),
  })

  const data = await response.json()
  return response.ok ? data.user : null
}

export async function fetchAccountById(id) {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`)
  const data = await response.json()
  return response.ok ? data : null
}

export async function syncAccountStats(id, coins, xp) {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}/stats`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ coins, xp }),
  })

  const data = await response.json()

  return {
    ok: response.ok,
    status: response.status,
    data,
  }
}

export async function signupAccount(account) {
  const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(account),
  })

  const data = await response.json()

  return {
    ok: response.ok,
    status: response.status,
    data,
  }
}

export async function fetchInventoryForUser(id) {
  const response = await fetch(`${API_BASE_URL}/api/inventory/user/${id}`)
  const data = await response.json()
  return response.ok ? data : []
}

export async function addInventoryItemForUser(userId, itemId, quantity = 1, isEquipped = false) {
  const response = await fetch(`${API_BASE_URL}/api/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      UserID: userId,
      ItemID: itemId,
      Quantity: quantity,
      isEquipped,
    }),
  })

  const data = await response.json()

  return {
    ok: response.ok,
    status: response.status,
    data,
  }
}

export async function updateInventoryItemForUser(userId, itemId, quantity, isEquipped) {
  const response = await fetch(`${API_BASE_URL}/api/inventory/${userId}/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Quantity: quantity,
      isEquipped,
    }),
  })

  const data = await response.json()

  return {
    ok: response.ok,
    status: response.status,
    data,
  }
}

export async function fetchFriendsForUser(id) {
  const response = await fetch(`${API_BASE_URL}/api/friends/user/${id}`)
  const data = await response.json()
  return response.ok ? data : []
}

export async function fetchReceivedFriendRequestsForUser(id) {
  const response = await fetch(`${API_BASE_URL}/api/friendRequests/received/${id}`)
  const data = await response.json()
  return response.ok ? data : []
}

export async function fetchGlobalLeaderboard() {
  const response = await fetch(`${API_BASE_URL}/api/leaderboard`)
  const data = await response.json()
  return response.ok ? data : []
}
